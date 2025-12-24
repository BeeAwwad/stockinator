import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import type {
  ProductProps,
  InviteProps,
  ProfileProps,
  TransactionProps,
} from "@/lib/types";
import { AuthContext } from "./AuthContext";
import { useOnlineStatus } from "@/hook/useOnlineStatus";
import { offlineDB } from "@/lib/offlineDB";
import { useNavigate } from "react-router-dom";

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [invites, setInvites] = useState<InviteProps[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [vendors, setVendors] = useState<ProfileProps[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  const loadProfile = async (userId: string) => {
    try {
      if (!userId) {
        console.warn("loadProfile called with invalid userId:", userId);
        return;
      }
      console.log("loading profile...");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error.message);
        return;
      }
      localStorage.setItem("profile", JSON.stringify(data));
      setProfile(data);
    } catch {
      const catched = localStorage.getItem("profile");
      if (catched) setProfile(JSON.parse(catched));
    }
  };

  const reloadProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const initialize = async () => {
    setProfileLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    const catchedProfile = localStorage.getItem("profile");

    if (session?.user) {
      setSession(session);
      setUser(session.user);
      console.log("laoding profile");

      try {
        await loadProfile(session.user.id);
      } catch {
        if (catchedProfile) setProfile(JSON.parse(catchedProfile));
        setProfileLoading(false);
      }
    } else if (catchedProfile) {
      setProfile(JSON.parse(catchedProfile));
      setProfileLoading(false);
    } else {
      setUser(null);
      setProfile(null);
      setProfileLoading(false);
    }

    setProfileLoading(false);
  };

  useEffect(() => {
    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession ?? null);

        if (newSession?.user) {
          setUser(newSession.user);
          loadProfile(newSession.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function syncOfflineTransactions() {
    const pending = await offlineDB.getAll("pending_transactions");

    setTransactionsLoading(true);
    for (const tx of pending) {
      const { is_offline, id, ...cleanTx } = tx;
      console.log("removing offline flags:", is_offline, id);
      const { data, error } = await supabase
        .from("transactions")
        .insert(cleanTx)
        .select()
        .single();

      if (!error) {
        await offlineDB.delete("pending_transactions", tx.id);

        setTransactions((prev) => prev.map((t) => (t.id === tx.id ? data : t)));
        setTransactionsLoading(false);
        toast.success("transactions synced");
      }
    }
  }

  useEffect(() => {
    if (isOnline) syncOfflineTransactions();
  }, [isOnline]);

  const loadBusinessName = async () => {
    if (!profile) return;

    if (profile.business_id) {
      const { data: businessData } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", profile.business_id)
        .single();

      if (businessData) {
        setBusinessName(businessData.name);
      }
    }
  };

  useEffect(() => {
    setBusinessName("");
    setInvites([]);
    setProducts([]);
    setVendors([]);
    setTransactions([]);

    if (profile?.id) {
      loadInvites();
    }
    if (profile?.business_id) {
      loadBusinessName();
      loadProducts();
    }
  }, [profile?.id, profile?.business_id]);

  // Load Invites
  const loadInvites = async () => {
    if (!isOnline || !profile?.id) return;

    setInvitesLoading(true);

    let query = supabase
      .from("invites")
      .select(
        "*, inviter:profiles!invites_invited_by_fkey(email), invited:profiles!invites_invited_user_id_fkey(email)"
      )
      .order("created_at", { ascending: false });

    if (profile.role === "owner" && profile.business_id) {
      query = query.eq("business_id", profile.business_id);
    } else {
      query = query.eq("invited_user_id", profile.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching invites:", error);
      setInvitesLoading(false);
    } else {
      setInvites(data ?? []);
      console.log("invites reloaded", invites);
    }
    setInvitesLoading(false);
  };

  useEffect(() => {
    if (!profile?.id) return;

    let filter = "";

    if (profile.role === "owner" && profile.business_id) {
      filter = `business_id=eq.${profile.business_id}`;
    } else {
      filter = `invited_user_id=eq.${profile.id}`;
    }

    const channel = supabase
      .channel("invites-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invites",
          filter,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("invite inserted");
            loadInvites();
          } else if (payload.eventType === "DELETE") {
            console.log("invite deleted");
            loadInvites();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.business_id]);

  // Products
  const loadProducts = async () => {
    if (!isOnline || !profile?.business_id) return;
    setProductsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", profile?.business_id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Failed to load products.");
      return;
    }
    setProducts(
      data.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      })
    );
    setProductsLoading(false);
  };

  useEffect(() => {
    if (profile?.business_id) loadProducts();
  }, [profile?.business_id]);

  useEffect(() => {
    if (!profile?.business_id) return;

    const channel = supabase
      .channel(`products:${profile?.business_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
          filter: `business_id=eq.${profile.business_id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProducts((prev) =>
              [...prev, payload.new as ProductProps].sort((a, b) => {
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              })
            );
          } else if (payload.eventType === "UPDATE") {
            setProducts((prev) =>
              prev
                .map((p) =>
                  p.id === payload.new.id ? (payload.new as ProductProps) : p
                )
                .sort((a, b) => {
                  return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                  );
                })
            );
          } else if (payload.eventType === "DELETE") {
            setProducts((prev) =>
              prev
                .filter((p) => p.id !== payload.old.id)
                .sort((a, b) => {
                  return (
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                  );
                })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // Load vendors
  const loadVendors = async () => {
    if (!isOnline || !profile?.id) return;

    const { error, data } = await supabase
      .from("profiles")
      .select("*")
      .eq("business_id", profile?.business_id)
      .eq("role", "vendor");
    setVendors(data || []);
    if (error) {
      console.error(error);
      toast.error("Failed to load vendors");
      setVendorsLoading(false);
    }
    setVendorsLoading(false);
  };

  useEffect(() => {
    if (isOnline) {
      loadVendors();
    }
  }, [profile?.business_id, isOnline]);

  useEffect(() => {
    if (!profile?.business_id) return;

    const channel = supabase
      .channel("vendorlist-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `business_id=eq.${profile?.business_id}`,
        },
        (payload) => {
          const newProfile = payload.new as ProfileProps | undefined;

          if (newProfile?.role === "vendor") {
            setVendors((prev) => {
              const filtered = prev.filter((v) => v.id !== newProfile.id);
              return [...filtered, payload.new as ProfileProps];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // Load Transactions

  const loadTransactions = async () => {
    if (!isOnline || !profile?.id) return;

    setTransactionsLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, created_by_email:profiles!transactions_created_by_fkey(email)"
      )
      .eq("business_id", profile?.business_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load transactions");
      return;
    }
    setTransactions(data);
    setTransactionsLoading(false);
  };

  useEffect(() => {
    if (!profile?.business_id) return;
    loadTransactions();
  }, [profile?.business_id]);

  useEffect(() => {
    if (!profile?.business_id) return;

    const channel = supabase
      .channel(`transactions-${profile?.business_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `business_id=eq.${profile?.business_id}`,
        },
        (payload) => {
          console.log("Realtime transaction change:", payload);
          if (payload.eventType === "INSERT") {
            setTransactionsLoading(true);
            setTransactions((prev) => [
              ...prev,
              payload.new as TransactionProps,
            ]);
            setTransactionsLoading(false);
          } else if (payload.eventType === "UPDATE") {
            setTransactionsLoading(true);
            setTransactions((prev) =>
              prev.map((tx) =>
                tx.id === payload.new.id
                  ? (payload.new as TransactionProps)
                  : tx
              )
            );
            setTransactionsLoading(false);
          } else if (payload.eventType === "DELETE") {
            setTransactionsLoading(true);
            setTransactions((prev) =>
              prev.filter((tx) => tx.id !== payload.old.id)
            );
            setTransactionsLoading(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // Login Signup
  const signUpNewUser = async (email: string, password: string) => {
    console.log("sign in data:", email, password);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.log("Error signing up:", error);
      toast.error("Failed to sign-up");
      return { success: false, error: error.message };
    }
    toast.success("Sign-up successful!");
    return { success: true, data };
  };

  const signOutUser = async () => {
    setSignOutLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      toast.error("Failed to sign-out");
    }
    setSignOutLoading(false);
    navigate("/login");
    toast.success("Signed out successfully!");
  };

  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error(error.message);
        toast.error("Failed to sign-in");
        return { success: false, error: error.message };
      }
      toast.success("Sign-in successful!");
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected error signing in:", error);
      toast.error("An unexpected error occurred.");
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        profileLoading,
        reloadProfile,
        invites,
        invitesLoading,
        setInvites,
        businessName,
        products,
        setProducts,
        productsLoading,
        setProductsLoading,
        vendors,
        vendorsLoading,
        setVendors,
        transactions,
        setTransactions,
        transactionsLoading,
        setTransactionsLoading,
        signOutLoading,

        signUpNewUser,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
