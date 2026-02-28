import { useEffect, useMemo, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  unit_price_gbp: number;
  line_total_gbp: number;
}

interface ShippingAddress {
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country: string;
}

interface AdminOrder {
  id: number;
  order_number: string;
  status: string;
  shipping_method: 'collection' | 'delivery';
  delivery_status: string | null;
  payment_status: string;
  total: number;
  currency: string;
  exchange_rate: number;
  total_gbp: number;
  delivery_cost: number;
  points_redeemed: number;
  discount_amount: number;
  gift_card_discount: number;
  created_at: string;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
}

export default function Orders() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("all");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  const openStatusDialog = (order: AdminOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success("Order status updated");
        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
        setIsStatusOpen(false);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("q", search.trim());
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (paymentStatusFilter !== "all") params.set("payment_status", paymentStatusFilter);
        if (deliveryStatusFilter !== "all") params.set("delivery_status", deliveryStatusFilter);

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
  }, [token, search, statusFilter, paymentStatusFilter, deliveryStatusFilter]);

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

      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order, name, or email..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Ready for Collection">Ready for Collection</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deliveryStatusFilter} onValueChange={setDeliveryStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Delivery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Delivery</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
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
                <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : visibleOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              visibleOrders.map((order) => (
                <Fragment key={order.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    <TableCell>
                      {expandedOrderId === order.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
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
                    <TableCell>{order.exchange_rate?.toFixed(4) || "1.0000"}</TableCell>
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
                              : order.status === "Ready for Collection"
                              ? "bg-indigo-100 text-indigo-800 border-indigo-200"
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
                        {order.shipping_method === 'delivery' && (
                          <Badge variant="outline" className="text-xs">
                            Delivery: {order.delivery_status || 'Pending'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => openStatusDialog(order, e)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedOrderId === order.id && (
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableCell colSpan={10} className="p-4 sm:p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Order Items</h4>
                            <div className="border rounded-lg bg-white overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-slate-50">
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price ({order.currency})</TableHead>
                                    {order.currency !== 'GBP' && (
                                      <TableHead className="text-right">Price (GBP)</TableHead>
                                    )}
                                    <TableHead className="text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">{item.product_name}</TableCell>
                                      <TableCell className="text-right">{item.quantity}</TableCell>
                                      <TableCell className="text-right">
                                        {currencySymbol(order.currency)}{item.unit_price.toFixed(2)}
                                      </TableCell>
                                      {order.currency !== 'GBP' && (
                                        <TableCell className="text-right text-muted-foreground">
                                          £{item.unit_price_gbp.toFixed(2)}
                                        </TableCell>
                                      )}
                                      <TableCell className="text-right font-medium">
                                        {currencySymbol(order.currency)}{item.line_total.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={order.currency !== 'GBP' ? 4 : 3} className="text-right text-muted-foreground">Subtotal</TableCell>
                                    <TableCell className="text-right">
                                      {currencySymbol(order.currency)}{(order.total - (order.delivery_cost || 0) + (order.discount_amount || 0)).toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                  {order.shipping_method === 'delivery' && (order.delivery_cost || 0) > 0 && (
                                    <TableRow>
                                      <TableCell colSpan={order.currency !== 'GBP' ? 4 : 3} className="text-right text-muted-foreground">Delivery</TableCell>
                                      <TableCell className="text-right">
                                        {currencySymbol(order.currency)}{(order.delivery_cost || 0).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  {(order.discount_amount || 0) > 0 && (
                                    <TableRow>
                                      <TableCell colSpan={order.currency !== 'GBP' ? 4 : 3} className="text-right text-green-700">Loyalty Discount</TableCell>
                                      <TableCell className="text-right text-green-700">
                                        -{currencySymbol(order.currency)}{(order.discount_amount || 0).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow className="bg-slate-50 font-medium">
                                    <TableCell colSpan={order.currency !== 'GBP' ? 4 : 3} className="text-right">Total</TableCell>
                                    <TableCell className="text-right">
                                      {currencySymbol(order.currency)}{order.total.toFixed(2)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Payment Summary</h4>
                              <div className="bg-white p-4 rounded-lg border text-sm space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Subtotal</span>
                                  <span className="font-medium">{currencySymbol(order.currency)}{order.items.reduce((sum, item) => sum + item.line_total, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Delivery</span>
                                  <span className="font-medium">{currencySymbol(order.currency)}{order.delivery_cost.toFixed(2)}</span>
                                2</div>
                                {order.discount_amount > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>Discount (Loyalty)</span>
                                    <span>-{currencySymbol(order.currency)}{order.discount_amount.toFixed(2)}</span>
                                  </div>
                                )}
                                {order.gift_card_discount > 0 && (
                                  <div className="flex justify-between text-blue-600">
                                    <span>Gift Card</span>
                                    <span>-{currencySymbol(order.currency)}{order.gift_card_discount.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
                                  <span>Total Paid</span>
                                  <span>{currencySymbol(order.currency)}{order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shipping Details</h4>
                              <div className="bg-white p-4 rounded-lg border text-sm space-y-1">
                                <p className="font-medium text-slate-900">Delivery Address</p>
                                <div className="text-muted-foreground">
                                  <p>{order.shipping_address.line1}</p>
                                  {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                                  <p>{order.shipping_address.city}, {order.shipping_address.postcode}</p>
                                  <p>{order.shipping_address.country}</p>
                                </div>
                                {(order.points_redeemed || 0) > 0 && (
                                  <div className="pt-3 text-sm">
                                    <span className="font-medium">Loyalty:</span>{" "}
                                    <span className="text-muted-foreground">{order.points_redeemed} points redeemed</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {order.currency !== 'GBP' && (
                              <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Currency Conversion</h4>
                                <div className="bg-white p-4 rounded-lg border text-sm space-y-3">
                                  <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-muted-foreground">Original Amount</span>
                                    <span className="font-medium">{currencySymbol(order.currency)}{order.total.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center pb-2 border-b">
                                    <span className="text-muted-foreground">Exchange Rate</span>
                                    <span className="font-medium">1 {order.currency} = £{(1 / (order.exchange_rate || 1)).toFixed(4)}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-1">
                                    <span className="font-medium text-slate-900">Total in GBP</span>
                                    <span className="font-bold text-lg text-slate-900">£{order.total_gbp.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Ready for Collection">Ready for Collection</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
