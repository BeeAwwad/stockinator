import { supabase } from "@/lib/supabaseClient";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { TransactionProps } from "@/lib/types";
import { useEffect } from "react";

function subscribeToTransactions(businessId: string, queryClient: QueryClient) {
  return supabase
    .channel(`transactions:${businessId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transcations",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const inserted = payload.new as TransactionProps;

          queryClient.setQueryData<TransactionProps[]>(
            ["transactions", businessId],
            (old) => [inserted, ...(old || [])]
          );
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as TransactionProps;
          queryClient.setQueryData<TransactionProps[]>(
            ["transactions", businessId],
            (old) => old?.map((t) => (t.id === updated.id ? updated : t))
          );
        } else if (payload.eventType === "DELETE") {
          const deleted = payload.new as TransactionProps;
          queryClient.setQueryData<TransactionProps[]>(
            ["transactions", businessId],
            (old) => old?.filter((t) => (t.id === deleted.id ? deleted : t))
          );
        }
      }
    )
    .subscribe();
}

export function useTransactionsRealtime(businessId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    const channel = subscribeToTransactions(businessId, queryClient);

    return () => {
      channel.unsubscribe();
    };
  }, [businessId, queryClient]);
}
