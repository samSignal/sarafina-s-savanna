import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, FileText, CheckCircle, XCircle, AlertCircle, Download, Plus, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RefundRulesDialog } from "@/components/RefundRulesDialog";

// Interfaces
interface RefundItem {
    id: number;
    refund_id: number;
    order_item_id: number;
    quantity: number;
    amount: number;
    product_id: number;
    product?: {
        name: string;
    };
}

interface Refund {
    id: number;
    order_id: number;
    amount: number;
    reason: string;
    status: 'pending' | 'pending_approval' | 'approved' | 'rejected' | 'processed' | 'failed';
    created_at: string;
    admin_id: number | null;
    stripe_refund_id: string | null;
    notes: string | null;
    order: {
        id: number;
        order_number: string;
        total: number;
        currency: string;
        user: {
            name: string;
            email: string;
        } | null;
    };
    items: RefundItem[];
}

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    line_total: number;
    unit_price: number;
}

interface Order {
    id: number;
    order_number: string;
    total: number;
    currency: string;
    items: OrderItem[];
    user: {
        name: string;
        email: string;
    } | null;
}

export default function Refunds() {
    const { token } = useAuth();
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ pending: 0, processed_today: 0, total_refunded: 0 });

    // Approval Dialog State
    const [approvalRefund, setApprovalRefund] = useState<Refund | null>(null);
    const [approvalAmount, setApprovalAmount] = useState<number>(0);
    const [approvalRestock, setApprovalRestock] = useState<boolean>(true);
    const [approvalNotes, setApprovalNotes] = useState<string>("");
    const [approving, setApproving] = useState(false);

    // View Dialog State
    const [viewRefund, setViewRefund] = useState<Refund | null>(null);

    // New Refund Dialog State
    const [isNewRefundOpen, setIsNewRefundOpen] = useState(false);
    const [orderSearch, setOrderSearch] = useState("");
    const [foundOrder, setFoundOrder] = useState<Order | null>(null);
    const [refundReason, setRefundReason] = useState("");
    const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({}); // itemId -> quantity
    const [refundAmount, setRefundAmount] = useState(0);
    const [restock, setRestock] = useState(true);
    const [refundNotes, setRefundNotes] = useState("");
    const [eligibilityCheck, setEligibilityCheck] = useState<{ eligible: boolean, reason?: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            fetchRefunds();
            fetchStats();
        }
    }, [token]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/refunds/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const fetchRefunds = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/refunds', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setRefunds(data.data || []);
        } catch (error) {
            console.error("Failed to fetch refunds", error);
            toast.error("Failed to load refunds");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (refund: Refund) => {
        setApprovalRefund(refund);
        setApprovalAmount(Number(refund.amount));
        setApprovalRestock(true);
        setApprovalNotes(refund.notes || "");
    };

    const handleView = (refund: Refund) => {
        setViewRefund(refund);
    };

    const confirmApprove = async () => {
        if (!approvalRefund) return;
        setApproving(true);
        try {
            const response = await fetch(`/api/admin/refunds/${approvalRefund.id}/approve`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    amount: approvalAmount,
                    restock: approvalRestock,
                    notes: approvalNotes
                })
            });
            
            if (response.ok) {
                toast.success("Refund approved successfully");
                setApprovalRefund(null);
                fetchRefunds();
                fetchStats();
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to approve refund");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setApproving(false);
        }
    };

    const handleExport = () => {
        window.open(`/api/admin/refunds/export?token=${token}`, '_blank');
    };

    // New Refund Logic
    const searchOrder = async () => {
        if (!orderSearch) return;
        try {
            setFoundOrder(null);
            setEligibilityCheck(null);
            setSelectedItems({});
            setRefundAmount(0);

            const response = await fetch(`/api/admin/orders?q=${orderSearch}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            // AdminOrderController returns array directly
            const orders = data;
            const order = orders.find((o: any) => o.order_number === orderSearch);
            
            if (order) {
                setFoundOrder(order);
                checkEligibility(order.id);
            } else {
                toast.error("Order not found");
                setFoundOrder(null);
            }
        } catch (error) {
            toast.error("Error searching order");
        }
    };

    const checkEligibility = async (orderId: number) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/refund-eligibility`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setEligibilityCheck(data);
            if (!data.eligible) {
                toast.warning(`Order not eligible: ${data.reason}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleItemSelection = (itemId: number, quantity: number, maxQty: number) => {
        let newQty = quantity;
        if (newQty < 0) newQty = 0;
        if (newQty > maxQty) newQty = maxQty;
        
        const newSelected = { ...selectedItems };
        if (newQty > 0) {
            newSelected[itemId] = newQty;
        } else {
            delete newSelected[itemId];
        }
        setSelectedItems(newSelected);
        
        // Recalculate amount
        if (foundOrder) {
            let total = 0;
            Object.entries(newSelected).forEach(([id, qty]) => {
                const item = foundOrder.items.find(i => i.id === Number(id));
                if (item) {
                    const unitPrice = item.unit_price; // Use unit_price from API
                    total += unitPrice * qty;
                }
            });
            setRefundAmount(parseFloat(total.toFixed(2)));
        }
    };

    const submitRefund = async () => {
        if (!foundOrder) return;
        
        const items = Object.entries(selectedItems).map(([id, qty]) => {
            const item = foundOrder.items.find((i: any) => i.id === Number(id));
            return {
                order_item_id: Number(id),
                product_id: item?.product_id,
                quantity: qty,
                amount: (item?.unit_price || 0) * qty
            };
        });

        if (items.length === 0 && refundAmount <= 0) {
            toast.error("Please select items or enter an amount");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch('/api/admin/refunds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_id: foundOrder.id,
                    reason: refundReason,
                    items: items,
                    amount: refundAmount, // Optional override if needed, but usually calculated from items
                    restock_items: restock,
                    notes: refundNotes
                })
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse response JSON", text);
                throw new Error("Server returned non-JSON response");
            }

            if (response.ok) {
                toast.success("Refund request created successfully");
                setIsNewRefundOpen(false);
                // Reset form
                setFoundOrder(null);
                setOrderSearch("");
                setRefundReason("");
                setSelectedItems({});
                setRefundAmount(0);
                setRefundNotes("");
                fetchRefunds();
                fetchStats();
            } else {
                toast.error(result.message || "Failed to create refund");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'processed': return <Badge className="bg-green-500">Processed</Badge>;
            case 'approved': return <Badge className="bg-blue-500">Approved</Badge>;
            case 'pending': return <Badge className="bg-yellow-500">Pending</Badge>;
            case 'pending_approval': return <Badge className="bg-purple-500">Needs Approval</Badge>;
            case 'rejected': return <Badge className="bg-red-500">Rejected</Badge>;
            case 'failed': return <Badge className="bg-red-700">Failed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Refunds</h2>
                    <p className="text-muted-foreground">Manage customer refunds and returns.</p>
                </div>
                <div className="flex gap-2">
                    <RefundRulesDialog />
                    <Button variant="outline" onClick={fetchRefunds}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Dialog open={isNewRefundOpen} onOpenChange={setIsNewRefundOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Refund
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Refund Request</DialogTitle>
                                <DialogDescription>
                                    Search for an order to initiate a refund.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Order Number (e.g., ORD-12345)" 
                                        value={orderSearch}
                                        onChange={(e) => setOrderSearch(e.target.value)}
                                    />
                                    <Button onClick={searchOrder} disabled={!orderSearch}>Search</Button>
                                </div>

                                {foundOrder && (
                                    <div className="space-y-4 border rounded-md p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold">Order #{foundOrder.order_number}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Customer: {foundOrder.user?.name} ({foundOrder.user?.email})
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Total: {foundOrder.currency} {foundOrder.total}
                                                </p>
                                            </div>
                                            {eligibilityCheck && (
                                                <Badge variant={eligibilityCheck.eligible ? "default" : "destructive"}>
                                                    {eligibilityCheck.eligible ? "Eligible" : "Not Eligible"}
                                                </Badge>
                                            )}
                                        </div>

                                        {!eligibilityCheck?.eligible && eligibilityCheck?.reason && (
                                            <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
                                                {eligibilityCheck.reason}
                                            </div>
                                        )}

                                        <div>
                                            <Label>Select Items to Refund</Label>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead>Price</TableHead>
                                                        <TableHead>Qty</TableHead>
                                                        <TableHead>Refund Qty</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {foundOrder.items.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>{item.product_name}</TableCell>
                                                            <TableCell>{foundOrder.currency} {item.unit_price}</TableCell>
                                                            <TableCell>{item.quantity}</TableCell>
                                                            <TableCell>
                                                                <Input 
                                                                    type="number" 
                                                                    min="0" 
                                                                    max={item.quantity}
                                                                    className="w-20"
                                                                    value={selectedItems[item.id] || 0}
                                                                    onChange={(e) => handleItemSelection(item.id, parseInt(e.target.value) || 0, item.quantity)}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="reason">Reason for Refund</Label>
                                            <Select onValueChange={setRefundReason} value={refundReason}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="damaged">Damaged Item</SelectItem>
                                                    <SelectItem value="wrong_item">Wrong Item Sent</SelectItem>
                                                    <SelectItem value="expired">Expired Product</SelectItem>
                                                    <SelectItem value="customer_request">Customer Request</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                id="restock" 
                                                checked={restock}
                                                onCheckedChange={(checked) => setRestock(checked as boolean)}
                                            />
                                            <Label htmlFor="restock">Restock items to inventory (if applicable)</Label>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Internal Notes</Label>
                                            <Textarea 
                                                id="notes" 
                                                value={refundNotes} 
                                                onChange={(e) => setRefundNotes(e.target.value)} 
                                                placeholder="Any additional details..."
                                            />
                                        </div>

                                        <div className="flex justify-between items-center bg-muted p-4 rounded-md">
                                            <span className="font-semibold">Total Refund Amount:</span>
                                            <span className="text-xl font-bold">{foundOrder.currency} {refundAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsNewRefundOpen(false)}>Cancel</Button>
                                <Button onClick={submitRefund} disabled={!foundOrder || refundAmount <= 0 || submitting || !refundReason}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Refund Request
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Refunds</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.processed_today}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">£{Number(stats.total_refunded).toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Refund Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4">Loading...</TableCell>
                                </TableRow>
                            ) : refunds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4">No refunds found.</TableCell>
                                </TableRow>
                            ) : (
                                refunds.map((refund) => (
                                    <TableRow key={refund.id}>
                                        <TableCell>#{refund.id}</TableCell>
                                        <TableCell>#{refund.order?.order_number}</TableCell>
                                        <TableCell>{refund.order?.user?.name || 'Guest'}</TableCell>
                                        <TableCell>{refund.order?.currency || '£'} {Number(refund.amount || 0).toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(refund.status)}</TableCell>
                                        <TableCell>{refund.reason}</TableCell>
                                        <TableCell>{new Date(refund.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {(refund.status === 'pending' || refund.status === 'pending_approval') && (
                                                    <Button size="sm" onClick={() => handleApprove(refund)}>
                                                        Approve
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => handleView(refund)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Dialog */}
            <Dialog open={!!viewRefund} onOpenChange={(open) => !open && setViewRefund(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Refund Details</DialogTitle>
                        <DialogDescription>
                            Viewing details for Refund #{viewRefund?.id} (Order #{viewRefund?.order?.order_number})
                        </DialogDescription>
                    </DialogHeader>

                    {viewRefund && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm">Status</h4>
                                    <div className="mt-1">{getStatusBadge(viewRefund.status)}</div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Date</h4>
                                    <p className="text-sm text-muted-foreground">{new Date(viewRefund.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm">Customer</h4>
                                    <p className="text-sm text-muted-foreground">{viewRefund.order?.user?.name || 'Guest'}</p>
                                    <p className="text-sm text-muted-foreground">{viewRefund.order?.user?.email}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Refund Amount</h4>
                                    <p className="text-xl font-bold">
                                        {viewRefund.order?.currency || '£'} {Number(viewRefund.amount).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="border rounded-md p-3">
                                <h4 className="font-semibold text-sm mb-2">Reason for Refund</h4>
                                <p className="text-sm">{viewRefund.reason}</p>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-medium">Items:</span>
                                    <ul className="list-disc list-inside mt-1">
                                        {viewRefund.items?.map((item) => (
                                            <li key={item.id}>
                                                {item.product?.name || `Product #${item.product_id}`} (x{item.quantity})
                                                {Number(item.amount) > 0 && ` - ${viewRefund.order?.currency || '£'}${Number(item.amount).toFixed(2)}`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {viewRefund.notes && (
                                <div className="bg-muted p-3 rounded-md">
                                    <h4 className="font-semibold text-sm mb-1">Admin Notes</h4>
                                    <p className="text-sm">{viewRefund.notes}</p>
                                </div>
                            )}
                            
                            {viewRefund.stripe_refund_id && (
                                <div className="text-xs text-muted-foreground">
                                    Stripe Refund ID: {viewRefund.stripe_refund_id}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewRefund(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approval Dialog */}
            <Dialog open={!!approvalRefund} onOpenChange={(open) => !open && setApprovalRefund(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Approve Refund Request</DialogTitle>
                        <DialogDescription>
                            Review details and approve the refund for Order #{approvalRefund?.order?.order_number}.
                        </DialogDescription>
                    </DialogHeader>

                    {approvalRefund && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-sm">Customer</h4>
                                    <p className="text-sm text-muted-foreground">{approvalRefund.order?.user?.name || 'Guest'}</p>
                                    <p className="text-sm text-muted-foreground">{approvalRefund.order?.user?.email}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">Order Total</h4>
                                    <p className="text-sm text-muted-foreground">{approvalRefund.order?.currency} {approvalRefund.order?.total}</p>
                                </div>
                            </div>

                            <div className="border rounded-md p-3">
                                <h4 className="font-semibold text-sm mb-2">Reason for Refund</h4>
                                <p className="text-sm">{approvalRefund.reason}</p>
                                <div className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-medium">Requested Items:</span>
                                    <ul className="list-disc list-inside mt-1">
                                        {approvalRefund.items?.map((item) => (
                                            <li key={item.id}>
                                                {item.product?.name || `Product #${item.product_id}`} (x{item.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="approved-amount">Approved Amount ({approvalRefund.order?.currency})</Label>
                                <Input 
                                    id="approved-amount" 
                                    type="number" 
                                    step="0.01"
                                    value={approvalAmount}
                                    onChange={(e) => setApprovalAmount(parseFloat(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Requested: {approvalRefund.order?.currency} {approvalRefund.amount}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="approve-restock" 
                                    checked={approvalRestock}
                                    onCheckedChange={(checked) => setApprovalRestock(checked as boolean)}
                                />
                                <Label htmlFor="approve-restock">Restock items to inventory</Label>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="approve-notes">Admin Notes</Label>
                                <Textarea 
                                    id="approve-notes" 
                                    value={approvalNotes} 
                                    onChange={(e) => setApprovalNotes(e.target.value)} 
                                    placeholder="Add any notes for this approval..."
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApprovalRefund(null)}>Cancel</Button>
                        <Button onClick={confirmApprove} disabled={approving}>
                            {approving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
