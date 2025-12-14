"use client";

import { useState, Activity } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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

export default function ProductList() {
  const [editing, setEditing] = useState<{
    [key: string]: Partial<ProductProps>;
  }>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const { products, setProducts, profile, productsLoading } = useAuth();

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
    setIsEditingId(id);
  };

  const handleDelete = async (id: string) => {
    if (profile?.role !== "owner") return;
    const deletedProduct = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Failed to delete product.");
      if (deletedProduct) {
        setProducts((prev) => [...prev, deletedProduct]);
        return;
      }
    }
    toast.success("Product deleted");
  };

  return (
    <>
      <Activity mode={productsLoading ? "visible" : "hidden"}>
        <Spinner className="mx-auto my-5" />
      </Activity>
      <Activity mode={productsLoading ? "hidden" : "visible"}>
        <div className="grid gap-4 my-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">
              No products availabe yet :(
            </p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="">
                {profile?.role === "owner" ? (
                  <>
                    <Card className="rounded shadow-none border">
                      <CardHeader>
                        <p className="text-muted-foreground text-end text-xs">
                          SKU: {product.sku}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3.5">
                        {isEditingId === product.id ? (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Product Name
                              </Label>
                              <Input
                                className="text-sm h-[2.13rem] rounded py-1.5"
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
                                className="text-sm h-[2.13rem] py-1.5 rounded"
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
                                className="text-sm h-[2.13rem] py-1.5 rounded"
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
                              <p className="text-sm px-3 py-1.5 border rounded">
                                {product.name}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Price
                              </Label>
                              <p className="text-sm px-3 py-1.5 border rounded">
                                {product.price}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                Stock
                              </Label>
                              <p className="text-sm px-3 py-1.5 border rounded">
                                {product.stock}
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                      <CardFooter className="justify-between">
                        {isEditingId === product.id ? (
                          <Button
                            variant="outline"
                            className="rounded"
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
                            className="rounded"
                            onClick={() => {
                              setIsEditingId(product.id);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {isEditingId === product.id ? (
                          <Button
                            className="rounded"
                            variant="outline"
                            onClick={() => {
                              setIsEditingId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            className="text-rose-600 rounded"
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
                  <Card className="rounded shadow-none border">
                    <CardHeader className="flex justify-between border-b">
                      <CardTitle className="scroll-m-20 tracking-tight">
                        {product.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </p>
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

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
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
      </Activity>
    </>
  );
}
