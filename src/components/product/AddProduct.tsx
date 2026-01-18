"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { productSchema } from "@/lib/schemas";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useAddProducts } from "@/mutations/useAddProduct";
import { useProfile } from "@/queries/useProfile";

type ProductFormProps = z.infer<typeof productSchema>;

export default function AddProduct() {
  const { data: profile } = useProfile();
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
      cost_price: undefined,
      stock: undefined,
    },
  });

  const { mutate: AddProduct, isPending } = useAddProducts();

  const handleFormSubmit = async (data: ProductFormProps) => {
    if (!profile?.business_id || profile?.role !== "owner") {
      return;
    }

    AddProduct({ data, businessId: profile?.business_id, imageFile });

    reset();
    setImageFile(null);
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
            {isPending ? (
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
            {...register("cost_price", { valueAsNumber: true })}
          />
          {errors.cost_price && (
            <p className="text-red-500 text-sm">{errors.cost_price.message}</p>
          )}
          <Input
            placeholder="Sell Price"
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

          <Button type="submit" className="w-full rounded mt-3">
            {isPending ? "Submitting..." : "Add Product"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
