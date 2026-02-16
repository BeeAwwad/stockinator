import type { ProductProps } from "@/lib/types";
import { LazyLoadImage } from "react-lazy-load-image-component";

type ProductCardProps = {
  product: ProductProps;
  onAdd: (product: ProductProps) => void;
};

const LOW_STOCK_THRESHOLD = 5;

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;
  return (
    <div
      onClick={() => {
        if (!isOutOfStock) {
          onAdd(product);
        }
      }}
      className="relative cursor-pointer shadow-xs bg-slate-100 rounded p-3 group hover:px-3.5 active:px-3.5 transition-all mr-3 flex flex-col gap-2"
    >
      <div className="overflow-hidden h-32 md:h-20 max-h-32 md:max-h-20 rounded">
        <LazyLoadImage
          placeholderSrc="/placeholder.png"
          effect="black-and-white"
          src={product.image_url || "/placeholder.png"}
          alt={product.name}
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover rounded"
        />
      </div>

      {isLowStock && (
        <span className="absolute top-2 left-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">
          Low stock
        </span>
      )}

      {isOutOfStock && (
        <span className="absolute top-2 left-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded">
          Out of stock
        </span>
      )}
      <div className="space-y-1">
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
        <p className="text-sm font-medium">₦{product.price}</p>
      </div>
    </div>
  );
}
