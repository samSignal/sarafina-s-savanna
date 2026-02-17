import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  status: string;
  category_id: number;
}

interface Department {
  id: number;
  name: string;
  description: string;
  image: string;
  products: Product[];
}

const Category = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await fetch(`/api/departments/${id}`);
        if (!response.ok) throw new Error("Failed to load department");
        const data = await response.json();
        setDepartment(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load category details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDepartment();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container py-12">
          <Skeleton className="h-64 w-full rounded-xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero / Header Section */}
        <div className="bg-muted py-12 md:py-16">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-primary">
                  {department.name}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {department.description || "Explore our collection of authentic products."}
                </p>
              </div>
              {department.image && (
                <div className="w-full md:w-1/3 max-w-sm rounded-xl overflow-hidden shadow-lg bg-white border flex items-center justify-center">
                  <img 
                    src={department.image} 
                    alt={department.name}
                    className="max-h-64 w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="container py-12">
          {department.products && department.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {department.products
                .filter((product) =>
                  categoryFilter
                    ? String(product.category_id) === categoryFilter
                    : true
                )
                .map((product) => (
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
                    {product.stock <= 0 && (
                      <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-lg">
                        R{Number(product.price).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        disabled={product.stock <= 0}
                        onClick={() => {
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: Number(product.price),
                            image: product.image,
                          });
                          toast.success(`${product.name} added to cart`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products found in this category.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category;
