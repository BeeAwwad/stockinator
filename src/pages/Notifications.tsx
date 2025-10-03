import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Notification } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hook/useSupabaseAuth";
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

export default function Notifications() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/login");
      toast.info("Please login to view notifications.");
      return;
    }

    const fetchNotifications = async () => {
      try {
        if (!user) return;
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("to_user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotifications(data ?? []);
      } catch (err) {
        console.error("Error fetching notifications", err);
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchNotifications();
  }, [user, authLoading, navigate]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // listen to INSERT, UPDATE, DELETE
          schema: "public",
          table: "notifications",
          filter: `to_user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === payload.new.id ? (payload.new as Notification) : n
              )
            );
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  const handleAcceptInvite = async (notification: Notification) => {
    if (!user) return;
    const { inviteId, businessId } = notification.data;

    try {
      if (!inviteId || !businessId) {
        toast.error("Invalid invite data.");
      }
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ business_id: businessId, role: "vendor" })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      await supabase.from("invites").delete().eq("id", inviteId);
      await supabase.from("notifications").delete().eq("id", notification.id);

      toast.success("Invite accepted! You've joined the business.");
      setNotificationDialogOpen(false);
      setSelectedNotification(null);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept invite.");
      setNotificationDialogOpen(false);
      setSelectedNotification(null);
    }
  };

  const handleDeclineInvite = async (notification: Notification) => {
    if (!user) return;
    const { inviteId, inviterId } = notification.data;

    try {
      if (!inviteId || !notification.id) {
        toast.error("Invalid notification data");
        throw new Error("Missing IDs");
      }

      await supabase.from("notifications").insert({
        to_user_id: inviterId,
        type: "invite_declined",
        read: false,
        data: { declinedBy: user.email },
      });

      await supabase.from("invites").delete().eq("id", inviteId);
      await supabase.from("notifications").delete().eq("id", notification.id);

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

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No Notifications
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>

      {notifications.length === 0 && (
        <p className="text-muted-foreground">No notifications</p>
      )}

      {notifications.map((n) => (
        <div key={n.id} className="border rounded-lg p-4 shadow-sm bg-white">
          {n.type === "invite_received" && (
            <>
              <p>
                You’ve been invited by <strong>{n.data.email}</strong> to join a
                business.
              </p>

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedNotification(n);
                  setNotificationDialogOpen(true);
                }}
                className="mt-2"
              >
                Respond
              </Button>
            </>
          )}

          {n.type === "invite_accepted" && (
            <p>
              <strong>{n.data.email}</strong> accepted your invite.
            </p>
          )}

          {n.type === "invite_declined" && (
            <p>
              <strong>{n.data.declinedBy}</strong> declined your invite.
            </p>
          )}
        </div>
      ))}

      <AlertDialog
        open={notificationDialogOpen}
        onOpenChange={setNotificationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to accept the invite from{" "}
              <strong>{selectedNotification?.data.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-2">
            <Button
              variant="default"
              onClick={() => {
                if (!selectedNotification) return;
                handleAcceptInvite(selectedNotification);
              }}
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedNotification) return;
                handleDeclineInvite(selectedNotification);
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
