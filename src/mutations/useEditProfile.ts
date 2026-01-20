import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useProfile } from "@/queries/useProfile";
import type { Dispatch, SetStateAction } from "react";

export function useEditProfile() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  return useMutation({
    mutationFn: async ({
      displayName,
      email,
      setOpen,
    }: {
      displayName: string;
      email: string;
      setOpen: Dispatch<SetStateAction<boolean>>;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          email: email,
        })
        .eq("id", profile?.id);

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already in use by another account.");
        } else {
          toast.error("Update failed.");
        }
        throw error;
      }
      setOpen(false);
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
    onError: () => {
      toast.error("Failed to update profile.");
    },
  });
}
