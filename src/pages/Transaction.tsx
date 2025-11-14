import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import type { ProductProps } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/hook/useAuth";

export default function Transaction() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<ProductProps[]>([]);

  const fetchData = async () => {
    if (!profile) return;

    try {
      // 2. Fetch products if businessId exists
      if (profile.business_id) {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", profile.business_id);

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
  }, [profile]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="py-6 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl w-full mx-auto">
      <AddTransaction
        products={products}
        businessId={profile.business_id}
        createdBy={profile?.id || "Unknown"}
      />
      <TransactionList
        businessId={profile.business_id}
        isOwner={profile.role === "owner"}
        products={products}
      />
    </div>
  );
}
