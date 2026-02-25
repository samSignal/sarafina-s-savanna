import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, MoreHorizontal, Mail, Phone, MapPin, User, Loader2, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    orders: number;
    spent: number;
    status: string;
    joinDate: string;
    points_balance?: number;
}

export default function Customers() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Points Adjustment State
  const [adjustPointsOpen, setAdjustPointsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pointsAmount, setPointsAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/admin/customers', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            } else {
                console.error('Failed to fetch customers:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    if (token) {
        fetchCustomers();
    }
  }, [token]);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdjustPoints = async () => {
    if (!selectedCustomer || !pointsAmount || !adjustmentReason) {
        toast.error("Please fill in all fields");
        return;
    }

    setAdjusting(true);
    try {
        const response = await fetch(`/api/admin/loyalty/adjust/${selectedCustomer.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                points: parseInt(pointsAmount),
                reason: adjustmentReason
            })
        });

        const data = await response.json();

        if (response.ok) {
            toast.success(data.message);
            setCustomers(customers.map(c => 
                c.id === selectedCustomer.id ? { ...c, points_balance: data.balance } : c
            ));
            setAdjustPointsOpen(false);
            setPointsAmount("");
            setAdjustmentReason("");
            setSelectedCustomer(null);
        } else {
            toast.error(data.message || "Failed to adjust points");
        }
    } catch (error) {
        console.error(error);
        toast.error("An error occurred while adjusting points");
    } finally {
        setAdjusting(false);
    }
  };

  const openAdjustPoints = (customer: Customer) => {
      setSelectedCustomer(customer);
      setPointsAmount("");
      setAdjustmentReason("");
      setAdjustPointsOpen(true);
  };

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
                <Input 
                    placeholder="Search customers..." 
                    className="pl-8" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
            </Button>
        </div>
        <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredCustomers.length}</strong> of <strong>{customers.length}</strong> customers
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
                    <TableHead>Points</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                            <div className="flex justify-center items-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Loading customers...
                            </div>
                        </TableCell>
                    </TableRow>
                ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                            No customers found.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredCustomers.map((customer) => (
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
                        <TableCell>
                            <div className="flex items-center gap-1 font-medium">
                                <Award className="h-4 w-4 text-amber-500" />
                                {customer.points_balance ?? 0}
                            </div>
                        </TableCell>
                        <TableCell>{customer.orders}</TableCell>
                        <TableCell>£{customer.spent.toFixed(2)}</TableCell>
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
                                    <DropdownMenuItem onClick={() => openAdjustPoints(customer)}>
                                        <Award className="mr-2 h-4 w-4" /> Adjust Points
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
                )))}
            </TableBody>
        </Table>
      </div>

      <Dialog open={adjustPointsOpen} onOpenChange={setAdjustPointsOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Adjust Loyalty Points</DialogTitle>
                  <DialogDescription>
                      Manually add or remove points for {selectedCustomer?.name}.
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                      <Label htmlFor="points">Points Amount</Label>
                      <Input
                          id="points"
                          type="number"
                          placeholder="e.g. 100 or -50"
                          value={pointsAmount}
                          onChange={(e) => setPointsAmount(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                          Use negative values to deduct points.
                      </p>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Input
                          id="reason"
                          placeholder="e.g. Manual correction, Bonus"
                          value={adjustmentReason}
                          onChange={(e) => setAdjustmentReason(e.target.value)}
                      />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setAdjustPointsOpen(false)}>
                      Cancel
                  </Button>
                  <Button onClick={handleAdjustPoints} disabled={adjusting}>
                      {adjusting ? (
                          <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adjusting...
                          </>
                      ) : (
                          "Confirm Adjustment"
                      )}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
