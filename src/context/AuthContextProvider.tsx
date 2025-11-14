import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import type { ProfileProps } from "@/lib/types";
import { AuthContext } from "./AuthContext";

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

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
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    setSession(session);

    if (session?.user) {
      setUser(session.user);
      await loadProfile(session.user.id);
    } else {
      setUser(null);
      setProfile(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession ?? null);

        if (newSession?.user) {
          setUser(newSession.user);
          await loadProfile(newSession.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUpNewUser = async (email: string, password: string) => {
    console.log("data:", email, password);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("Error signing up:", error);
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
        loading,
        reloadProfile,
        signUpNewUser,
        signInUser,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
