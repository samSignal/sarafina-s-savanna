import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface Order {
  id: number;
  order_number: string;
  total: number;
  currency: string;
  status: string;
  payment_status: string;
  shipping_method: string;
  delivery_status: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  items: OrderItem[];
}

const MyOrders = () => {
  const { token, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const { clearCart } = useCart();
  const checkoutHandledRef = useRef(false);

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/client/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    loadOrders();
  }, [loading, isAuthenticated, token, navigate]);

  useEffect(() => {
    const status = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");

    if (!status) {
      return;
    }

    if (checkoutHandledRef.current) {
      searchParams.delete("checkout");
      searchParams.delete("session_id");
      setSearchParams(searchParams, { replace: true });
      return;
    }

    checkoutHandledRef.current = true;

    const handle = async () => {
      if (status === "success") {
        clearCart();

        if (sessionId) {
          try {
            const response = await fetch("/api/checkout/confirm", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ session_id: sessionId }),
            });

            if (response.ok) {
              toast.success("Payment successful. Your order has been placed.");
              await loadOrders();
            } else {
              toast.success("Payment successful. Your order has been placed.");
            }
          } catch {
            toast.success("Payment successful. Your order has been placed.");
          }
        } else {
          toast.success("Payment successful. Your order has been placed.");
        }
      } else if (status === "cancelled") {
        toast.error("Checkout was cancelled.");
      } else {
        return;
      }

      searchParams.delete("checkout");
      searchParams.delete("session_id");
      setSearchParams(searchParams, { replace: true });
    };

    handle();
  }, [searchParams, setSearchParams, clearCart]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const currencySymbol = (code: string) => {
    const upper = code?.toUpperCase() || "GBP";
    if (upper === "GBP") return "£";
    if (upper === "USD") return "$";
    if (upper === "EUR") return "€";
    if (upper === "ZAR") return "R";
    if (upper === "NGN") return "₦";
    if (upper === "AUD") return "$";
    if (upper === "CAD") return "$";
    return upper + " ";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold">
              My Orders
            </h1>
            <p className="text-muted-foreground">
              View your current and past orders.
            </p>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : !orders.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg font-medium mb-2">
              You don&apos;t have any orders yet.
            </p>
            <p className="text-muted-foreground mb-6">
              Browse our products and place your first order.
            </p>
            <a href="/shop">
              <Button>Start shopping</Button>
            </a>
          </div>
        ) : (
          <div className="space-y-10">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Order history
                </h2>
              </div>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <p className="font-semibold">
                          Order #{order.order_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Placed on {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {currencySymbol(order.currency)}
                          {Number(order.total).toFixed(2)}
                        </p>
                        <div className="flex flex-col gap-1 items-end mt-1">
                          <div className="flex gap-2 justify-end">
                            <Badge variant="outline">
                              {order.status}
                            </Badge>
                            <Badge variant="outline">
                              Payment: {order.payment_status}
                            </Badge>
                          </div>
                          {order.shipping_method === 'delivery' ? (
                             <div className="flex flex-col items-end gap-1">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                  Delivery: {order.delivery_status || 'Pending'}
                                </Badge>
                                {order.estimated_delivery_date && (
                                  <span className="text-xs text-muted-foreground">
                                    ETA: {new Date(order.estimated_delivery_date).toLocaleString()}
                                  </span>
                                )}
                             </div>
                          ) : (
                             <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                               Collection
                             </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.quantity} × {item.product_name}
                          </span>
                          <span>
                            {currencySymbol(order.currency)}
                            {Number(item.line_total).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
