import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import type { ProfileProps } from "@/lib/types";

export function useProfile() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ProfileProps> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        toast.error(error?.message ?? "Error fetching profile.");
        throw error;
      }
      return data;
    },
  });
}
