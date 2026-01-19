import { useState, Activity } from "react";
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useRemoveVendor } from "@/mutations/useRemoveVendor";
import { useCancelInvite } from "@/mutations/useCancelInvite";
import { useProfile } from "@/queries/useProfile";
import { useVendors } from "@/queries/useVendors";
import { useInvites } from "@/queries/useInvites";

const VendorAndInviteList = () => {
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    type: "vendor" | "invite";
  } | null>(null);
  const { data: profile } = useProfile();
  const { data: vendors, isLoading: vendorsLoading } = useVendors(
    profile?.business_id ?? "",
  );
  const { data: invites, isLoading: invitesLoading } = useInvites(profile);
  const { mutate: removeVendor } = useRemoveVendor();
  const { mutate: cancelInvite } = useCancelInvite();

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, type } = pendingDelete;

    if (type === "vendor") {
      removeVendor(id);
    } else {
      cancelInvite(id);
    }
    setPendingDelete(null);
  };

  if (!profile?.business_id) return;

  if (vendorsLoading) {
    return (
      <div className="flex space-x-2.5">
        <p>Loading vendors</p>
        <Loader2 className="animate-spin" />
      </div>
    );
  } else if (invitesLoading) {
    return (
      <div className="flex space-x-2.5">
        <p>Loading invites</p>
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-3">
      <h2 className="font-semibold mb-2">Vendors</h2>

      {vendors?.length === 0 && invites?.length === 0 ? (
        <p className="text-sm text-gray-500">No vendors yet.</p>
      ) : (
        <div className="space-y-2">
          {vendors?.map((v, i) => (
            <Item
              variant="outline"
              className="transition-colors rounded shadow-none border"
              key={v.id}
            >
              <ItemContent>
                <ItemDescription>
                  {v.email || `Vendor ${i + 1}`}
                  <span className="text-xs text-green-600 ml-2">(Vendor)</span>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Activity
                  mode={profile.role === "owner" ? "visible" : "hidden"}
                >
                  <Button
                    className="text-sm rounded hover:bg-primary-300 bg-primary-100 transition-colors"
                    onClick={() =>
                      setPendingDelete({ id: v.id, type: "vendor" })
                    }
                  >
                    Remove
                  </Button>
                </Activity>
              </ItemActions>
            </Item>
          ))}

          {invites?.map((invite) => (
            <Item
              variant="outline"
              className="rounded shadow-none border"
              key={invite.id}
            >
              <ItemContent>
                <ItemDescription>
                  {invite.invited?.email}
                  <span className="text-xs text-yellow-600 ml-2">
                    (Invited)
                  </span>
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Activity
                  mode={profile.role === "owner" ? "visible" : "hidden"}
                >
                  <Button
                    variant="destructive"
                    className="rounded text-sm"
                    onClick={() =>
                      setPendingDelete({ id: invite.id, type: "invite" })
                    }
                  >
                    Cancel
                  </Button>
                </Activity>
              </ItemActions>
            </Item>
          ))}
        </div>
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

export default VendorAndInviteList;
