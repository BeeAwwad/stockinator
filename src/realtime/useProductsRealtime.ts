import { supabase } from "@/lib/supabaseClient";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { ProductProps } from "@/lib/types";
import { useEffect } from "react";

function subscribeToProducts(businessId: string, queryClient: QueryClient) {
  return supabase
    .channel(`products:${businessId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "products",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const inserted = payload.new as ProductProps;

          queryClient.setQueryData<ProductProps[]>(
            ["products", businessId],
            (old) => [inserted, ...(old || [])]
          );
        } else if (payload.eventType === "UPDATE") {
          const updated = payload.new as ProductProps;
          queryClient.setQueryData<ProductProps[]>(
            ["products", businessId],
            (old) => old?.map((p) => (p.id === updated.id ? updated : p))
          );
        } else if (payload.eventType === "DELETE") {
          const deleted = payload.new as ProductProps;
          queryClient.setQueryData<ProductProps[]>(
            ["products", businessId],
            (old) => old?.filter((p) => (p.id === deleted.id ? deleted : p))
          );
        }
      }
    )
    .subscribe();
}

export function useProductRealtime(businessId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    const channel = subscribeToProducts(businessId, queryClient);

    return () => {
      channel.unsubscribe();
    };
  }, [businessId, queryClient]);
}
