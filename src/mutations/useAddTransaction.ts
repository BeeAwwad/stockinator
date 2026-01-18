import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type TransactionItemInput = {
  product_id: string;
  quantity: number;
  unit_price: number;
};

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      payload,
    }: {
      businessId: string;
      payload: TransactionItemInput[];
    }) => {
      const { error } = await supabase.rpc("create_transaction", {
        bid: businessId,
        items: payload,
      });

      if (error) throw error;
    },

    onSuccess: (_data, variables) => {
      toast.success("Transaction added sucessfully");

      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.businessId],
      });
    },

    onError: (error) => {
      console.error(error);
      toast.error("Failed to add transaction");
    },
  });
}
