import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { items, totalItems, totalPrice, removeItem, clearCart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!totalItems) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isAuthenticated || !token) {
      toast.error("Please sign in to checkout");
      navigate("/login");
      return;
    }

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
        }),
      });

      if (!response.ok) {
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
        window.location.href = data.url;
      } else {
        toast.error("Checkout session could not be created.");
      }
    } catch {
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
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-card border rounded-lg p-4"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">
                      R{(item.price * item.quantity).toFixed(2)}
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
              ))}
            </div>

            <div className="bg-card border rounded-lg p-6 h-fit space-y-3">
              <h2 className="text-lg font-semibold mb-2">Order summary</h2>
              <div className="flex justify-between text-sm">
                <span>Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>R{totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-4" onClick={handleCheckout}>
                Proceed to checkout
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
