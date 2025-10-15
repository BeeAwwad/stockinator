import { useEffect, useState } from "react";
import type { ProfileProps } from "@/lib/types";
import AddVendor from "@/components/AddVendor";
import VendorList from "@/components/VendorList";
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
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  useEffect(() => {
    const loadProfileAndBusiness = async () => {
      if (!user) return;

      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileErr || !profileData) return;

      setProfile(profileData);

      if (profileData.business_id) {
        const { data: businessData } = await supabase
          .from("businesses")
          .select("name")
          .eq("id", profileData.business_id)
          .single();

        if (businessData) {
          setBusinessName(businessData.name);
        }
      }
    };

    loadProfileAndBusiness();
  }, [user]);

  const handleDelete = async (businessId: string) => {
    if (profile?.role !== "owner") return;
    try {
      // Delete products
      await supabase.from("products").delete().eq("business_id", businessId);

      // Delete transactions
      await supabase
        .from("transactions")
        .delete()
        .eq("business_id", businessId);

      // Delete business
      await supabase.from("businesses").delete().eq("id", businessId);

      // Reset all profiles for this business
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
      <div className="py-6">
        <h1 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 w-fit">
          Dashboard
        </h1>

        {profile && (
          <div className="space-y-1">
            {businessName ? (
              <p className="mt-2">
                Business Name:{" "}
                <span className="font-semibold">{businessName}</span>
              </p>
            ) : (
              <p className="mt-2 text-balance text-gray-500">
                <Link to={"/notifications"}>
                  <span className="text-amber-500 hover:underline">Join</span>
                </Link>{" "}
                or{" "}
                <Link to={"/register-business"}>
                  <span className="text-emerald-600 hover:underline">
                    Create
                  </span>
                </Link>{" "}
                a business to see more from the dashboard
              </p>
            )}
            {profile.role === "owner" && (
              <>
                <p>
                  User:{" "}
                  <span className="font-semibold">{profile.display_name}</span>
                </p>
                <p>You are the owner of this business.</p>
              </>
            )}
            {profile.role === "vendor" && (
              <>
                <p>
                  User:{" "}
                  <span className="font-semibold">{profile.display_name}</span>
                </p>
                <p>You are a vendor for this business.</p>
              </>
            )}
          </div>
        )}
        {profile?.role === "owner" && (
          <Button
            className="mt-4 bg-rose-500"
            onClick={() => {
              setBusinessId(profile.business_id);
              setDeleteDialogOpen(true);
            }}
          >
            Delete Business
          </Button>
        )}
      </div>

      <AddVendor />
      <VendorList />
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
