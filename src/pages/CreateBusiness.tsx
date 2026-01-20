import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfile } from "@/queries/useProfile";
import { useCreateBusiness } from "@/mutations/useCreateBusiness";

const CreateBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { mutate: createBusiness, isPending } = useCreateBusiness();
  useEffect(() => {
    const checkExistingBusiness = async () => {
      if (!profile) return;

      if (profile.business_id) {
        navigate("/");
      }
    };
    checkExistingBusiness();
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !profile) return;
    createBusiness(businessName);
  };

  return (
    <div className="p-6 mt-8 flex justify-center">
      <Card className="w-full max-w-sm py-6 md:max-w-md lg:max-w-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Register Your Business</CardTitle>
            <CardDescription>Give your business a name</CardDescription>
          </CardHeader>
          <CardContent className="my-5">
            <Input
              type="text"
              className="border w-full p-2 rounded"
              placeholder="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creating..." : "Create Business"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateBusiness;
