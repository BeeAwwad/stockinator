import { DeleteBusiness } from "@/components/settings/DeleteBusiness";
import EditProfile from "@/components/settings/EditProfile";

export const Settings = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl scroll-m-20 border-b pb-2 font-semibold tracking-tight">
        Settings
      </h2>
      <EditProfile />
      <DeleteBusiness />
    </div>
  );
};
