import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { createContext, useEffect, useContext, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  signUpNewUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  signInUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  signUpNewUser: async () => ({ success: false }),
  signInUser: async () => ({ success: false }),
  signOutUser: async () => {},
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);

  const signUpNewUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error("Error signing up:", error.message);
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
        console.error("Error signing in:", error.message);
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
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, signUpNewUser, signInUser, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
