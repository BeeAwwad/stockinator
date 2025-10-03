import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseAuth } from "@/hook/useSupabaseAuth";
import AddTransaction from "@/components/AddTransaction";
import TransactionList from "@/components/TransactionList";
import type { ProductProps, ProfileProps, TransactionProps } from "@/lib/types";
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

  const createTransaction = async (data: TransactionProps) => {
    try {
      const { productId, quantity, total } = data;
      const qty = Number(quantity);

      if (!profile?.businessId || !productId || !qty) return;

      // 1. Fetch product
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", productId)
        .single();

      if (productError || !product) {
        toast.error("Product not found");
        throw productError || new Error("Product not found");
      }

      const newStock = (product.stock || 0) - qty;

      if (newStock < 0) {
        toast.error("Insufficient stock");
        throw new Error("Insufficient stock");
      }

      // 2. Update product stock
      const { error: updateError } = await supabase
        .from("products")
        .update({
          stock: newStock,
          updated_by: user?.email ?? "unknown",
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (updateError) throw updateError;

      // 3. Insert transaction
      const { error: insertError } = await supabase
        .from("transactions")
        .insert({
          business_id: profile.businessId,
          product_id: productId,
          quantity: qty,
          total,
          created_by: user?.email ?? "unknown",
          created_at: new Date().toISOString(),
          verified: false,
        });

      if (insertError) throw insertError;

      toast.success("Transaction created");

      // refresh products so stock updates immediately
      fetchData();
    } catch (error) {
      console.error("Failed to create transaction:", error);
      toast.error("An error occurred while processing the transaction.");
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
        onSubmit={createTransaction}
        businessId={profile.businessId}
        createdBy={user?.email || "Unknown"}
      />
      <TransactionList
        businessId={profile.businessId}
        isOwner={profile.role === "owner"}
        products={products}
      />
    </div>
  );
}
