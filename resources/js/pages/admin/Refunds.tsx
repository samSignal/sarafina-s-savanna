import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, MoreHorizontal, CheckCircle, XCircle, Eye, RefreshCw, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

// Mock data for refund requests
const initialRefunds = [
    { id: "REF-001", orderId: "ORD-7829", customer: "Sarah Johnson", amount: 45.00, reason: "Product damaged", status: "Pending", date: "2024-03-15" },
    { id: "REF-002", orderId: "ORD-7810", customer: "Michael Chen", amount: 12.50, reason: "Wrong item received", status: "Approved", date: "2024-03-14" },
    { id: "REF-003", orderId: "ORD-7755", customer: "Emma Davis", amount: 89.99, reason: "Changed mind", status: "Rejected", date: "2024-03-12" },
    { id: "REF-004", orderId: "ORD-7901", customer: "James Wilson", amount: 24.00, reason: "Expired product", status: "Pending", date: "2024-03-16" },
];

const initialPolicy = `RETURN & REFUND POLICY

1. RETURNS
We accept returns within 30 days of purchase. Items must be unused and in original packaging. Perishable goods such as fresh meat, produce, and frozen items cannot be returned unless damaged or spoiled upon delivery.

2. REFUNDS
Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment within 5-10 business days.

3. EXCHANGES
We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at support@sarafina.com.

4. SHIPPING RETURNS
To return your product, you should mail your product to: 123 African Market Street, London, UK. You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.`;

export default function Refunds() {
    const [refunds, setRefunds] = useState(initialRefunds);
    const [policy, setPolicy] = useState(initialPolicy);
    const [searchQuery, setSearchQuery] = useState("");

    const handleStatusChange = (id: string, newStatus: string) => {
        setRefunds(refunds.map(r => r.id === id ? { ...r, status: newStatus } : r));
        toast.success(`Refund request ${newStatus.toLowerCase()} successfully`);
    };

    const handleSavePolicy = () => {
        // Here you would typically save to backend
        toast.success("Refund policy updated successfully");
    };

    const filteredRefunds = refunds.filter(refund => 
        refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        refund.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        refund.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Refunds & Policy</h1>
                    <p className="text-muted-foreground">Manage refund requests and update your return policy.</p>
                </div>
            </div>

            <Tabs defaultValue="requests" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="requests">Refund Requests</TabsTrigger>
                    <TabsTrigger value="policy">Policy Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="requests" className="space-y-4">
                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{refunds.filter(r => r.status === "Pending").length}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Processed Today</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$1,245.00</div>
                                <p className="text-xs text-muted-foreground">This month</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search refunds..." 
                                    className="pl-8" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
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
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRefunds.map((refund) => (
                                    <TableRow key={refund.id}>
                                        <TableCell className="font-medium">{refund.id}</TableCell>
                                        <TableCell>{refund.orderId}</TableCell>
                                        <TableCell>{refund.customer}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={refund.reason}>{refund.reason}</TableCell>
                                        <TableCell>${refund.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                refund.status === "Approved" ? "default" : 
                                                refund.status === "Pending" ? "secondary" : 
                                                "destructive"
                                            } className={
                                                refund.status === "Approved" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : 
                                                refund.status === "Pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200" : 
                                                "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                                            }>
                                                {refund.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{refund.date}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(refund.id, "Approved")}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(refund.id, "Rejected")}>
                                                        <XCircle className="mr-2 h-4 w-4 text-red-600" /> Reject
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
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

                <TabsContent value="policy">
                    <Card>
                        <CardHeader>
                            <CardTitle>Refund Policy Content</CardTitle>
                            <CardDescription>
                                Update the refund policy text that appears on your store's website.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid w-full gap-2">
                                <Label htmlFor="policy">Policy Text</Label>
                                <Textarea 
                                    id="policy" 
                                    className="min-h-[400px] font-mono text-sm" 
                                    value={policy}
                                    onChange={(e) => setPolicy(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSavePolicy}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}