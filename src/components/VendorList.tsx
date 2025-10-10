import { useEffect, useState } from "react";
import type { ProfileProps } from "@/lib/types";
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
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

const VendorList = () => {
  const [user, setUser] = useState<User | null>(null);
  const [vendors, setVendors] = useState<ProfileProps[]>([]);
  const [invites, setInvites] = useState<{ id: string; email: string }[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "vendor" | "invite";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUser(data.user);

      // fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!profile?.businessId) return;

      setBusinessId(profile.businessId);
      setIsOwner(profile.role === "owner");

      // fetch vendors
      const { data: vendorList } = await supabase
        .from("profiles")
        .select("*")
        .eq("businessId", profile.businessId)
        .eq("role", "vendor");
      setVendors(vendorList || []);

      // fetch invites
      const { data: inviteList } = await supabase
        .from("invites")
        .select("id, email")
        .eq("businessId", profile.businessId)
        .eq("role", "vendor");
      setInvites(inviteList || []);

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
            filter: `businessId=eq.${profile.businessId}`,
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
            filter: `businessId=eq.${profile.businessId}`,
          },
          (payload) => {
            setInvites((prev) => {
              if (payload.eventType === "DELETE") {
                return prev.filter((i) => i.id !== payload.old.id);
              }
              if (payload.eventType === "INSERT") {
                return [
                  ...prev,
                  { id: payload.new.id, email: payload.new.email },
                ];
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

    loadUserAndProfile();
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
              <div>{v.displayName || v.email || `Vendor ${i + 1}`}</div>
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

          {invites.map((inv) => (
            <li
              key={inv.id}
              className="flex justify-between items-center bg-yellow-50 p-2 rounded"
            >
              <div>
                {inv.email}
                <span className="text-xs text-yellow-600 ml-2">(Invited)</span>
              </div>
              {isOwner && (
                <Button
                  variant="ghost"
                  className="text-red-600 hover:underline text-sm"
                  onClick={() =>
                    setPendingDelete({ id: inv.id, type: "invite" })
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
