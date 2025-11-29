import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { InviteProps } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hook/useAuth";

export default function Notifications() {
  const navigate = useNavigate();
  const { profile, invites, invitesLoading } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteProps | null>(
    null
  );

  if (!profile) {
    navigate("/login");
    return;
  }

  const handleAcceptInvite = async (invite: InviteProps) => {
    if (!profile) return;
    const { id, business_id } = invite;

    try {
      if (!id || !business_id) {
        toast.error("Invalid invite data.");
      }
      const { error: updateProfileErr } = await supabase
        .from("profiles")
        .update({ business_id: business_id, role: "vendor" })
        .eq("id", profile.id);

      if (updateProfileErr) throw updateProfileErr;

      const { error: updateInviteErr } = await supabase
        .from("invites")
        .update({ status: "accepted" })
        .eq("id", id);

      if (updateInviteErr) throw updateInviteErr;

      toast.success("Invite accepted! You've joined the business.");
      setInviteDialogOpen(false);
      setSelectedInvite(null);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept invite.");
      setInviteDialogOpen(false);
      setSelectedInvite(null);
    }
  };

  const handleDeclineInvite = async (invite: InviteProps) => {
    if (!profile) return;
    const { id, invited_by } = invite;

    try {
      if (!id || !invited_by) {
        toast.error("Invalid invite data");
        throw new Error("Missing IDs");
      }

      const { error: updateErr } = await supabase
        .from("invites")
        .update({ status: "declined" })
        .eq("id", id);

      if (updateErr) throw updateErr;

      toast.success("Invite declined.");
    } catch (error) {
      console.error(error);
      toast.error("Error declining invite.");
    }
  };
  if (invitesLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p>Loading Invites</p> <Loader2 className="animate-spin" />
      </div>
    );
  }

  const personalInvites = invites.filter((invite) => invite.invited_user_id === profile.id)

  if (personalInvites.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No Notifications
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>

      {personalInvites.length === 0 && (
        <p className="text-muted-foreground">No notifications</p>
      )}

      {personalInvites.map((invite) => (
        <div
          key={invite.id}
          className="border rounded-lg p-4 shadow-sm bg-white"
        >
          {invite.status === "pending" && (
            <div>
              <p>
                You’ve been invited by <strong>{invite.inviter?.email}</strong>{" "}
                to join a business.
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedInvite(invite);
                  setInviteDialogOpen(true);
                }}
                className="mt-2"
              >
                Respond
              </Button>
            </div>
          )}
        </div>
      ))}

      <AlertDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept or Decline Invite</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to accept the invite from{" "}
              <strong>{selectedInvite?.inviter?.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <Button
              variant="default"
              onClick={() => {
                if (!selectedInvite) return;
                handleAcceptInvite(selectedInvite);
              }}
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedInvite) return;
                handleDeclineInvite(selectedInvite);
              }}
            >
              Decline
            </Button>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
