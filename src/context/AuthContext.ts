import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { ProfileProps } from "@/lib/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProfileProps | null;
  loading: boolean;

  reloadProfile: () => Promise<void>;

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

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  reloadProfile: async () => {},

  signUpNewUser: async () => ({ success: false }),
  signInUser: async () => ({ success: false }),
  signOutUser: async () => {},
});
