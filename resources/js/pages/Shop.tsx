import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  price_uk_eu?: number;
  price_international?: number;
  image: string;
  stock: number;
  status: string;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const { addItem } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/public/products');
        if (!response.ok) throw new Error("Failed to load products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getQuantity = (productId: number) => {
    return quantities[productId] ?? 1;
  };

  const changeQuantity = (product: Product, delta: number) => {
    setQuantities((current) => {
      const currentQty = current[product.id] ?? 1;
      const nextQty = currentQty + delta;

      if (nextQty < 1) {
        return current;
      }

      if (product.stock > 0 && nextQty > product.stock) {
        toast.error(`Only ${product.stock} in stock for ${product.name}`);
        return current;
      }

      return { ...current, [product.id]: nextQty };
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="bg-muted py-12 md:py-16">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
              Shop All
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our complete collection of authentic African products.
            </p>
          </div>
        </div>

        <div className="container py-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-80 w-full rounded-xl" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    {product.status === "Out of Stock" ? (
                      <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    ) : product.status === "Low Stock" ? (
                      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-900 text-xs font-bold px-2 py-1 rounded border border-yellow-300">
                        Low Stock
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto gap-2">
                      <span className="font-bold text-lg">
                        {format(
                          Number(product.price_uk_eu ?? product.price),
                          Number(product.price_international ?? product.price)
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={product.status === "Out of Stock"}
                            onClick={() => changeQuantity(product, -1)}
                          >
                            -
                          </Button>
                          <span className="px-2 text-sm min-w-[2rem] text-center">
                            {getQuantity(product.id)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={product.status === "Out of Stock"}
                            onClick={() => changeQuantity(product, 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          disabled={product.status === "Out of Stock"}
                          onClick={() => {
                            const qty = getQuantity(product.id);
                            if (product.stock > 0 && qty > product.stock) {
                              toast.error(`Only ${product.stock} in stock for ${product.name}`);
                              return;
                            }
                            const baseUkEu = Number(product.price_uk_eu ?? product.price);
                            const baseIntl = Number(product.price_international ?? product.price);
                            const unitPrice = baseUkEu;

                            addItem(
                              {
                                id: product.id,
                                name: product.name,
                                price: unitPrice,
                                image: product.image,
                              },
                              qty
                            );
                            toast.success(`${product.name} added to cart`);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
