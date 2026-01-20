import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("accept_business_invite", {
        invite_id: id,
      });

      if (error) {
        toast.error("Failed to accept invite.");
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Invite accepted.");
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
    onError: () => {
      toast.error("Failed to accept invite.");
    },
  });
}
