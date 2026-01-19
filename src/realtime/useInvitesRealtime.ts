import { supabase } from "@/lib/supabaseClient";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { InviteProps } from "@/lib/types";
import { useEffect } from "react";

function subscribeToInvites(businessId: string, queryClient: QueryClient) {
  return supabase
    .channel(`invites:${businessId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "invites",
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const inserted = payload.new as InviteProps;

          queryClient.setQueryData<InviteProps[]>(
            ["invites", businessId],
            (old) => [inserted, ...(old || [])],
          );
        } else if (payload.eventType === "DELETE") {
          const deleted = payload.new as InviteProps;
          queryClient.setQueryData<InviteProps[]>(
            ["invites", businessId],
            (old) => old?.filter((i) => (i.id === deleted.id ? deleted : i)),
          );
        }
      },
    )
    .subscribe();
}

export function useInvitesRealtime(businessId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    const channel = subscribeToInvites(businessId, queryClient);

    return () => {
      channel.unsubscribe();
    };
  }, [businessId, queryClient]);
}
