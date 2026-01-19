import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { ProfileProps } from "@/lib/types";

export function useVendors(businessId: string) {
  return useQuery({
    queryKey: ["vendors", businessId],
    enabled: !!businessId,
    queryFn: async (): Promise<ProfileProps[]> => {
      const { error, data } = await supabase
        .from("profiles")
        .select("*")
        .eq("business_id", businessId)
        .eq("role", "vendor");

      if (error) {
        toast.error(error?.message ?? "Error fetching vendors.");
        throw error;
      }

      return data;
    },
  });
}
