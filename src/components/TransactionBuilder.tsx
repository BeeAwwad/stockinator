"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/schemas";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { ProductProps } from "@/lib/types";
import { useAuth } from "@/hook/useAuth";

// 1. Let Zod define the type so they never mismatch
type FormValues = z.infer<typeof transactionSchema>;

export default function TransactionBuilder() {
  const { products, profile } = useAuth();
  // 2. Initialize Form
  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { items: [] },
  });

  // 3. Use useFieldArray to manage the items list
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  // Watch items to calculate total
  const watchedItems = watch("items");
  const total = watchedItems.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0
  );

  const addItem = (product: ProductProps) => {
    const index = watchedItems.findIndex((i) => i.productId === product.id);

    if (index > -1) {
      // If exists, update quantity
      update(index, {
        ...watchedItems[index],
        quantity: watchedItems[index].quantity + 1,
      });
    } else {
      // If new, append to array
      append({
        productId: product.id,
        name: product.name, // Kept for UI display
        unitPrice: product.price,
        quantity: 1,
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    // 4. Map data to the format the RPC expects (no 'name' sent to DB)
    const payload = data.items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }));

    const { error } = await supabase.rpc("create_transaction", {
      bid: profile?.business_id,
      items: payload,
    });

    if (error) {
      toast.error(error.message || "Failed to create transaction");
      console.error(error.message, "line 93");
      return;
    }

    toast.success("Transaction completed");
    reset(); // Clears the form
  };

  return (
    <Card className="rounded shadow-none border">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          onValueChange={(id) => {
            const p = products.find((p) => p.id === id);
            if (p) addItem(p);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Add product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} (₦{p.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center justify-between border p-2 rounded"
          >
            <div>
              <p className="font-medium">{field.name}</p>
              <p className="text-sm text-muted-foreground">
                ₦{field.unitPrice}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="w-20"
                {...control.register(`items.${index}.quantity` as const, {
                  valueAsNumber: true,
                })}
              />
              <Button variant="ghost" onClick={() => remove(index)}>
                ✕
              </Button>
            </div>
          </div>
        ))}

        <div className="text-right font-semibold">
          Total: ₦{total.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit(onSubmit)}>
          Complete Sale
        </Button>
      </CardFooter>
    </Card>
  );
}
