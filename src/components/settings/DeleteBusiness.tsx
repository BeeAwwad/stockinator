import { Activity, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Item, ItemContent, ItemDescription, ItemActions } from "../ui/item";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/hook/useAppContext";

export const DeleteBusiness = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const navigate = useNavigate();
  const { profile, businessName } = useAppContext();
  const handleDelete = async (businessId: string) => {
    if (profile?.role !== "owner") return;
    try {
      await supabase.from("products").delete().eq("business_id", businessId);

      await supabase
        .from("transactions")
        .delete()
        .eq("business_id", businessId);

      await supabase.from("businesses").delete().eq("id", businessId);

      await supabase
        .from("profiles")
        .update({ business_id: null, role: "unassigned" })
        .eq("business_id", businessId);

      toast.success("Business deleted successfully.");
      navigate("/register-business");
    } catch (err) {
      console.error("Failed to delete business:", err);
      toast.error("Failed to delete business.");
    }
  };
  return (
    <>
      <Card>
        <CardContent>
          <Activity mode={profile?.role === "owner" ? "visible" : "hidden"}>
            <Item
              variant="outline"
              className="transition-colors rounded shadow-none border"
            >
              <ItemContent>
                <ItemDescription>
                  Permanently delete your business and all data.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  className="text-sm rounded hover:bg-red-700 transition-colors"
                  onClick={() => {
                    setBusinessId(profile?.business_id ?? null);
                    setDeleteDialogOpen(true);
                  }}
                >
                  Delete Business
                </Button>
              </ItemActions>
            </Item>
          </Activity>
        </CardContent>
      </Card>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your business, all products, and all
              transactions.
            </AlertDialogDescription>
            <div className="space-y-2 my-4">
              <p className="text-sm text-gray-500">
                To confirm, type{" "}
                <span className="text-gray-950 font-medium">
                  "{businessName}"
                </span>{" "}
                below:
              </p>
              <Input
                placeholder="Type business name to confirm"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                className={twMerge(
                  "text-sm",
                  confirmName &&
                    confirmName !== businessName &&
                    "border-rose-500",
                  confirmName === businessName && "border-green-500"
                )}
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmName !== businessName}
              onClick={async () => {
                if (businessId) {
                  await handleDelete(businessId);
                  setDeleteDialogOpen(false);
                  setBusinessId(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
