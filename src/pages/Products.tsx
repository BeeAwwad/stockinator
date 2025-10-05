"use client";

import { useEffect, useState } from "react";
import type { ProfileProps } from "@/lib/types";
import AddProduct from "@/components/AddProduct";
import ProductList from "@/components/ProductList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export default function ProductsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileProps | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Failed to load profile.");
        return;
      }
      setProfile(data as ProfileProps);
    };

    fetchUserAndProfile();
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="py-6 flex flex-col items-center">
      {profile.role === "owner" && (
        <Card className="w-full grid gap-4 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl">
          <CardHeader>
            <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Add Product
            </CardTitle>
            <CardDescription>Add products to your businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <AddProduct
              isOwner={profile.role === "owner"}
              businessId={profile.businessId}
            />
          </CardContent>
        </Card>
      )}
      <ProductList
        businessId={profile.businessId}
        isOwner={profile.role === "owner"}
      />
    </div>
  );
}
