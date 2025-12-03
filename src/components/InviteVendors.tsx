import { useState, useEffect } from "react";
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
import { useAuth } from "@/hook/useAuth";

const InviteVendor = () => {
  const { profile, vendors, invites } = useAuth();
  const [email, setEmail] = useState("");
  
  const handleInviteVendor = async () => {
    const vendorEmail = email.trim().toLowerCase();

    if (!vendorEmail || !profile.business_id) return;

  const alreadyInvited = invites.some(
    (inv) => inv.invited?.email?.toLowerCase() === vendorEmail
  );

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

  if (!profile.business_id) return null;

  return (
    <div className="flex items-center">
      <Card className="w-full max-w-sm md:max-w-lg lg:max-w-xl">
        <CardHeader>
          <CardTitle>Invite Vendor</CardTitle>
          <CardDescription>Vendors invited: {vendors.length}/2</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Vendor's email"
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleInviteVendor}
            disabled={!email || vendors.length >= 2}
          >
            Add Vendor
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InviteVendor;
