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
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hook/useAuth";

const CreateBusiness = () => {
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();

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

    setLoading(true);

    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      console.log("Current user before insert:", currentUser);

      const { data: business, error: bizErr } = await supabase
        .from("businesses")
        .insert({
          name: businessName,
          owner_id: profile.id,
        })
        .select("id")
        .single();

      if (bizErr) throw bizErr;
      console.log("before updating profile...");
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          business_id: business.id,
          role: "owner",
        })
        .eq("id", profile.id);

      if (profileErr) throw profileErr;
      navigate("/");
    } catch (err) {
      console.error("Error creating business:", err);
    } finally {
      setLoading(false);
    }
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Business"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateBusiness;
