"use client";

import { useState, Activity } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { supabase } from "@/lib/supabaseClient";
import type { ProductProps } from "@/lib/types";
import { Input } from "../ui/input";
import { useAppContext } from "@/hook/useAppContext";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { CameraIcon, Edit3, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [pendingDeleteImageId, setPendingDeleteImageId] = useState<
    string | null
  >(null);
  const { products, setProducts, profile, productsLoading } = useAppContext();
  const [isUploadingImageId, setIsUploadingImageId] = useState<string | null>(
    null
  );

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

    setDeleteDialogOpen(false);
    setIsDeletingId(null);
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
      setDeleteImageDialogOpen(false);
      setPendingDeleteImageId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove image", { id: toastId });
      setDeleteImageDialogOpen(false);
      setPendingDeleteImageId(null);
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
              No products availabe.
            </p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="">
                <>
                  <Card className="rounded shadow-none border">
                    <CardHeader className="flex justify-between items-center">
                      <h3 className="font-semibold tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground text-end text-xs">
                        SKU: {product.sku}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-start">
                        <p className="text-sm mt-2 mb-3.5 text-muted-foreground">
                          Stock: {product.stock}
                        </p>
                        <p className="font-semibold text-primary-400">
                          ₦{product.price}
                        </p>
                      </div>
                      <div className="relative group overflow-hidden rounded mb-4">
                        <LazyLoadImage
                          src={product.image_url ?? "/placeholder.png"}
                          className={
                            "w-full h-32 object-cover transition-all duration-300 cursor-pointer group-hover:scale-105"
                          }
                        />
                        {profile?.role === "owner" && product.image_url && (
                          <Button
                            size={"icon"}
                            onClick={() => {
                              setPendingDeleteImageId(product.id);
                              setDeleteImageDialogOpen(true);
                            }}
                            className="absolute z-10 top-2 right-2 p-1 bg-primary-100 rounded hover:bg-primary-300 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all"
                          >
                            <X />
                          </Button>
                        )}
                        {isUploadingImageId === product.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Spinner className="text-white" />
                          </div>
                        )}

                        {profile?.role === "owner" &&
                          isUploadingImageId !== product.id && (
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                              <CameraIcon className="size-6 mb-1.5" />
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
                    </CardContent>
                    {profile?.role === "owner" && (
                      <CardFooter className="justify-between">
                        <EditProductDialog product={product} />
                        <Button
                          className="bg-primary-100 hover:bg-primary-300 active:bg-primary-300 transition-colors rounded"
                          onClick={() => {
                            setIsDeletingId(product.id);
                            setDeleteDialogOpen(true);
                          }}
                          size={"icon"}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </>
              </div>
            ))
          )}

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
                    if (isDeletingId) {
                      await handleDelete(isDeletingId);
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
                <AlertDialogCancel className="rounded">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="rounded"
                  onClick={async () => {
                    if (pendingDeleteImageId) {
                      await handleRemoveImage(pendingDeleteImageId);
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

function EditProductDialog({ product }: { product: ProductProps }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(product);

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("products")
      .update({
        name: formData.name,
        price: formData.price,
        cost_price: formData.cost_price,
        stock: formData.stock,
      })
      .eq("id", product.id);

    if (error) {
      toast.error("Update failed.");
      setOpen(false);
      setLoading(false);
      throw error;
    } else {
      toast.success("Product updated!");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded" size={"icon"} variant={"outline"}>
          <Edit3 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded">
        <DialogHeader>Edit Product</DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cost-price">Cost Price</Label>
            <Input
              id="cost-price"
              className="rounded"
              value={formData.cost_price}
              onChange={(e) =>
                setFormData({ ...formData, cost_price: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Sell Price</Label>
            <Input
              id="price"
              className="rounded"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              className="rounded"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="rounded"
            variant={"ghost"}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className="bg-primary-100 rounded hover:bg-primary-400 transition-colors"
            disabled={loading}
          >
            {loading && <Spinner />} Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
