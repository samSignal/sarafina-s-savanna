import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const customers = [
    { 
        id: 1, 
        name: "John Doe", 
        email: "john@example.com", 
        phone: "+1 (555) 123-4567",
        location: "New York, USA",
        orders: 12,
        spent: 1250.00,
        status: "Active",
        joinDate: "2023-01-15"
    },
    { 
        id: 2, 
        name: "Jane Smith", 
        email: "jane@example.com", 
        phone: "+1 (555) 987-6543",
        location: "London, UK",
        orders: 5,
        spent: 450.50,
        status: "Active",
        joinDate: "2023-03-22"
    },
    { 
        id: 3, 
        name: "Robert Johnson", 
        email: "robert@example.com", 
        phone: "+1 (555) 456-7890",
        location: "Toronto, Canada",
        orders: 0,
        spent: 0.00,
        status: "Inactive",
        joinDate: "2023-11-05"
    },
    { 
        id: 4, 
        name: "Alice Brown", 
        email: "alice@example.com", 
        phone: "+1 (555) 789-0123",
        location: "Sydney, Australia",
        orders: 24,
        spent: 3400.00,
        status: "VIP",
        joinDate: "2022-11-30"
    },
    { 
        id: 5, 
        name: "Charlie Davis", 
        email: "charlie@example.com", 
        phone: "+1 (555) 234-5678",
        location: "Berlin, Germany",
        orders: 2,
        spent: 120.00,
        status: "Active",
        joinDate: "2023-09-10"
    },
];

export default function Customers() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your client base and view their history.</p>
        </div>
        <Button variant="outline">
            Export List
        </Button>
      </div>
      
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search customers..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
            </Button>
        </div>
        <div className="text-sm text-muted-foreground">
            Showing <strong>1-5</strong> of <strong>128</strong> customers
        </div>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">User</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {customers.map((customer) => (
                    <TableRow key={customer.id}>
                        <TableCell>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`/avatars/${customer.id}.png`} alt={customer.name} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {customer.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                            {customer.name}
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {customer.location}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                                <div className="flex items-center">
                                    <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                                    {customer.email}
                                </div>
                                <div className="flex items-center">
                                    <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                                    {customer.phone}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={
                                customer.status === "VIP" ? "bg-purple-100 text-purple-800 border-purple-200" :
                                customer.status === "Active" ? "bg-green-100 text-green-800 border-green-200" :
                                "bg-slate-100 text-slate-800 border-slate-200"
                            }>
                                {customer.status}
                            </Badge>
                        </TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>${customer.spent.toFixed(2)}</TableCell>
                        <TableCell>{customer.joinDate}</TableCell>
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
                                    <DropdownMenuItem onClick={() => navigate(`/admin/customers/${customer.id}`)}>
                                        <User className="mr-2 h-4 w-4" /> View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Mail className="mr-2 h-4 w-4" /> Email Customer
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                        Block Customer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
