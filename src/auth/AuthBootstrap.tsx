import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabaseClient";

export default function AuthBootstrap() {
  const { setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuth(data.session);
      } else {
        clearAuth();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setAuth(session);
        } else {
          clearAuth();
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [setAuth, clearAuth]);

  return null;
}
