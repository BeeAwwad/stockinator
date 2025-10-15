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
import type { ProfileProps } from "@/lib/types";

const AddVendor = () => {
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [email, setEmail] = useState("");
  const [vendorCount, setVendorCount] = useState(0);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileAndCount = async () => {
      console.log("fetching user data...");

      const { error: userError, data } = await supabase.auth.getUser();
      console.log("data:", data);
      if (userError) {
        console.error("User Error: ", userError);
        toast.error("Couldn't find user");
        return;
      }

      const { error: profileError, data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile not found: ", profileError);
        toast.error("Couldn't find profile");
        return;
      }

      if (profile?.role !== "owner") return;
      setBusinessId(profile.business_id);
      setProfile(profile);

      const channel = supabase
        .channel("addvendor-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "invites",
            filter: `business_id=eq.${profile.business_id}`,
          },
          async () => {
            const { count } = await supabase
              .from("invites")
              .select("", { count: "exact", head: true })
              .eq("business_id", profile.business_id)
              .eq("role", "vendor");

            setVendorCount(count || 0);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };
    loadProfileAndCount();
  }, []);

  const handleAddVendor = async () => {
    const vendorEmail = email.trim().toLowerCase();

    if (!vendorEmail || !businessId) return;

    if (vendorCount >= 2) {
      toast.error("Vendor limit reached (2 max).");
      return;
    }

    try {
      const { error } = await supabase.from("invites").insert({
        email: vendorEmail,
        business_id: businessId,
        invited_by: profile?.id,
      });
      if (error) {
        console.log("Failed to invite vendor: ", error);
        toast.error("Failed to invite vendor. Please try again.");
        return;
      }
      setEmail("");
      toast.success("Vendor invited successfully!");
    } catch (err) {
      console.error("Failed to invite vendor:", err);
      toast.error("Failed to invite vendor. Please try again.");
    }
  };

  if (!businessId) return null;

  return (
    <div className="flex items-center">
      <Card className="w-full max-w-sm md:max-w-lg lg:max-w-xl">
        <CardHeader>
          <CardTitle>Invite Vendor</CardTitle>
          <CardDescription>Vendors invited: {vendorCount}/2</CardDescription>
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
            onClick={handleAddVendor}
            disabled={!email || vendorCount >= 2}
          >
            Add Vendor
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddVendor;
