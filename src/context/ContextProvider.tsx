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
import { Context } from "./Context";
import { useNavigate } from "react-router-dom";
import { useOnlineStatus } from "@/hook/useOnlineStatus";
import {
  loadProfile,
  loadBusinessName,
  loadInvites,
  loadProducts,
  loadVendors,
  loadTransactions,
} from "@/lib/functions";

export const ContextProvider = ({ children }: { children: ReactNode }) => {
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
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  const reloadProfile = async () => {
    if (user) await loadProfile({ userId: user.id, setProfile });
  };

  const initialize = async () => {
    setProfileLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (session?.user) {
      setSession(session);
      setUser(session.user);
      console.log("laoding profile");

      await loadProfile({ userId: session.user.id, setProfile });
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
          loadProfile({ userId: newSession.user.id, setProfile });
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setBusinessName("");
    setInvites([]);
    setProducts([]);
    setVendors([]);
    setTransactions([]);

    if (profile?.id) {
      loadInvites({
        isOnline,
        profile,
        setInvites,
        setInvitesLoading,
        invites,
      });
    }
    if (profile?.business_id) {
      loadBusinessName({ profile, setBusinessName });
      loadProducts({ isOnline, profile, setProducts, setProductsLoading });
    }
  }, [profile?.id, profile?.business_id]);

  // Load Invites
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
            loadInvites({
              isOnline,
              profile,
              setInvites,
              setInvitesLoading,
              invites,
            });
          } else if (payload.eventType === "DELETE") {
            console.log("invite deleted");
            loadInvites({
              isOnline,
              profile,
              setInvites,
              setInvitesLoading,
              invites,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.business_id]);

  // Products

  useEffect(() => {
    if (profile?.business_id)
      loadProducts({ isOnline, profile, setProducts, setProductsLoading });
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

  useEffect(() => {
    if (isOnline && profile) {
      loadVendors({ isOnline, profile, setVendors, setVendorsLoading });
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

  useEffect(() => {
    if (!profile?.business_id) return;
    loadTransactions({
      isOnline,
      profile,
      setTransactions,
      setTransactionsLoading,
    });
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
            loadTransactions({
              isOnline,
              profile,
              setTransactions,
              setTransactionsLoading,
            });
            setTransactionsLoading(false);
          } else if (payload.eventType === "UPDATE") {
            setTransactionsLoading(true);
            loadTransactions({
              isOnline,
              profile,
              setTransactions,
              setTransactionsLoading,
            });
            setTransactionsLoading(false);
          } else if (payload.eventType === "DELETE") {
            setTransactionsLoading(true);
            loadTransactions({
              isOnline,
              profile,
              setTransactions,
              setTransactionsLoading,
            });
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
    <Context.Provider
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
    </Context.Provider>
  );
};
