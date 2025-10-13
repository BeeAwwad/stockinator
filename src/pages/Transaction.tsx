import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hook/useSupabaseAuth";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import type { ProductProps, ProfileProps } from "@/lib/types";
import { toast } from "sonner";

export default function Transaction() {
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState<ProfileProps | null>(null);
  const [products, setProducts] = useState<ProductProps[]>([]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // 1. Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData as ProfileProps);

      // 2. Fetch products if businessId exists
      if (profileData?.business_id) {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", profileData.business_id);

        if (productsError) throw productsError;
        setProducts(productsData as ProductProps[]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="py-6 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
      <AddTransaction
        products={products}
        businessId={profile.business_id}
        createdBy={user?.id || "Unknown"}
      />
      <TransactionList
        businessId={profile.business_id}
        isOwner={profile.role === "owner"}
        products={products}
      />
    </div>
  );
}
