import { useEffect, useState } from "react";
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
  const { profile, loading: authLoading } = useAuth();
  const [invites, setInvites] = useState<InviteProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<InviteProps | null>(
    null
  );

  useEffect(() => {
    if (!profile) {
      navigate("/login");
      toast.info("Please login to view notifications.");
      return;
    }

    const fetchInvites = async () => {
      try {
        if (!profile) return;
        const { data, error } = await supabase
          .from("invites")
          .select("*, inviter:profiles!invites_invited_by_fkey(email)")
          .eq("invited_user_id", profile.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInvites(data ?? []);
      } catch (err) {
        console.error("Error fetching invite notifications", err);
        toast.error("Failed to load invite notifications.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchInvites();
  }, [profile, authLoading, navigate]);

  // Realtime subscription
  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel("invites-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invites",
          filter: `invited_user_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setInvites((prev) => [payload.new as InviteProps, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setInvites((prev) =>
              prev.map((i) =>
                i.id === payload.new.id ? (payload.new as InviteProps) : i
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

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
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 />
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No Notifications
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>

      {invites.length === 0 && (
        <p className="text-muted-foreground">No notifications</p>
      )}

      {invites.map((invite) => (
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
