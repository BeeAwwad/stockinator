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
  const { profile } = useAuth();
  const [email, setEmail] = useState("");
  const [vendorCount, setVendorCount] = useState(0);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const countInvites = async () => {
      console.log("fetching user data...");

      if (!profile) return;

      if (profile.role !== "owner") return;

      setBusinessId(profile.business_id);

      // Fetch initial count
      const { count, error: countError } = await supabase
        .from("invites")
        .select("*", { count: "exact", head: true })
        .eq("business_id", profile.business_id);

      if (countError) {
        console.error("Error fetching invite count:", countError);
      } else {
        console.log("Initial invite count:", count);
        setVendorCount(count || 0);
      }

      // Subscribe to realtime changes AFTER count is fetched
      channel = supabase
        .channel("vendor-invite-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "invites",
            filter: `business_id=eq.${profile.business_id}`,
          },
          async () => {
            const { count, error } = await supabase
              .from("invites")
              .select("*", { count: "exact", head: true })
              .eq("business_id", profile.business_id);

            if (!error) setVendorCount(count || 0);
          }
        )
        .subscribe();
    };

    countInvites();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleInviteVendor = async () => {
    const vendorEmail = email.trim().toLowerCase();

    if (!vendorEmail || !businessId) return;

    if (vendorCount >= 2) {
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
        business_id: businessId,
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
            onClick={handleInviteVendor}
            disabled={!email || vendorCount >= 2}
          >
            Add Vendor
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InviteVendor;
