import AddProduct from "@/components/AddProduct";
import ProductList from "@/components/ProductList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/hook/useAuth";

export default function ProductsPage() {
  const { profile, profileLoading } = useAuth();

  if (profileLoading) return <p>Loading...</p>;

  if (!profile) return;

  return (
    <div className="py-6 flex flex-col items-center">
      {profile.role === "owner" && (
        <Card className="w-full grid gap-4 mt-8 max-w-lg md:max-w-xl lg:max-w-2xl">
          <CardHeader>
            <CardTitle className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Add Product
            </CardTitle>
            <CardDescription>Add products to your businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <AddProduct
              isOwner={profile.role === "owner"}
              businessId={profile.business_id}
            />
          </CardContent>
        </Card>
      )}
      <ProductList isOwner={profile.role === "owner"} />
    </div>
  );
}
