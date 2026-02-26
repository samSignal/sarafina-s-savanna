import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Truck, Store, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [liveProducts, setLiveProducts] = useState<LiveProduct[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { format, convert, selected } = useCurrency();
  const [pointsRedeemed, setPointsRedeemed] = useState<number | string>(0);

  // Checkout State
  const [shippingMethod, setShippingMethod] = useState<"collection" | "delivery">("collection");
  const [deliveryCostGbp, setDeliveryCostGbp] = useState(5.00);
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    // Fetch delivery settings
    const fetchDeliverySettings = async () => {
        try {
            const res = await fetch('/api/delivery/settings');
            if (res.ok) {
                const data = await res.json();
                setDeliveryCostGbp(Number(data.cost));
            }
        } catch (error) {
            console.error("Failed to fetch delivery settings");
        }
    };
    fetchDeliverySettings();
  }, []);

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

  const subtotalUk = items.reduce((sum, item) => {
    const live = liveMap.get(item.id);
    const uk = live ? Number(live.price_uk_eu ?? live.price) : item.price;
    return sum + uk * item.quantity;
  }, 0);

  const subtotalIntl = items.reduce((sum, item) => {
    const live = liveMap.get(item.id);
    const intl = live ? Number(live.price_international ?? live.price) : item.price;
    return sum + intl * item.quantity;
  }, 0);

  const currentDeliveryCost = shippingMethod === 'delivery' ? format(deliveryCostGbp, deliveryCostGbp) : "Free";
  const numericDeliveryCost = shippingMethod === 'delivery' ? (selected.code === 'GBP' ? deliveryCostGbp : deliveryCostGbp * selected.rate) : 0;
  
  const totalDisplay = selected.code === 'GBP' 
    ? subtotalUk + numericDeliveryCost
    : (subtotalIntl * selected.rate) + numericDeliveryCost;

  // Loyalty Calculation
  const totalGbp = subtotalUk + (shippingMethod === 'delivery' ? deliveryCostGbp : 0);
  const maxRedeemablePoints = Math.floor(totalGbp * 0.30 * 100);
  const availablePoints = user?.points_balance || 0;
  const maxPoints = Math.min(maxRedeemablePoints, availablePoints);

  const appliedPoints = typeof pointsRedeemed === 'string' ? 0 : pointsRedeemed;
  const discountValueGbp = appliedPoints / 100;
  const discountValue = selected.code === 'GBP' ? discountValueGbp : discountValueGbp * selected.rate;
  const finalTotal = Math.max(0, totalDisplay - discountValue);

  // Reset points when total changes
  useEffect(() => {
      setPointsRedeemed(0);
  }, [totalGbp, shippingMethod, items]);

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

    if (shippingMethod === 'delivery') {
        if (!contactPerson) {
            toast.error("Please enter a contact person");
            return;
        }
        if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.country) {
            toast.error("Please fill in all required address fields");
            return;
        }
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
          shipping_method: shippingMethod,
          contact_person: contactPerson,
          contact_phone: contactPhone,
          shipping_address: shippingMethod === 'delivery' ? shippingAddress : null,
          points_redeemed: appliedPoints,
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

            <div className="bg-card border rounded-lg p-6 h-fit space-y-6">
              <div>
                  <h2 className="text-lg font-semibold mb-4">Shipping Method</h2>
                  <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as "collection" | "delivery")} className="space-y-3">
                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="collection" id="collection" />
                      <Label htmlFor="collection" className="flex-1 cursor-pointer flex items-center gap-2">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span>Collection from Shop</span>
                        <span className="ml-auto text-sm text-green-600 font-medium">Free</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span>Delivery</span>
                        <span className="ml-auto text-sm font-medium">{convert(deliveryCostGbp, deliveryCostGbp * selected.rate)}</span>
                      </Label>
                    </div>
                  </RadioGroup>
              </div>

              {shippingMethod === 'delivery' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Separator />
                      <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" /> Contact Details
                          </h3>
                          <div className="space-y-3">
                              <div className="grid gap-1.5">
                                  <Label htmlFor="contact_person">Contact Person *</Label>
                                  <Input 
                                      id="contact_person" 
                                      placeholder="Full Name"
                                      value={contactPerson}
                                      onChange={(e) => setContactPerson(e.target.value)}
                                  />
                              </div>
                              <div className="grid gap-1.5">
                                  <Label htmlFor="contact_phone">Phone Number (Optional)</Label>
                                  <Input 
                                      id="contact_phone" 
                                      placeholder="+44 7123 456789"
                                      value={contactPhone}
                                      onChange={(e) => setContactPhone(e.target.value)}
                                  />
                              </div>
                          </div>
                      </div>

                      <Separator />
                      
                      <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> Delivery Address
                          </h3>
                          <div className="space-y-3">
                              <div className="grid gap-1.5">
                                  <Label htmlFor="line1">Address Line 1 *</Label>
                                  <Input 
                                      id="line1" 
                                      placeholder="Street address"
                                      value={shippingAddress.line1}
                                      onChange={(e) => setShippingAddress({...shippingAddress, line1: e.target.value})}
                                  />
                              </div>
                              <div className="grid gap-1.5">
                                  <Label htmlFor="line2">Address Line 2</Label>
                                  <Input 
                                      id="line2" 
                                      placeholder="Apartment, suite, etc."
                                      value={shippingAddress.line2}
                                      onChange={(e) => setShippingAddress({...shippingAddress, line2: e.target.value})}
                                  />
                              </div>
                              <div className="grid gap-1.5">
                                  <Label htmlFor="city">City *</Label>
                                  <Input 
                                      id="city" 
                                      placeholder="City"
                                      value={shippingAddress.city}
                                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                                  />
                              </div>
                              <div className="grid gap-1.5">
                                  <Label htmlFor="country">Country *</Label>
                                  <Input 
                                      id="country" 
                                      placeholder="Country"
                                      value={shippingAddress.country}
                                      onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              <Separator />

              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Order summary</h2>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    {format(subtotalUk, subtotalIntl)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>{currentDeliveryCost}</span>
                </div>

                {isAuthenticated && maxPoints > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between items-center">
                          <Label htmlFor="points" className="flex items-center gap-2">
                              Redeem Points
                              <Badge variant="secondary" className="text-xs">
                                  Max: {maxPoints}
                              </Badge>
                          </Label>
                          <span className="text-sm text-muted-foreground">
                              Available: {availablePoints}
                          </span>
                      </div>
                      <div className="flex gap-2">
                          <Input 
                              id="points"
                              type="number"
                              min="0"
                              max={maxPoints}
                              value={pointsRedeemed}
                              onChange={(e) => {
                                  const valStr = e.target.value;
                                  if (valStr === '') {
                                      setPointsRedeemed('');
                                      return;
                                  }
                                  const val = parseInt(valStr);
                                  if (!isNaN(val)) {
                                      setPointsRedeemed(Math.min(val, maxPoints));
                                  }
                              }}
                              className="h-8"
                          />
                      </div>
                      {appliedPoints > 0 && (
                          <div className="flex justify-between text-green-600 font-medium text-sm">
                              <span>Discount</span>
                              <span>-{selected.symbol}{discountValue.toFixed(2)}</span>
                          </div>
                      )}
                  </div>
                )}

                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {selected.symbol}{finalTotal.toFixed(2)}
                  </span>
                </div>
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
