import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useProfile } from "./useProfile";

export function useBusinessName() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["business_name", profile?.business_id],
    enabled: !!profile?.business_id,
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", profile?.business_id)
        .single();

      if (error) throw error;

      return data.name;
    },
  });
}
