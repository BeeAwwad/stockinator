import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useProfile } from "@/queries/useProfile";
import { useNavigate } from "react-router-dom";

export function useDeleteBusiness() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_business", {
        target_business_id: profile?.business_id,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invites"],
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["vendors"],
      });

      toast.success("business deleted.");
    },
    onError: () => {
      toast.error("Failed to delete business");

      navigate("/register-business");
    },
  });
}
