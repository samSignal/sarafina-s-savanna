import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AdminOrder {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  exchange_rate: number;
  total_gbp: number;
  created_at: string;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
}

export default function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) {
          params.set("q", search.trim());
        }

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/admin/orders?${params.toString()}`, {
          headers,
        });

        if (!response.ok) {
          return;
        }

        const data: AdminOrder[] = await response.json();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, search]);

  const visibleOrders = useMemo(() => orders, [orders]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage and track customer orders.</p>
        </div>
        <Button variant="outline">
          Export Orders
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order, name, or email..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total (Original)</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Total (GBP)</TableHead>
              <TableHead>Exch. Rate</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : visibleOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              visibleOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.order_number}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.customer_name || "Unknown customer"}</span>
                      {order.customer_email && (
                        <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {currencySymbol(order.currency)}
                    {order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>{order.currency}</TableCell>
                  <TableCell>
                    {currencySymbol('GBP')}
                    {order.total_gbp.toFixed(2)}
                  </TableCell>
                  <TableCell>{order.exchange_rate.toFixed(4)}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className={
                          order.status === "Completed"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : order.status === "Shipped"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-900 border-yellow-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {order.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Payment: {order.payment_status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (order.customer_id) {
                          navigate(`/admin/customers/${order.customer_id}`);
                        }
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
