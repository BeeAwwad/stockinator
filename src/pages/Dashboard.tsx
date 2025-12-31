import { useState, Activity } from "react";
import InviteVendor from "@/components/InviteVendors";
import VendorAndInviteList from "@/components/VendorAndInviteList";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabaseClient";
import { useAppContext } from "@/hook/useAppContext";

const Dashboard = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const { profile, businessName } = useAppContext();
  const navigate = useNavigate();

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
      <div className="py-6 space-y-6">
        <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:max-w-xl md:max-w-4xl lg:max-w-6xl mx-auto">
          <Card className="rounded shadow-none border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Business Overview
              </CardTitle>
              <CardDescription>Your business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {businessName ? (
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  <span className="text-sm text-muted-foreground">
                    {businessName}
                  </span>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  <Link
                    to="/notifications"
                    className="text-amber-600 underline"
                  >
                    Join
                  </Link>{" "}
                  or{" "}
                  <Link
                    to="/register-business"
                    className="text-emerald-600 underline"
                  >
                    create
                  </Link>{" "}
                  a business to see more details.
                </p>
              )}

              <Activity mode={profile ? "visible" : "hidden"}>
                <>
                  <p>
                    <span className="font-semibold">User:</span>{" "}
                    <span className="text-sm text-muted-foreground">
                      {profile?.display_name}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    You are{" "}
                    <span className="font-medium">({profile?.role})</span> in
                    this business.
                  </p>
                </>
              </Activity>
            </CardContent>
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

          <Card className="rounded shadow-none border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Team & Invites
              </CardTitle>
              <CardDescription>Manage your team members</CardDescription>
            </CardHeader>

            <CardContent>
              <InviteVendor />
            </CardContent>

            <CardContent>
              <VendorAndInviteList />
            </CardContent>
          </Card>
        </div>
      </div>
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

export default Dashboard;
