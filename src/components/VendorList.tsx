import { useEffect, useState } from "react";
import type { ProfileProps, InviteProps } from "@/lib/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hook/useAuth";

const VendorList = () => {
  const [vendors, setVendors] = useState<ProfileProps[]>([]);
  const [invites, setInvites] = useState<InviteProps[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "vendor" | "invite";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  console.log("businessId", businessId);

  useEffect(() => {
    const loadVendors = async () => {
      if (!profile) return;
      setBusinessId(profile.business_id);
      setIsOwner(profile.role === "owner");

      const { error: vendorErr, data: vendorList } = await supabase
        .from("profiles")
        .select("*")
        .eq("businessId", profile.business_id)
        .eq("role", "vendor");
      setVendors(vendorList || []);

      if (vendorErr) throw vendorErr;
      // fetch invites
      const { error: inviteErr, data: inviteList } = await supabase
        .from("invites")
        .select("*")
        .eq("businessId", profile.business_id);

      setInvites(inviteList || []);

      if (inviteErr) throw inviteErr;

      setLoading(false);

      // Realtime subscriptions
      const channel = supabase
        .channel("vendorlist-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `businessId=eq.${profile.business_id}`,
          },
          (payload) => {
            const newProfile = payload.new as ProfileProps | undefined;

            if (newProfile?.role === "vendor") {
              setVendors((prev) => {
                const filtered = prev.filter((v) => v.id !== newProfile.id);
                return [...filtered, payload.new as ProfileProps];
              });
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "invites",
            filter: `businessId=eq.${profile.business_id}`,
          },
          (payload) => {
            setInvites((prev) => {
              if (payload.eventType === "DELETE") {
                return prev.filter((i) => i.id !== payload.old.id);
              }
              if (payload.eventType === "INSERT") {
                return [...prev, payload.new as InviteProps];
              }
              return prev;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    loadVendors();
  }, []);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, type } = pendingDelete;

    try {
      if (type === "vendor") {
        await supabase
          .from("profiles")
          .update({ business_id: null, role: "unassigned" })
          .eq("id", id);
        toast.success("Vendor removed.");
      } else {
        await supabase.from("invites").delete().eq("id", id);
        toast.success("Invite cancelled.");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to remove. Please try again.");
    } finally {
      setPendingDelete(null);
    }
  };

  if (!businessId) return null;
  if (loading) return <p>Loading vendors...</p>;

  return (
    <div className="mt-6">
      <h2 className="font-bold mb-2">Vendors</h2>

      {vendors.length === 0 && invites.length === 0 ? (
        <p className="text-sm text-gray-500">No vendors yet.</p>
      ) : (
        <ul className="space-y-2">
          {vendors.map((v, i) => (
            <li
              key={v.id}
              className="flex justify-between items-center bg-green-50 p-2 rounded"
            >
              <div>{v.display_name || v.email || `Vendor ${i + 1}`}</div>
              {isOwner && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => setPendingDelete({ id: v.id, type: "vendor" })}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}

          {invites.map((invite) => (
            <li
              key={invite.id}
              className="flex justify-between items-center bg-yellow-50 p-2 rounded"
            >
              <div>
                {invite.invited?.email}
                <span className="text-xs text-yellow-600 ml-2">(Invited)</span>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() =>
                    setPendingDelete({ id: invite.id, type: "invite" })
                  }
                >
                  Cancel
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={() => setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.type === "vendor"
                ? "Remove Vendor?"
                : "Cancel Invite?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.type === "vendor"
                ? "Are you sure you want to remove this vendor?"
                : "Are you sure you want to cancel this invite?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorList;
