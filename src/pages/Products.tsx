import AddProduct from "@/components/product/AddProduct";
import ProductList from "@/components/product/ProductList";
import { Spinner } from "@/components/ui/spinner";
import { useProfile } from "@/queries/useProfile";
import { useProductRealtime } from "@/realtime/useProductsRealtime";

export default function ProductsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const businessId = profile?.business_id;

  useProductRealtime(businessId);

  if (profileLoading)
    return (
      <div className="flex justify-center items-center">
        <p>Page Loading</p>
        <Spinner />
      </div>
    );

  return (
    <div className="py-6 flex flex-col items-center">
      <AddProduct />
      <ProductList />
    </div>
  );
}
