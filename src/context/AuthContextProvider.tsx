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

  const loadProfile = async (userId: string) => {
    console.log("load profile", userId);

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

    console.log("profile load result:", data, error);

    if (error) {
      console.error("Error loading profile:", error.message);
      return;
    }

    return setProfile(data);
  };

  const reloadProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const initialize = async () => {
    setProfileLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    setSession(session);

    console.log("session:", session);

    if (session?.user) {
      setUser(session.user);
      console.log("laoding profile");
      await loadProfile(session.user.id);
    } else {
      setUser(null);
      setProfile(null);
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

  const loadInvites = async (profileId: string) => {
    if (!profileId) return;

    setInvitesLoading(true);

    const { data, error } = await supabase
      .from("invites")
      .select("*, inviter:profiles!invites_invited_by_fkey(email)")
      .eq("invited_user_id", profileId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching invites:", error);
    } else {
      setInvites(data ?? []);
    }
    setInvitesLoading(false);
  };

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
      loadInvites(profile.id);
    }
    if (profile?.business_id) {
      loadBusinessName();
      loadProducts();
    }
  }, [profile?.id]);

  // Load Invites
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel("invites-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invites",
          filter: `invited_user_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setInvites((prev) => [payload.new as InviteProps, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setInvites((prev) =>
              prev.map((i) =>
                i.id === payload.new.id ? (payload.new as InviteProps) : i
              )
            );
          } else if (payload.eventType === "DELETE") {
            setInvites((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  // Products
  const loadProducts = async () => {
    setProductsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", profile?.business_id);
    if (error) {
      console.error(error);
      toast.error("Failed to load products.");
      return;
    }
    setProducts(data || []);
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
            setProducts((prev) => [...prev, payload.new as ProductProps]);
          } else if (payload.eventType === "UPDATE") {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as ProductProps) : p
              )
            );
          } else if (payload.eventType === "DELETE") {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.business_id]);

  // Load vendors
  const loadVendors = async () => {
    if (!profile) return;
    if (profile.role !== "owner") return;

    setVendorsLoading(true);
    const { error: vendorErr, data: vendorList } = await supabase
      .from("profiles")
      .select("*")
      .eq("business_id", profile.business_id)
      .eq("role", "vendor");
    setVendors(vendorList || []);

    if (vendorErr) throw vendorErr;
    // fetch invites
    const { error: inviteErr, data: inviteList } = await supabase
      .from("invites")
      .select("*")
      .eq("business_id", profile.business_id);

    setInvites(inviteList || []);

    if (inviteErr) throw inviteErr;

    setVendorsLoading(false);
  };

  useEffect(() => {
    loadVendors();
  });

  useEffect(() => {
    // Realtime subscriptions
    if (profile?.role !== "owner") return;

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
  });

  // Load Transactions

  const loadTransactions = async () => {
    setTransactionsLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
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
    if (!profile?.id) return;
    loadTransactions();
  }, [profile?.id]);

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
              payload.new as TransactionProps,
              ...prev,
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
  });

  // Login Signup
  const signUpNewUser = async (email: string, password: string) => {
    console.log("sign in data:", email, password);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.log("Error signing up:", error);
      toast.error(error.message);
      return { success: false, error: error.message };
    }
    toast.success("Sign-up successful!");
    return { success: true, data };
  };

  const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully!");
    }
  };

  const signInUser = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
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
        businessName,
        products,
        productsLoading,
        vendors,
        vendorsLoading,
        transactions,
        setTransactions,
        transactionsLoading,

        signUpNewUser,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
