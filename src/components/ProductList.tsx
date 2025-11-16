"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { supabase } from "@/lib/supabaseClient";
import type { ProductProps } from "@/lib/types";
import { Input } from "./ui/input";
import { useAuth } from "@/hook/useAuth";

export default function ProductList({ isOwner }: { isOwner: boolean }) {
  const [editing, setEditing] = useState<{
    [key: string]: Partial<ProductProps>;
  }>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { products } = useAuth();

  const handleEdit = async (id: string) => {
    const changes = editing[id];
    if (!changes) return;

    const { error } = await supabase
      .from("products")
      .update(changes)
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Failed to save changes.");
      return;
    }

    setEditing((prev) => ({ ...prev, [id]: {} }));
    toast.success("Changes Saved!");
    setIsEditing(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="grid gap-4 my-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl">
      {products.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm">
          No products availabe yet : (
        </p>
      ) : (
        products.map((product) => (
          <div key={product.id} className="">
            {isOwner ? (
              <>
                <Card>
                  <CardHeader>
                    <p className="text-muted-foreground text-end text-xs">
                      SKU: {product.sku}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3.5">
                    {isEditing ? (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Product Name
                          </Label>
                          <Input
                            className="text-sm h-[2.13rem]  py-1.5"
                            defaultValue={product.name}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...prev[product.id],
                                  name: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs  text-muted-foreground">
                            Price
                          </Label>
                          <Input
                            className="text-sm h-[2.13rem] py-1.5"
                            defaultValue={product.price}
                            type="number"
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...prev[product.id],
                                  price: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Stock
                          </Label>
                          <Input
                            className="text-sm h-[2.13rem] py-1.5"
                            defaultValue={product.stock}
                            type="number"
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [product.id]: {
                                  ...prev[product.id],
                                  stock: Number(e.target.value),
                                },
                              }))
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Product Name
                          </Label>
                          <p className="text-sm px-3 py-1.5 border rounded-sm">
                            {product.name}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Price
                          </Label>
                          <p className="text-sm px-3 py-1.5 border rounded-sm">
                            {product.price}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Stock
                          </Label>
                          <p className="text-sm px-3 py-1.5 border rounded-sm">
                            {product.stock}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between">
                    {isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPendingSaveId(product.id);
                          setEditDialogOpen(true);
                        }}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="text-rose-600"
                        onClick={() => {
                          setPendingDeleteId(product.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader className="flex justify-between border-b">
                  <CardTitle className="scroll-m-20 tracking-tight">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <p className="text-sm lg:text-base">
                    <span className="text-muted-foreground">Price:</span> ₦
                    {product.price}
                  </p>
                  <p className="text-sm lg:text-base">
                    <span className="text-muted-foreground">Stock:</span>{" "}
                    {product.stock}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ))
      )}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save changes to this product?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingSaveId) {
                  await handleEdit(pendingSaveId);
                  setEditDialogOpen(false);
                  setPendingSaveId(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (pendingDeleteId) {
                  await handleDelete(pendingDeleteId);
                  setDeleteDialogOpen(false);
                  setPendingDeleteId(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
