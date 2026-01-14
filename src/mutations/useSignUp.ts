import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export function useSignUp() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sign-up successful!!");
    },
    onError: (error) => {
      toast.error(error?.message ?? "Error signing up.");
    },
  });
}
