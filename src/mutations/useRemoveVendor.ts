import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useProfile } from "@/queries/useProfile";

export function useRemoveVendor() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("remove_vendor_from_business", {
        target_user_id: id,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Vendor removed.");
      queryClient.invalidateQueries({
        queryKey: ["vendors", profile?.business_id],
      });
    },
    onError: () => {
      toast.error("Failed to remove vendor.");
    },
  });
}
