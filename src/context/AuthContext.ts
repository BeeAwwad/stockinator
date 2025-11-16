import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { InviteProps, ProductProps, ProfileProps } from "@/lib/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProfileProps | null;
  profileLoading: boolean;
  invites: InviteProps[] | [];
  invitesLoading: boolean;
  businessName: string;
  products: ProductProps[] | [];

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
  profileLoading: true,
  invites: [],
  invitesLoading: true,
  businessName: "",
  products: [],

  reloadProfile: async () => {},

  signUpNewUser: async () => ({ success: false }),
  signInUser: async () => ({ success: false }),
  signOutUser: async () => {},
});
