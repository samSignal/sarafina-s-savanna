import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye } from "lucide-react";

const orders = [
    { id: "1001", customer: "John Doe", email: "john@example.com", total: 50.00, date: "2023-10-01", status: "Completed" },
    { id: "1002", customer: "Jane Smith", email: "jane@example.com", total: 120.50, date: "2023-10-02", status: "Processing" },
    { id: "1003", customer: "Bob Johnson", email: "bob@example.com", total: 25.00, date: "2023-10-02", status: "Shipped" },
    { id: "1004", customer: "Alice Brown", email: "alice@example.com", total: 75.25, date: "2023-10-03", status: "Cancelled" },
    { id: "1005", customer: "Charlie Davis", email: "charlie@example.com", total: 210.00, date: "2023-10-03", status: "Processing" },
];

export default function Orders() {
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
                <Input placeholder="Search orders..." className="pl-8" />
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
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{order.customer}</span>
                                <span className="text-xs text-muted-foreground">{order.email}</span>
                            </div>
                        </TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={
                                order.status === "Completed" ? "bg-green-100 text-green-800 border-green-200" :
                                order.status === "Processing" ? "bg-blue-100 text-blue-800 border-blue-200" :
                                order.status === "Shipped" ? "bg-purple-100 text-purple-800 border-purple-200" :
                                "bg-red-100 text-red-800 border-red-200"
                            }>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                             <Button variant="ghost" size="sm">
                                <Eye className="mr-2 h-4 w-4" /> View
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
