import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { Gift, Mail, Plus, Minus, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  price_uk_eu?: number;
  price_international?: number;
  image: string;
  type: string;
}

const GiftCardPurchase = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [recipientEmail, setRecipientEmail] = useState("");
  const { addItem } = useCart();
  const { format } = useCurrency();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/gift-cards/products');
        if (!response.ok) throw new Error("Failed to load products");
        const data = await response.json();
        // Sort by price just in case
        const giftCards = data
            .sort((a: Product, b: Product) => (a.price_uk_eu || a.price) - (b.price_uk_eu || b.price));
            
        setProducts(giftCards);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load gift cards");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (id: number, delta: number) => {
      setQuantities(prev => {
          const current = prev[id] || 0;
          const next = Math.max(0, current + delta);
          if (next === 0) {
              const { [id]: _, ...rest } = prev;
              return rest;
          }
          return { ...prev, [id]: next };
      });
  };

  const handleAddToCart = () => {
    const selectedIds = Object.keys(quantities).map(Number);
    if (selectedIds.length === 0) {
        toast.error("Please select at least one gift card");
        return;
    }
    
    if (!recipientEmail) {
        toast.error("Please enter a recipient email");
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
        toast.error("Please enter a valid email address");
        return;
    }

    let addedCount = 0;
    selectedIds.forEach(id => {
        const product = products.find(p => p.id === id);
        const qty = quantities[id];
        
        if (product && qty > 0) {
            const priceUk = Number(product.price_uk_eu ?? product.price);
            
            addItem({
                id: product.id,
                name: product.name,
                price: priceUk,
                image: product.image,
                metadata: {
                    recipient_email: recipientEmail
                }
            }, qty);
            addedCount += qty;
        }
    });

    toast.success(`${addedCount} gift card(s) added to cart`);
    setQuantities({});
    setRecipientEmail("");
  };

  const getPrice = (product: Product) => {
      const uk = Number(product.price_uk_eu ?? product.price);
      const intl = Number(product.price_international ?? product.price);
      return format(uk, intl);
  };

  const getTotalPrice = () => {
      let totalUk = 0;
      let totalIntl = 0;
      Object.entries(quantities).forEach(([id, qty]) => {
          const product = products.find(p => p.id === Number(id));
          if (product) {
               totalUk += Number(product.price_uk_eu ?? product.price) * qty;
               totalIntl += Number(product.price_international ?? product.price) * qty;
          }
      });
      return format(totalUk, totalIntl);
  };

  const totalQuantity = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-display font-bold text-primary mb-4">
                    Give the Gift of Sarafina's
                </h1>
                <p className="text-lg text-muted-foreground">
                    Digital gift cards for your friends and family. Delivered instantly via email.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading gift cards...</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    <div className="bg-muted rounded-xl overflow-hidden aspect-video relative shadow-lg sticky top-24">
                        <img 
                            src="/images/gift-card.jpg" 
                            alt="Sarafina Gift Card" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000&auto=format&fit=crop";
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="text-white text-center p-6">
                                <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
                                <h3 className="text-2xl font-bold mb-2">Sarafina</h3>
                                <p className="font-medium">Gift Card</p>
                                {totalQuantity > 0 && (
                                    <p className="text-3xl font-bold mt-4">
                                        {getTotalPrice()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <Label className="text-base mb-3 block">Select Denominations</Label>
                            <div className="space-y-3">
                                {products.map(product => (
                                    <div 
                                        key={product.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                            quantities[product.id] ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted hover:border-primary/50'
                                        }`}
                                    >
                                        <div className="font-bold text-lg">
                                            {getPrice(product)}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {quantities[product.id] ? (
                                                <>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        className="h-9 w-9"
                                                        onClick={() => handleQuantityChange(product.id, -1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center font-bold text-lg">
                                                        {quantities[product.id]}
                                                    </span>
                                                    <Button 
                                                        variant="outline" 
                                                        size="icon" 
                                                        className="h-9 w-9"
                                                        onClick={() => handleQuantityChange(product.id, 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleQuantityChange(product.id, 1)}
                                                >
                                                    Add
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-lg">Total Amount</span>
                                <span className="font-bold text-2xl text-primary">{getTotalPrice()}</span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Recipient Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="email" 
                                        type="email"
                                        placeholder="friend@example.com" 
                                        className="pl-9"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    We'll send the unique gift card code(s) to this email address immediately after purchase.
                                </p>
                            </div>

                            <Button 
                                size="lg" 
                                className="w-full h-14 text-lg" 
                                onClick={handleAddToCart}
                                disabled={totalQuantity === 0}
                            >
                                <ShoppingCart className="mr-2 w-5 h-5" />
                                Add {totalQuantity > 0 ? `${totalQuantity} Item${totalQuantity > 1 ? 's' : ''}` : ''} to Cart
                            </Button>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2 text-muted-foreground">
                            <p>• Valid for 24 months from date of purchase.</p>
                            <p>• Can be used for any products on our store.</p>
                            <p>• Balance can be used over multiple purchases.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GiftCardPurchase;
