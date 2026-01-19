import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { InviteProps, ProfileProps } from "@/lib/types";

export function useInvites(profile: ProfileProps | undefined) {
  return useQuery({
    queryKey: ["invites", profile?.business_id],
    enabled: !!profile?.business_id,
    queryFn: async (): Promise<InviteProps[]> => {
      let query = supabase
        .from("invites")
        .select(
          "*, inviter:profiles!invites_invited_by_fkey(email), invited:profiles!invites_invited_user_id_fkey(email)",
        )
        .order("created_at", { ascending: false });

      if (profile?.role === "owner" && profile?.business_id) {
        query = query.eq("business_id", profile.business_id);
      } else {
        query = query.eq("invited_user_id", profile?.id);
      }

      const { data, error } = await query;

      if (error) {
        toast.error(error?.message ?? "Error fetching products.");
        throw error;
      }

      return data;
    },
  });
}
