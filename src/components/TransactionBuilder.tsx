"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema } from "@/lib/schemas";
import { z } from "zod";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
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
import { useAppContext } from "@/hook/useAppContext";
import ProductCard from "./ProductCard";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

type FormValues = z.infer<typeof transactionSchema>;

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
    slidesToSlide: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 3,
    slidesToSlide: 3,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 2,
    slidesToSlide: 2,
  },
};

export default function TransactionBuilder() {
  const { products, profile } = useAppContext();
  const { control, handleSubmit, watch, setValue, reset } = useForm<FormValues>(
    {
      resolver: zodResolver(transactionSchema),
      defaultValues: { items: [] },
    }
  );

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const total = watchedItems.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice,
    0
  );

  const addItem = (product: ProductProps) => {
    const index = watchedItems.findIndex((i) => i.productId === product.id);

    if (index > -1) {
      const item = watchedItems[index];

      if (item.quantity >= product.stock) {
        toast.warning("Reached maximum stock");
        return;
      }

      update(index, {
        ...watchedItems[index],
        quantity: watchedItems[index].quantity + 1,
      });
    } else {
      if (product.stock <= 0) {
        toast.warning("Product is out of stock");
        return;
      }

      append({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: 1,
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    const payload = data.items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
      unit_price: i.unitPrice,
    }));

    console.log({ payload });

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
    reset();
  };

  //const isMobile =
  //   typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

  return (
    <Card className="rounded shadow-none border">
      <CardHeader>
        <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Add Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Carousel
          responsive={responsive}
          removeArrowOnDeviceType={["mobile"]}
          containerClass="carousel-container"
          swipeable={true}
          autoPlaySpeed={2000}
          itemClass="carousel-item-padding-40-px"
          arrows={true}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addItem} />
          ))}
        </Carousel>

        {fields.map((field, index) => {
          const item = watchedItems[index];
          const product = products.find((p) => p.id === item.productId);
          const maxStock = product?.stock || 0;
          const isMaxed =
            product && watchedItems[index].quantity >= product.stock;

          return (
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
                <Button
                  size="icon"
                  variant="outline"
                  disabled={item.quantity <= 1}
                  onClick={() => {
                    update(index, {
                      ...item,
                      quantity: item.quantity - 1,
                    });
                  }}
                >
                  −
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  className="w-20"
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val) || val < 1) val = 1;
                    if (val > maxStock) {
                      val = maxStock;
                      toast.warning(
                        `Only ${maxStock} units of ${product?.name} in stock`
                      );
                    }
                    setValue(`items.${index}.quantity`, val);
                  }}
                />
                <Button
                  size="icon"
                  variant="outline"
                  disabled={isMaxed}
                  onClick={() => {
                    if (item.quantity < maxStock) {
                      update(index, {
                        ...item,
                        quantity: item.quantity + 1,
                      });
                    } else {
                      toast.warning("Reached maximum stock");
                    }
                  }}
                >
                  +
                </Button>

                <Button variant="ghost" onClick={() => remove(index)}>
                  ✕
                </Button>
              </div>
            </div>
          );
        })}

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
