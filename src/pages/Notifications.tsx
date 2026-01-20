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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAcceptInvite } from "@/mutations/useAcceptInvite";
import { useProfile } from "@/queries/useProfile";
import { useInvites } from "@/queries/useInvites";
import { useCancelInvite } from "@/mutations/useCancelInvite";

export default function Notifications() {
  const navigate = useNavigate();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteProps | null>(
    null,
  );
  const { data: profile } = useProfile();
  const { data: invites, isLoading: invitesLoading } = useInvites(profile);
  const { mutate: acceptInvite } = useAcceptInvite();
  const { mutate: declineInvite } = useCancelInvite();

  if (!profile) {
    navigate("/login");
    return;
  }

  const handleAcceptInvite = async (invite: InviteProps) => {
    if (!profile) return;
    try {
      acceptInvite(invite.id);
      setInviteDialogOpen(false);
      setSelectedInvite(null);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      setInviteDialogOpen(false);
      setSelectedInvite(null);
    }
  };

  const handleDeclineInvite = async (invite: InviteProps) => {
    if (!profile) return;
    const { id, invited_by } = invite;

    if (!id || !invited_by) {
      toast.error("Invalid invite data");
      throw new Error("Missing IDs");
    }
    declineInvite(id);
  };

  const personalInvites = invites?.filter(
    (invite) => invite.invited_user_id === profile.id,
  );

  console.log({ personalInvites });

  return (
    <div className="space-y-4 py-6 sm:max-w-xl md:max-w-4xl lg:max-w-6xl mx-auto">
      <h2 className="text-3xl scroll-m-20 border-b pb-2 font-semibold tracking-tight">
        Notifications
      </h2>

      <Activity mode={personalInvites?.length === 0 ? "visible" : "hidden"}>
        <p className="text-muted-foreground">No notifications</p>
      </Activity>

      <Activity mode={invitesLoading ? "visible" : "hidden"}>
        <div className="flex justify-center items-center py-20">
          <p>Loading Invites</p> <Loader2 className="animate-spin" />
        </div>
      </Activity>

      {personalInvites?.map((invite) => (
        <Item className="rounded shadow-none border" key={invite.id}>
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
              className="rounded"
              onClick={() => {
                if (!selectedInvite) return;
                handleAcceptInvite(selectedInvite);
              }}
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              className="rounded"
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
