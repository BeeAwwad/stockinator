import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

type AuthState = {
  session: Session | null;
  user: User | null;
  setAuth: (session: Session | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  setAuth: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),
  clearAuth: () => set({ session: null, user: null }),
}));
