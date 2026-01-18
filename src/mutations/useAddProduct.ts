import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { productSchema } from "@/lib/schemas";
import z from "zod";

type ProductFormProps = z.infer<typeof productSchema>;

type AddProductInput = {
  data: ProductFormProps;
  businessId: string;
  imageFile?: File | null;
};

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

export function useAddProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, businessId, imageFile }: AddProductInput) => {
      let imageUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile, businessId);
      }
      const sku = `${data.name.slice(0, 3).toUpperCase()}-${Date.now()
        .toString()
        .slice(-5)}`;

      const { error } = await supabase.from("products").insert({
        business_id: businessId,
        name: data.name,
        sku,
        price: Number(data.price),
        cost_price: Number(data.cost_price),
        stock: Number(data.stock),
        image_url: imageUrl,
      });

      if (error) throw error;
    },

    onSuccess: (_data, variables) => {
      toast.success("Product added sucessfully");

      queryClient.invalidateQueries({
        queryKey: ["products", variables.businessId],
      });
    },

    onError: (error) => {
      console.error(error);
      toast.error("Failed to add product");
    },
  });
}
