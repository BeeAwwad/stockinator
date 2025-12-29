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
import { LazyLoadImage } from "react-lazy-load-image-component";
import { CameraIcon, X } from "lucide-react";

const getFilePathFromUrl = (url: string) => {
  const parts = url.split("/product_images/");
  return parts[1];
};

const deleteProductImage = async (imageUrl: string) => {
  const path = getFilePathFromUrl(imageUrl);

  const { error } = await supabase.storage
    .from("product-images")
    .remove([path]);

  if (error) throw error;
};

const replaceProductImage = async (
  oldImageUrl: string | null,
  newFile: File,
  businessId: string
) => {
  if (oldImageUrl) {
    const oldPath = getFilePathFromUrl(oldImageUrl);

    await supabase.storage.from("product_images").remove([oldPath]);
  }

  const ext = newFile.name.split(".").pop();
  const filePath = `${businessId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product_images")
    .upload(filePath, newFile);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("product_images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export default function ProductList() {
  const [editing, setEditing] = useState<{
    [key: string]: Partial<ProductProps>;
  }>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteImageId, setPendingDeleteImageId] = useState<
    string | null
  >(null);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const { products, setProducts, profile, productsLoading } = useAuth();
  const [isUploadingImageId, setIsUploadingImageId] = useState<string | null>(
    null
  );

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
    setIsEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (profile?.role !== "owner") return;
    const deletedProduct = products.find((p) => p.id === id);
    setProducts((prev) =>
      prev
        .filter((p) => p.id !== id)
        .sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        })
    );

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      toast.error("Failed to delete product.");
      if (deletedProduct) {
        setProducts((prev) => [...prev, deletedProduct]);
        return;
      }
    }

    if (deletedProduct?.image_url) {
      try {
        await deleteProductImage(deletedProduct.image_url);
      } catch (error) {
        console.error("Image clean up failed:", error);
        toast.error("Image cleanup failed");
      }
    }
    toast.success("Product deleted");
  };

  const handleRemoveImage = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product || !product.image_url) return;

    const toastId = toast.loading("Removing image...");

    try {
      await deleteProductImage(product.image_url);

      const { error } = await supabase
        .from("products")
        .update({ image_url: null })
        .eq("id", id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, image_url: null } : p))
      );

      toast.success("Image removed", { id: toastId });
      setIsEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove image", { id: toastId });
      setIsEditingId(null);
    }
  };

  const handleReplaceImage = async (id: string, file: File) => {
    if (profile?.role !== "owner") return;

    setIsUploadingImageId(id);

    const toastId = toast.loading("Uploading new image...");

    try {
      const product = products.find((p) => p.id === id);
      if (!product) throw new Error("Product not found");

      const newImageUrl = await replaceProductImage(
        product.image_url ?? null,
        file,
        profile.business_id
      );

      const { error } = await supabase
        .from("products")
        .update({ image_url: newImageUrl })
        .eq("id", id);

      if (error) throw error;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, image_url: newImageUrl } : p))
      );

      toast.success("Image updated successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update image", { id: toastId });
    } finally {
      setIsUploadingImageId(null);
    }
  };

  return (
    <>
      <Activity mode={productsLoading ? "visible" : "hidden"}>
        <Spinner className="mx-auto my-5" />
      </Activity>
      <Activity mode={productsLoading ? "hidden" : "visible"}>
        <div className="grid md:grid-cols-2 gap-4 my-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl">
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
                      <CardContent>
                        <div className="relative group overflow-hidden rounded mb-4">
                          <LazyLoadImage
                            src={product.image_url ?? "/placeholder.png"}
                            className={`w-full h-48 object-cover transition-all duration-300 ${
                              isEditingId === product.id
                                ? "cursor-pointer group-hover:scale-105"
                                : ""
                            }`}
                          />

                          {isEditingId === product.id && product.image_url && (
                            <Button
                              size={"icon"}
                              onClick={() => {
                                setPendingDeleteImageId(product.id);
                                setDeleteImageDialogOpen(true);
                              }}
                              className="absolute z-10 top-2 right-2 p-1 bg-rose-600 rounded hover:bg-rose-700 transition-colors"
                            >
                              <X />
                            </Button>
                          )}
                          {isUploadingImageId === product.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Spinner className="text-white" />
                            </div>
                          )}

                          {isEditingId === product.id &&
                            isUploadingImageId !== product.id && (
                              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                                <CameraIcon className="size-8 mb-3" />
                                <span className="text-xs font-medium">
                                  Change Photo
                                </span>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file)
                                      handleReplaceImage(product.id, file);
                                  }}
                                />
                              </label>
                            )}
                        </div>
                        <div className="space-y-3.5">
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
                                  Cost Price
                                </Label>
                                <Input
                                  className="text-sm h-[2.13rem] py-1.5 rounded"
                                  defaultValue={product.cost_price}
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
                                <p className="text-sm py-1.5 border-b">
                                  {product.name}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Cost Price
                                </Label>
                                <p className="text-sm py-1.5 border-b">
                                  {product.cost_price}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Price
                                </Label>
                                <p className="text-sm py-1.5 border-b">
                                  {product.price}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                  Stock
                                </Label>
                                <p className="text-sm py-1.5 border-b">
                                  {product.stock}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
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
                            className="hover:text-red-600 transition-colors rounded"
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

          <AlertDialog
            open={deleteImageDialogOpen}
            onOpenChange={setDeleteImageDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Image?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this image?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (pendingDeleteImageId) {
                      await handleRemoveImage(pendingDeleteImageId);
                      setDeleteImageDialogOpen(false);
                      setPendingDeleteImageId(null);
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
