import { useState } from "react";
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
import { Loader2 } from "lucide-react";

const VendorList = () => {
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "vendor" | "invite";
  } | null>(null);
  const { profile, vendorsLoading, vendors, invitesLoading, invites } =
    useAuth();
  console.log("invites:", invites);
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
        await supabase.from("invites").delete().eq("invited_user_id", id);
        toast.success("Invite cancelled.");
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to remove. Please try again.");
    } finally {
      setPendingDelete(null);
    }
  };

  if (!profile?.business_id) return;

  if (vendorsLoading || invitesLoading) {
    return (
      <div className="flex space-x-2.5">
        <p>Loading vendors and invites</p>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

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
              {profile.role === "owner" && (
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
              {profile.role === "owner" && (
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
