import { useState, Activity } from "react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemActions,
} from "@/components/ui/item";
import { Loader2, Bell } from "lucide-react";
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
  const { profile, invites, invitesLoading, reloadProfile } = useAuth();
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
        .delete()
        .eq("id", id);

      if (updateInviteErr) throw updateInviteErr;

      await reloadProfile();

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

  const personalInvites = invites.filter(
    (invite) => invite.invited_user_id === profile.id
  );

  console.log({ personalInvites });

  return (
    <div className="space-y-4">
      <h2 className="text-3xl scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">Notifications</h2>

      <Activity mode={personalInvites.length === 0 ? "visible" : "hidden"}>
        <p className="text-muted-foreground">No notifications</p>
      </Activity>

      <Activity mode={invitesLoading ? "visible" : "hidden"}>
        <div className="flex justify-center items-center py-20">
          <p>Loading Invites</p> <Loader2 className="animate-spin" />
        </div>
      </Activity>

      {personalInvites.map((invite) => (
        <Item key={invite.id}>
          <ItemMedia>
            <Bell className="size-5" />
          </ItemMedia>
          <ItemContent>
            <ItemDescription>
              You’ve been invited by <strong>{invite.inviter?.email}</strong> to
              join a business.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
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
          </ItemActions>
        </Item>
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
