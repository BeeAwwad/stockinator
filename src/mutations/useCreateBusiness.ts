import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (businessName: string) => {
      const { error: bizErr } = await supabase.rpc("create_new_business", {
        biz_name: businessName,
      });

      if (bizErr) {
        throw bizErr;
      }
      navigate("/");
    },
    onSuccess: () => {
      toast.success("Business created.");
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
    onError: () => {
      toast.error("Failed to accept create business.");
    },
  });
}
