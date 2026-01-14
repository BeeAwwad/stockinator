import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export function useProducts(businessId: string) {
  return useQuery({
    queryKey: ["products", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error?.message ?? "Error fetching products.");
        throw error;
      }

      return data;
    },
  });
}
