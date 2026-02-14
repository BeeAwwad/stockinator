import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export function useSignOut() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      clearAuth();
      toast.success("Signed out successfully!");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to sign out");
    },
  });
}
