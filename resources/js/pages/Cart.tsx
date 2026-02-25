import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

interface LiveProduct {
  id: number;
  name: string;
  price: number;
  price_uk_eu?: number;
  price_international?: number;
  image: string;
  stock: number;
  status: string;
}

const Cart = () => {
  const { items, totalItems, totalPrice, updateItem, removeItem, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { format, convert, selected } = useCurrency();

  useEffect(() => {
    const syncCart = async () => {
      if (!items.length) {
        setLiveProducts([]);
        return;
      }

      setSyncing(true);
      try {
        const response = await fetch("/api/public/products");
        if (!response.ok) {
          return;
        }
        const data: LiveProduct[] = await response.json();
        setLiveProducts(data);

        data.forEach((product) => {
          const inCart = items.find((item) => item.id === product.id);
          if (inCart) {
            const ukPrice = Number(product.price_uk_eu ?? product.price);
            if (inCart.price !== ukPrice || inCart.name !== product.name || inCart.image !== product.image) {
              updateItem(product.id, {
                price: ukPrice,
                name: product.name,
                image: product.image,
              });
            }
          }
        });
      } finally {
        setSyncing(false);
      }
    };

    syncCart();
  }, [items, updateItem]);

  const liveMap = useMemo(() => {
    const map = new Map<number, LiveProduct>();
    liveProducts.forEach((p) => map.set(p.id, p));
    return map;
  }, [liveProducts]);

  const hasUnavailableItems = useMemo(
    () =>
      items.some((item) => {
        const live = liveMap.get(item.id);
        if (!live) return true;
        return live.status === "Out of Stock";
      }),
    [items, liveMap]
  );

  const handleCheckout = async () => {
    if (isCheckingOut) return;
    
    if (!totalItems) {
      toast.error("Your cart is empty");
      return;
    }

    if (hasUnavailableItems) {
      toast.error("Some items in your cart are no longer available");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error("Please sign in to checkout");
      navigate("/login");
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          currency: selected.code,
          rate: selected.rate,
        }),
      });

      if (!response.ok) {
        setIsCheckingOut(false);
        let message = "Unable to start checkout. Please try again.";

        try {
          const errorData = await response.json();
          if (errorData && typeof errorData.message === "string") {
            message = errorData.message;
          }
        } catch {
        }

        toast.error(message);
        return;
      }

      const data = await response.json();

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        setIsCheckingOut(false);
        toast.error("Checkout session could not be created.");
      }
    } catch {
      setIsCheckingOut(false);
      toast.error("Something went wrong starting the checkout.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-10">
        <h1 className="text-3xl font-display font-bold mb-6 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-primary" />
          Your cart
        </h1>

        {!items.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-muted-foreground mb-6">
              Browse our products and add your favourites to the cart.
            </p>
            <a href="/shop">
              <Button>Start shopping</Button>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const live = liveMap.get(item.id);
                const isMissing = !live;
                const isOutOfStock = live?.status === "Out of Stock";
                const isLowStock = live?.status === "Low Stock";
                const baseUkEu = live ? Number(live.price_uk_eu ?? live.price) : item.price;
                const baseIntl = live ? Number(live.price_international ?? live.price) : item.price;
                const displayPrice = convert(baseUkEu, baseIntl);

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-card border rounded-lg p-4"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {(live?.image || item.image) ? (
                        <img
                          src={live?.image || item.image}
                          alt={live?.name || item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium flex items-center gap-2">
                        <span>{live?.name || item.name}</span>
                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-[10px]">
                            Out of Stock
                          </Badge>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <Badge className="bg-yellow-100 text-yellow-900 border-yellow-300 text-[10px]">
                            Low Stock
                          </Badge>
                        )}
                        {isMissing && (
                          <Badge variant="destructive" className="text-[10px]">
                            Unavailable
                          </Badge>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Quantity:</span>
                        <div className="flex items-center border rounded-md">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              const nextQty = item.quantity - 1;
                              if (nextQty <= 0) {
                                removeItem(item.id);
                                return;
                              }
                              updateItem(item.id, { quantity: nextQty });
                            }}
                          >
                            -
                          </Button>
                          <span className="px-2 text-xs min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={isOutOfStock || isMissing}
                            onClick={() => {
                              const nextQty = item.quantity + 1;
                              if (live && live.stock > 0 && nextQty > live.stock) {
                                toast.error(`Only ${live.stock} in stock for ${live.name}`);
                                return;
                              }
                              updateItem(item.id, { quantity: nextQty });
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      {live && baseUkEu !== item.price && (
                        <p className="text-xs text-muted-foreground">
                          Price updated to {format(baseUkEu, baseIntl)}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-semibold">
                        {format(baseUkEu * item.quantity, baseIntl * item.quantity)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-card border rounded-lg p-6 h-fit space-y-3">
              <h2 className="text-lg font-semibold mb-2">Order summary</h2>
              <div className="flex justify-between text-sm">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>
                  {format(
                    items.reduce((sum, item) => {
                      const live = liveMap.get(item.id);
                      const uk = live ? Number(live.price_uk_eu ?? live.price) : item.price;
                      return sum + uk * item.quantity;
                    }, 0),
                    items.reduce((sum, item) => {
                      const live = liveMap.get(item.id);
                      const intl = live ? Number(live.price_international ?? live.price) : item.price;
                      return sum + intl * item.quantity;
                    }, 0)
                  )}
                </span>
              </div>
              {hasUnavailableItems && (
                <p className="text-xs text-destructive">
                  Some items are unavailable or out of stock. Please update your cart.
                </p>
              )}
              <Button
                className="w-full mt-4"
                onClick={handleCheckout}
                disabled={hasUnavailableItems || syncing || isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Proceed to checkout"}
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={() => {
                  clearCart();
                  toast.success("Cart cleared");
                }}
              >
                Clear cart
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
