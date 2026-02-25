import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Clock, Save, Loader2, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface DeliveryOrder {
    id: number;
    order_number: string;
    customer: string;
    contact_phone: string | null;
    address: string;
    status: string;
    eta: string | null;
    created_at: string;
}

export default function Delivery() {
    const { token } = useAuth();
    const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
    const [deliveryCost, setDeliveryCost] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    
    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewDelivery, setViewDelivery] = useState<DeliveryOrder | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Status Update State
    const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
    const [newStatus, setNewStatus] = useState("");
    const [newEta, setNewEta] = useState("");
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
             fetchData();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [token, search, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search.trim()) params.set("q", search.trim());
            if (statusFilter !== "all") params.set("status", statusFilter);

            const [settingsRes, ordersRes] = await Promise.all([
                fetch('/api/admin/delivery/settings', { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/admin/delivery/orders?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (settingsRes.ok) {
                const settings = await settingsRes.json();
                setDeliveryCost(settings.cost);
            }

            if (ordersRes.ok) {
                const orders = await ordersRes.json();
                setDeliveries(orders);
            }
        } catch (error) {
            toast.error("Failed to load delivery data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!deliveryCost) return;
        setSavingSettings(true);
        try {
            const res = await fetch('/api/admin/delivery/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ cost: deliveryCost })
            });

            if (res.ok) {
                toast.success("Delivery settings updated");
            } else {
                toast.error("Failed to update settings");
            }
        } catch {
            toast.error("Error saving settings");
        } finally {
            setSavingSettings(false);
        }
    };

    const openUpdateDialog = (order: DeliveryOrder) => {
        setSelectedOrder(order);
        setNewStatus(order.status || "Pending");
        // ETA format might need adjustment for input type="datetime-local"
        // expected: YYYY-MM-DDThh:mm
        const formattedEta = order.eta ? order.eta.replace(' ', 'T') : "";
        setNewEta(formattedEta);
        setIsUpdateOpen(true);
    };

    const openViewDialog = (delivery: DeliveryOrder) => {
        setViewDelivery(delivery);
        setIsViewOpen(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/delivery/orders/${selectedOrder.id}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    eta: newEta ? newEta.replace('T', ' ') : null // Convert back to Y-m-d H:i
                })
            });

            if (res.ok) {
                toast.success("Delivery status updated");
                setIsUpdateOpen(false);
                fetchData(); // Refresh list
            } else {
                toast.error("Failed to update status");
            }
        } catch {
            toast.error("Error updating status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
                    <p className="text-muted-foreground">Track active deliveries and configure shipping costs.</p>
                </div>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Deliveries</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order #, customer, or address..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Processing">Processing</SelectItem>
                                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
                                <Truck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{deliveries.filter(d => d.status === "Out for Delivery").length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{deliveries.filter(d => d.status === "Pending").length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Queue</CardTitle>
                            <CardDescription>Manage status and ETA for ongoing deliveries.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>ETA</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deliveries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No delivery orders found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        deliveries.map((delivery) => (
                                            <TableRow key={delivery.id}>
                                                <TableCell className="font-medium">{delivery.order_number}</TableCell>
                                                <TableCell>
                                                    <div>{delivery.customer}</div>
                                                    <div className="text-xs text-muted-foreground">{delivery.contact_phone}</div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={delivery.address}>
                                                    {delivery.address}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        delivery.status === 'Delivered' ? 'default' : 
                                                        delivery.status === 'Out for Delivery' ? 'secondary' : 
                                                        'outline'
                                                    }>
                                                        {delivery.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{delivery.eta || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(delivery)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => openUpdateDialog(delivery)}>
                                                        Update Status
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Configuration</CardTitle>
                            <CardDescription>Set the fixed delivery cost for all clients.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2 max-w-sm">
                                <Label htmlFor="cost">Global Delivery Cost (GBP)</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">£</span>
                                    <Input 
                                        id="cost" 
                                        type="number" 
                                        step="0.01" 
                                        min="0"
                                        value={deliveryCost}
                                        onChange={(e) => setDeliveryCost(e.target.value)}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    This cost will be converted to the client's currency at checkout.
                                </p>
                            </div>
                            <Button onClick={handleSaveSettings} disabled={savingSettings}>
                                {savingSettings ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Delivery Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Processing">Processing</SelectItem>
                                    <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Estimated Time of Arrival (ETA)</Label>
                            <Input 
                                type="datetime-local" 
                                value={newEta}
                                onChange={(e) => setNewEta(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStatus} disabled={updating}>
                            {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delivery Details</DialogTitle>
                    </DialogHeader>
                    {viewDelivery && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-1">Order Information</h4>
                                    <p className="text-sm text-muted-foreground">Order #: {viewDelivery.order_number}</p>
                                    <p className="text-sm text-muted-foreground">Status: {viewDelivery.status}</p>
                                    {viewDelivery.eta && <p className="text-sm text-muted-foreground">ETA: {viewDelivery.eta}</p>}
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Customer</h4>
                                    <p className="text-sm text-muted-foreground">{viewDelivery.customer}</p>
                                    <p className="text-sm text-muted-foreground">{viewDelivery.contact_phone}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Delivery Address</h4>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    {viewDelivery.address}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
