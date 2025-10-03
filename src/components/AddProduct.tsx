"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

const INITIAL_FORM = { name: "", sku: "", price: "", stock: "" };

export default function AddProduct({
  businessId,
  isOwner,
}: {
  businessId: string;
  isOwner: boolean;
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateSKU = (name: string) =>
    `${name.slice(0, 3).toLocaleUpperCase()}-${Date.now()
      .toString()
      .slice(-5)}`;

  const handleSubmit = async () => {
    const { name, price, stock } = form;
    if (!businessId || !isOwner) return;

    const sku = generateSKU(form.name);

    const { error } = await supabase.from("products").insert([
      {
        business_id: businessId,
        name,
        sku,
        price: Number(price),
        stock: Number(stock),
      },
    ]);

    if (error) {
      console.error("Failed to add product:", error);
      toast.error("Failed to add product. Please try again.");
      return;
    }
    setForm(INITIAL_FORM);
    toast.success("Product added successfully!");
  };

  return (
    <div className="space-y-2">
      {["name", "price", "stock"].map((field) => (
        <Input
          className="placeholder:text-sm"
          key={field}
          name={field}
          placeholder={field[0].toUpperCase() + field.slice(1)}
          type={field === "price" || field === "stock" ? "number" : "text"}
          value={form[field as keyof typeof form]}
          onChange={handleChange}
        />
      ))}
      <Button onClick={handleSubmit} className="w-full mt-3">
        Add Product
      </Button>
    </div>
  );
}
