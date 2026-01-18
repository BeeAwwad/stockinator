import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { TransactionProps } from "@/lib/types";

export function useTransactions(businessId: string) {
  return useQuery({
    queryKey: ["transactions", businessId],
    enabled: !!businessId,
    queryFn: async (): Promise<TransactionProps[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          "*, created_by_email:profiles!transactions_created_by_fkey(email), items:transaction_items(id, transaction_id, product_id, quantity, unit_price, products(name))"
        )
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error?.message ?? "Error fetching transactions.");
        throw error;
      }

      return data;
    },
  });
}
