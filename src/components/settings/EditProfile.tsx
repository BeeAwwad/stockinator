import type { ProfileProps } from "@/lib/types";
import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { Edit3, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEditProfile } from "@/mutations/useEditProfile";
import { useProfile } from "@/queries/useProfile";

const EditProfile = () => {
  const { data: profile } = useProfile();
  return (
    <Card className="rounded">
      <CardHeader className="border-b">
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-5 items-center">
        <div className="size-14 flex items-center justify-center bg-primary-200 rounded-full overflow-hidden">
          <User2 size={20} />
        </div>
        <div className="space-y-2.5">
          <p className="font-semibold text-lg tracking-tight">
            {profile?.display_name}
          </p>
          <p>{profile?.email}</p>
        </div>
        {profile && <EditProfileDialog profile={profile} />}
      </CardContent>
    </Card>
  );
};

export default EditProfile;

function EditProfileDialog({ profile }: { profile: ProfileProps }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(profile);
  const { mutate: editProfile, isPending } = useEditProfile();
  const handleUpdate = async () => {
    editProfile({
      displayName: formData?.display_name ?? "",
      email: formData.email,
      setOpen,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded ml-auto" size={"icon"} variant={"outline"}>
          <Edit3 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded">
        <DialogHeader>Edit Profile</DialogHeader>
        <DialogDescription>Edit user nam and email below.</DialogDescription>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.display_name}
              onChange={(e) =>
                setFormData({ ...formData, display_name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cost-price">Cost Price</Label>
            <Input
              className="rounded"
              id="cost-price"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="rounded"
            variant={"ghost"}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className="bg-primary-100 rounded hover:bg-primary-400 transition-colors"
            disabled={isPending}
          >
            {isPending && <Spinner />} Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
