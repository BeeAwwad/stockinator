import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { ProfileProps } from "@/lib/types";

export function useAddVendors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profile,
      vendorEmail,
    }: {
      profile: ProfileProps;
      vendorEmail: string;
    }) => {
      try {
        const { data: vendorProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", vendorEmail)
          .single();

        if (profileError || !vendorProfile) {
          toast.error("User with email doesn't exist.");
          return;
        }

        const { error: insertInviteError } = await supabase
          .from("invites")
          .insert({
            invited_user_id: vendorProfile.id,
            business_id: profile.business_id,
            invited_by: profile?.id,
          });

        if (insertInviteError) {
          if (insertInviteError.code === "23505") {
            toast.error("This user has already been invited");
          } else {
            console.log("Failed to invite vendor: ", insertInviteError.message);
            toast.error("Failed to invite vendor. Please try again.");
          }
          return;
        }
        toast.success("Vendor invited successfully!");
      } catch (err) {
        console.error("Failed to invite vendor:", err);
        toast.error("Failed to invite vendor. Please try again.");
      }
    },

    onSuccess: (_data, variables) => {
      toast.success("Vendor added sucessfully");

      queryClient.invalidateQueries({
        queryKey: ["vendors", variables.profile.business_id],
      });
    },

    onError: (error) => {
      console.error(error);
      toast.error("Failed to add vendor");
    },
  });
}
