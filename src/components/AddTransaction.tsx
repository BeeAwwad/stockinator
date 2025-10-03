"use client";

import { useForm, Controller } from "react-hook-form";
import type { ProductProps, TransactionProps } from "@/lib/types";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/schemas";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

type TransactionFormProps = z.infer<typeof transactionSchema>;

export default function AddTransaction({
  products,
  onSubmit,
  businessId,
  createdBy,
}: {
  products: ProductProps[];
  onSubmit: (data: TransactionProps) => void;
  businessId: string;
  createdBy: string;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormProps>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      productId: "",
      quantity: 0,
      total: 0,
      createdBy: createdBy,
      createdAt: new Date(),
    },
  });

  const [price, setPrice] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [lastSubmitted, setLastSubmitted] = useState<number | null>(null);

  const isDuplicateTransaction = async (
    productId: string,
    createdBy: string,
    businessId: string
  ) => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const { data, error } = await supabase
      .from("transactions")
      .select("id")
      .eq("business_id", businessId)
      .eq("product_id", productId)
      .eq("created_by", createdBy)
      .gte("created_at", twoMinutesAgo.toISOString());

    if (error) {
      console.error("Error checking duplicates:", error);
      return false;
    }

    return data.length > 0;
  };

  const handleFormSubmit = async (data: TransactionFormProps) => {
    const now = new Date();

    if (lastSubmitted && now.getTime() - lastSubmitted < 60000) {
      toast.warning(
        "Please wait a minute before submitting another transaction."
      );
      return;
    }
    const product = products.find((p) => p.id === data.productId);
    const total = product ? product.price * data.quantity : 0;

    if (!businessId) {
      toast.error("Missing business context.");
      return;
    }

    const duplicate = await isDuplicateTransaction(
      data.productId,
      createdBy,
      businessId
    );

    if (duplicate) {
      toast.warning("Duplicate transaction detected in the last 2 minutes.");
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      business_id: businessId,
      product_id: data.productId,
      quantity: data.quantity,
      total,
      created_by: createdBy,
      verified: false,
    });

    if (error) {
      console.error("Insert failed:", error);
      toast.error("Failed to add transaction.");
      return;
    }

    toast.success("Transaction created!");
    await onSubmit({ ...data, total, verified: false });
    setLastSubmitted(now.getTime());
    setPrice("");
    setTotal("");
    reset();
  };

  return (
    <Card>
      <form
        onSubmit={handleSubmit(handleFormSubmit, (errors) => {
          console.log("🧨 FORM ERRORS:", errors);
        })}
        className="space-y-3"
      >
        <CardHeader>
          <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Add Transaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <Controller
            name="productId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              const selectedProduct = products.find(
                (product) => product.id === getValues().productId
              );

              return (
                <Select
                  onValueChange={(value) => {
                    const selected = products.find(
                      (product) => product.id === value
                    );
                    const productPrice = selected?.price ?? 0;
                    const quantity = getValues("quantity") || 0;

                    setPrice(productPrice.toString());
                    setTotal((productPrice * quantity).toFixed(2));
                    setValue("total", productPrice * quantity);
                    field.onChange(value);
                  }}
                  value={getValues().productId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Product">
                      {selectedProduct && selectedProduct.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.productId && (
            <p className="text-sm text-rose-500">Product required</p>
          )}

          <Input
            type="number"
            placeholder="Quantity"
            {...register("quantity", {
              valueAsNumber: true,
              required: true,

              onChange: (e) => {
                const quantity = Number(e.target.value);
                const product = products.find(
                  (p) => p.id === getValues("productId")
                );
                const productPrice = product?.price ?? 0;

                const newTotal = productPrice * quantity;
                setTotal(newTotal.toFixed(2));
                setValue("total", newTotal);
              },
            })}
          />
          {errors.quantity && (
            <p className="text-sm text-rose-500">Quantity required</p>
          )}
          {price !== "" ? (
            <>
              <div className="text-sm border px-3 py-1.5 rounded-md shadow-xs">
                <p>Price: ₦{price}</p>
              </div>
              <div className="text-sm border px-3 py-1.5 rounded-md shadow-xs">
                <p>Total: ₦{total}</p>
              </div>
            </>
          ) : (
            ""
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full mt-2.5">
            Submit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
