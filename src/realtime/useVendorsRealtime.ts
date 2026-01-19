import { supabase } from "@/lib/supabaseClient";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { ProfileProps } from "@/lib/types";
import { useEffect } from "react";

function subscribeToVendors(businessId: string, queryClient: QueryClient) {
  return supabase
    .channel(`vendors:${businessId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "profiles",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        const newVendor = payload.new as ProfileProps;

        if (newVendor?.role === "vendor") {
          queryClient.invalidateQueries({
            queryKey: ["vendors", businessId],
          });
        }
      },
    )
    .subscribe();
}

export function useVendorsRealtime(businessId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    const channel = subscribeToVendors(businessId, queryClient);

    return () => {
      channel.unsubscribe();
    };
  }, [businessId, queryClient]);
}
