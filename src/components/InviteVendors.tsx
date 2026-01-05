import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAppContext } from "@/hook/useAppContext";

const InviteVendor = () => {
  const { profile, vendors, invites } = useAppContext();
  const [email, setEmail] = useState("");

  const handleInviteVendor = async () => {
    const vendorEmail = email.trim().toLowerCase();

    if (!vendorEmail || !profile?.business_id) return;

    const isAvendor = vendors.some((v) => v.email === vendorEmail);

    const alreadyInvited = invites.some(
      (inv) => inv.invited?.email?.toLowerCase() === vendorEmail
    );

    if (isAvendor) {
      toast.error("This user is already a vendor");
      return;
    }

    if (alreadyInvited) {
      toast.error("This user has already been invited.");
      return;
    }

    if (vendors.length >= 2) {
      toast.error("Vendor limit reached (2 max).");
      return;
    }

    try {
      const { data: vendorProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", vendorEmail)
        .single();

      if (profileError || !vendorProfile) {
        toast.error("User with email doesn't exist.");
        return;
      }

      const { error } = await supabase.from("invites").insert({
        invited_user_id: vendorProfile.id,
        business_id: profile.business_id,
        invited_by: profile?.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This user has already been invited");
        } else {
          console.log("Failed to invite vendor: ", error);
          toast.error("Failed to invite vendor. Please try again.");
        }
        return;
      }
      setEmail("");
      toast.success("Vendor invited successfully!");
    } catch (err) {
      console.error("Failed to invite vendor:", err);
      toast.error("Failed to invite vendor. Please try again.");
    }
  };

  if (!profile?.business_id) return null;

  return (
    <Card className="w-full max-w-sm mx-auto md:max-w-lg lg:max-w-xl rounded shadow-none border">
      <CardHeader>
        <CardTitle>Invite Vendor</CardTitle>
        <CardDescription>Vendors invited: {vendors.length}/2</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="email"
          value={email}
          className="rounded"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Vendor's email"
        />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full rounded bg-primary-100 hover:bg-primary-400 active:bg-primary-400 transition-colors"
          onClick={handleInviteVendor}
          disabled={!email || vendors.length >= 2}
        >
          Add Vendor
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InviteVendor;
