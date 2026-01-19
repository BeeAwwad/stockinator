import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useProfile } from "@/queries/useProfile";
import { useVendors } from "@/queries/useVendors";
import { useInvites } from "@/queries/useInvites";
import { useAddVendors } from "@/mutations/useAddVendor";

const InviteVendor = () => {
  const [email, setEmail] = useState("");
  const { data: profile } = useProfile();
  const { data: vendors } = useVendors(profile?.business_id ?? "");
  const { data: invites } = useInvites(profile);
  const { mutate: inviteVendor } = useAddVendors();

  const handleInviteVendor = async () => {
    const vendorEmail = email.trim().toLowerCase();

    if (!vendorEmail || !profile?.business_id) return;

    const isAvendor = vendors?.some((v) => v.email === vendorEmail);

    const alreadyInvited = invites?.some(
      (inv) => inv.invited?.email?.toLowerCase() === vendorEmail,
    );

    if (isAvendor) {
      toast.error("This user is already a vendor");
      return;
    }

    if (alreadyInvited) {
      toast.error("This user has already been invited.");
      return;
    }

    if (vendors && vendors?.length >= 2) {
      toast.error("Vendor limit reached (2 max).");
      return;
    }

    inviteVendor({ profile, vendorEmail });
  };

  if (!profile?.business_id) return null;

  return (
    <Card className="w-full max-w-sm mx-auto md:max-w-lg lg:max-w-xl rounded shadow-none border">
      <CardHeader>
        <CardTitle>Invite Vendor</CardTitle>
        <CardDescription>Vendors invited: {vendors?.length}/2</CardDescription>
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
          disabled={!email || (vendors && vendors?.length >= 2)}
        >
          Add Vendor
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InviteVendor;
