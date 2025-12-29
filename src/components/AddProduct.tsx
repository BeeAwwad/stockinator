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
import { LazyLoadImage } from "react-lazy-load-image-component";

type ProductFormProps = z.infer<typeof productSchema>;

const uploadProductImage = async (
  file: File,
  businessId: string
): Promise<string | null> => {
  const fileExt = file.name.split(".").pop();
  const filePath = `${businessId}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("product_images")
    .upload(filePath, file);

  if (error) {
    console.error("Image upload failed:", error);
    toast.error("Image upload failed");
    return null;
  }

  const { data } = supabase.storage
    .from("product_images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export default function AddProduct() {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    if (!profile?.business_id || profile?.role !== "owner") {
      return;
    }

    console.log({ data });
    setIsSubmitting(true);
    const sku = generateSKU(data.name);
    console.log({ sku });

    let imageUrl: string | null = null;

    if (imageFile) {
      imageUrl = await uploadProductImage(imageFile, profile.business_id);
      if (!imageUrl) {
        toast.error("image upload failed");
        setIsSubmitting(false);
        return;
      }
    }
    console.log({ imageUrl });

    const { error } = await supabase.from("products").insert([
      {
        business_id: profile.business_id,
        name: data.name,
        sku,
        price: Number(data.price),
        cost_price: Number(data.cost_price),
        stock: Number(data.stock),
        image_url: imageUrl,
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
          <CardDescription className="mb-3 flex justify-between items-center">
            <p>Add products to your business</p>{" "}
            {imageFile && (
              <LazyLoadImage
                src={URL.createObjectURL(imageFile)}
                alt="image preview"
                className="ml-4 rounded object-cover size-16 border"
              />
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input className="rounded" placeholder="Name" {...register("name")} />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
          <Input
            placeholder="Cost Price"
            className="rounded"
            type="number"
            {...register("price", { valueAsNumber: true })}
          />
          {errors.cost_price && (
            <p className="text-red-500 text-sm">{errors.cost_price.message}</p>
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
          <Input
            type="file"
            className="rounded"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (file.size > 2 * 1024 * 1024) {
                toast.error("Image must be under 2MB");
                return;
              }

              setImageFile(file);
            }}
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
