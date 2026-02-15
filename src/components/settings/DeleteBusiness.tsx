import { Activity, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Item, ItemContent, ItemDescription, ItemActions } from "../ui/item";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { twMerge } from "tailwind-merge";
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
import { useDeleteBusiness } from "@/mutations/useDeleteBusiness";
import { Spinner } from "../ui/spinner";
import { useProfile } from "@/queries/useProfile";
import { useBusinessName } from "@/queries/useBusinessName";

export const DeleteBusiness = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const { data: businessName } = useBusinessName();
  const { data: profile } = useProfile();
  const { mutate: deleteBusiness, isPending } = useDeleteBusiness();

  if (profile?.role !== "owner") return;

  const handleDelete = async () => {
    if (profile?.role !== "owner") return;
    deleteBusiness();
  };
  return (
    <>
      <Card className="rounded">
        <CardHeader className="border-b flex justify-between">
          <CardTitle>Delete Business</CardTitle>
          <Activity mode={isPending ? "visible" : "hidden"}>
            <Spinner />
          </Activity>
        </CardHeader>
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
                  className="text-sm rounded bg-primary-100 hover:bg-primary-300 transition-colors"
                  onClick={() => {
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
        <AlertDialogContent className="rounded">
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
                  "text-sm rounded",
                  confirmName &&
                    confirmName !== businessName &&
                    "border-primary-300",
                  confirmName === businessName && "border-primary-400",
                )}
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded"
              disabled={confirmName !== businessName}
              onClick={async () => {
                await handleDelete();
                setDeleteDialogOpen(false);
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
