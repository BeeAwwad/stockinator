import AddProduct from "@/components/AddProduct";
import ProductList from "@/components/ProductList";
import { useAuth } from "@/hook/useAuth";

export default function ProductsPage() {
  const { profile, profileLoading } = useAuth();

  if (profileLoading) return <p>Loading...</p>;

  if (!profile) return;

  return (
    <div className="py-6 flex flex-col items-center">
    	<AddProduct /> 
    	<ProductList />
    </div>
  );
}
