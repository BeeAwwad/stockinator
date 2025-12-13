"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/hook/useAuth";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { productSchema } from "@/lib/schemas";

type ProductFormProps = z.infer<typeof productSchema>;

export default function AddProduct() {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormProps>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: undefined,
      stock: undefined,
    },
  });

  const generateSKU = (name: string) =>
    `${name.slice(0, 3).toLocaleUpperCase()}-${Date.now()
      .toString()
      .slice(-5)}`;

  const handleFormSubmit = async (data: ProductFormProps) => {
    console.log("handleSubmit...");
    if (!profile?.business_id || profile?.role !== "owner") {
      return;
    }

    console.log({ data });
    setIsSubmitting(true);
    const sku = generateSKU(data.name);
    console.log({ sku });
    const { error } = await supabase.from("products").insert([
      {
        business_id: profile.business_id,
        name: data.name,
        sku,
        price: Number(data.price),
        stock: Number(data.stock),
      },
    ]);
    toast.success("insert completed");
    if (error) {
      console.error("Failed to add product:", error);
      setIsSubmitting(false);
      toast.error("Failed to add product. Please try again.");
      return;
    }
    setIsSubmitting(false);
    reset();
    toast.success("Product added successfully!");
  };
  if (profile?.role !== "owner") return null;

  return (
    <Card className="w-full grid rounded shadow-none border gap-4 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl">
      <form
        onSubmit={handleSubmit(handleFormSubmit, (err) => console.log(err))}
      >
        <CardHeader>
          <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 flex justify-between">
            <span>Add Product</span>
            {isSubmitting ? (
              <Badge variant="secondary">
                <Spinner />
                Submitting
              </Badge>
            ) : (
              ""
            )}
          </CardTitle>
          <CardDescription className="mb-3">
            Add products to your businesses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input className="rounded" placeholder="Name" {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
          <Input
            placeholder="Price"
            className="rounded"
            type="number"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
          <Input
            placeholder="Stock"
            type="number"
            className="rounded"
            {...register("stock", { valueAsNumber: true })}
          />
          {errors.stock && (
            <p className="text-red-500 text-sm">{errors.stock.message}</p>
          )}
          <Button type="submit" className="w-full rounded mt-3">
            Add Product
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
