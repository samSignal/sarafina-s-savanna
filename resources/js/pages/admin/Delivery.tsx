import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Truck, MapPin, Package, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Mock Data
const initialDeliveries = [
    { id: "DEL-1001", orderId: "ORD-7829", customer: "Sarah Johnson", address: "123 Main St, London", driver: "Mike Ross", status: "Out for Delivery", eta: "14:30" },
    { id: "DEL-1002", orderId: "ORD-7830", customer: "David Smith", address: "45 Park Ave, London", driver: "John Doe", status: "Pending", eta: "16:00" },
    { id: "DEL-1003", orderId: "ORD-7831", customer: "Emily Brown", address: "89 Oxford Rd, London", driver: "Unassigned", status: "Ready for Pickup", eta: "--:--" },
    { id: "DEL-1004", orderId: "ORD-7828", customer: "Chris Wilson", address: "12 King St, London", driver: "Mike Ross", status: "Delivered", eta: "11:45" },
];

const initialMethods = [
    { id: 1, name: "Standard Delivery", zone: "London (Zone 1-3)", cost: 5.99, time: "2-3 Days", status: "Active" },
    { id: 2, name: "Express Delivery", zone: "London (Zone 1-3)", cost: 9.99, time: "Same Day", status: "Active" },
    { id: 3, name: "National Shipping", zone: "UK Wide", cost: 12.99, time: "3-5 Days", status: "Active" },
    { id: 4, name: "Store Pickup", zone: "All Zones", cost: 0.00, time: "Next Hour", status: "Active" },
];

export default function Delivery() {
    const [deliveries, setDeliveries] = useState(initialDeliveries);
    const [methods, setMethods] = useState(initialMethods);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
    
    // Form state for new method
    const [newMethod, setNewMethod] = useState({ name: "", zone: "", cost: "", time: "", status: "Active" });

    const handleAddMethod = () => {
        if (!newMethod.name || !newMethod.cost) {
            toast.error("Please fill in required fields");
            return;
        }

        const method = {
            id: methods.length + 1,
            name: newMethod.name,
            zone: newMethod.zone,
            cost: parseFloat(newMethod.cost),
            time: newMethod.time,
            status: newMethod.status
        };

        setMethods([...methods, method]);
        setIsAddMethodOpen(false);
        setNewMethod({ name: "", zone: "", cost: "", time: "", status: "Active" });
        toast.success("Delivery method added");
    };

    const handleDeleteMethod = (id: number) => {
        setMethods(methods.filter(m => m.id !== id));
        toast.success("Delivery method removed");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
                    <p className="text-muted-foreground">Track active deliveries and configure shipping methods.</p>
                </div>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Active Deliveries</TabsTrigger>
                    <TabsTrigger value="settings">Shipping Methods</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
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
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{deliveries.filter(d => d.status === "Delivered").length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                                <Truck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">8</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="border rounded-md bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Delivery ID</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Driver</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>ETA</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deliveries.map((delivery) => (
                                    <TableRow key={delivery.id}>
                                        <TableCell className="font-medium">{delivery.id}</TableCell>
                                        <TableCell>{delivery.orderId}</TableCell>
                                        <TableCell>{delivery.customer}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={delivery.address}>{delivery.address}</TableCell>
                                        <TableCell>{delivery.driver}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                delivery.status === "Delivered" ? "default" : 
                                                delivery.status === "Out for Delivery" ? "secondary" : 
                                                "outline"
                                            } className={
                                                delivery.status === "Delivered" ? "bg-green-100 text-green-800 border-green-200" : 
                                                delivery.status === "Out for Delivery" ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                                "bg-yellow-100 text-yellow-800 border-yellow-200"
                                            }>
                                                {delivery.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{delivery.eta}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Shipping Methods</h3>
                        <Dialog open={isAddMethodOpen} onOpenChange={setIsAddMethodOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Method
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Shipping Method</DialogTitle>
                                    <DialogDescription>Configure a new delivery option for customers.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Method Name</Label>
                                        <Input 
                                            id="name" 
                                            placeholder="e.g. Next Day Delivery"
                                            value={newMethod.name}
                                            onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="zone">Zone/Region</Label>
                                        <Input 
                                            id="zone" 
                                            placeholder="e.g. London Only"
                                            value={newMethod.zone}
                                            onChange={(e) => setNewMethod({...newMethod, zone: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="cost">Cost ($)</Label>
                                            <Input 
                                                id="cost" 
                                                type="number"
                                                placeholder="0.00"
                                                value={newMethod.cost}
                                                onChange={(e) => setNewMethod({...newMethod, cost: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="time">Est. Time</Label>
                                            <Input 
                                                id="time" 
                                                placeholder="e.g. 24 Hours"
                                                value={newMethod.time}
                                                onChange={(e) => setNewMethod({...newMethod, time: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsAddMethodOpen(false)}>Cancel</Button>
                                    <Button onClick={handleAddMethod}>Save Method</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="border rounded-md bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Method Name</TableHead>
                                    <TableHead>Zone</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Est. Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {methods.map((method) => (
                                    <TableRow key={method.id}>
                                        <TableCell className="font-medium">{method.name}</TableCell>
                                        <TableCell>{method.zone}</TableCell>
                                        <TableCell>${method.cost.toFixed(2)}</TableCell>
                                        <TableCell>{method.time}</TableCell>
                                        <TableCell>
                                            <Badge variant={method.status === "Active" ? "default" : "secondary"}>
                                                {method.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteMethod(method.id)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}