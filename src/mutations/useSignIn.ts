import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export function useSignIn() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Sign-in successful!");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to sign-in");
    },
  });
}
