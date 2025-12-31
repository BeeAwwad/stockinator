import AddProduct from "@/components/AddProduct";
import ProductList from "@/components/ProductList";
import { useAppContext } from "@/hook/useAppContext";

export default function ProductsPage() {
  const { profile, profileLoading } = useAppContext();

  if (profileLoading) return <p>Loading...</p>;

  if (!profile) return;

  return (
    <div className="py-6 flex flex-col items-center">
      <AddProduct />
      <ProductList />
    </div>
  );
}
