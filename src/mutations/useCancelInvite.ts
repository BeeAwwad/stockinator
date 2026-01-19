import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useProfile } from "@/queries/useProfile";

export function useCancelInvite() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("invites").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Invite cancelled.");
      queryClient.invalidateQueries({
        queryKey: ["invites", profile?.business_id],
      });
    },
    onError: () => {
      toast.error("Failed to cancel invite");
    },
  });
}
