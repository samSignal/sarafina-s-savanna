import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Clock, AlertCircle, Plus, Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface LoyaltyStats {
    total_issued: number;
    total_redeemed: number;
    total_expired: number;
    outstanding_balance: number;
}

interface LoyaltyTransaction {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    order?: {
        id: number;
        order_number: string;
    };
    points: number;
    type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';
    description: string;
    created_at: string;
}

interface TransactionResponse {
    data: LoyaltyTransaction[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    points_balance: number;
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Department {
    id: number;
    name: string;
    points_multiplier: string;
    loyalty_reason: string | null;
}

export default function Loyalty() {
    const { token } = useAuth();
    const [page, setPage] = useState(1);
    
    // Adjustment State
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
    const [pointsAmount, setPointsAmount] = useState("");
    const [adjustmentReason, setAdjustmentReason] = useState("");
    const [adjusting, setAdjusting] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    // Department Rules State
    const [editRuleOpen, setEditRuleOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [ruleMultiplier, setRuleMultiplier] = useState("");
    const [ruleReason, setRuleReason] = useState("");
    const [savingRule, setSavingRule] = useState(false);

    const { data: departments, refetch: refetchDepartments } = useQuery<Department[]>({
        queryKey: ["admin-departments"],
        queryFn: async () => {
            const res = await fetch("/api/departments");
            if (!res.ok) throw new Error("Failed to fetch departments");
            return res.json();
        },
    });

    const handleEditRule = (dept: Department) => {
        setSelectedDept(dept);
        setRuleMultiplier(dept.points_multiplier !== null && dept.points_multiplier !== undefined ? String(dept.points_multiplier) : "1.00");
        setRuleReason(dept.loyalty_reason || "");
        setEditRuleOpen(true);
    };

    const handleSaveRule = async () => {
        if (!selectedDept) return;
        setSavingRule(true);
        try {
            const res = await fetch(`/api/departments/${selectedDept.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: selectedDept.name, // Required by validation
                    status: "Active", // Required by validation (assuming active if editing)
                    points_multiplier: ruleMultiplier,
                    loyalty_reason: ruleReason,
                }),
            });

            if (!res.ok) throw new Error("Failed to update rule");
            
            toast.success("Loyalty rule updated");
            setEditRuleOpen(false);
            refetchDepartments();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update loyalty rule");
        } finally {
            setSavingRule(false);
        }
    };

    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<LoyaltyStats>({
        queryKey: ["loyalty-stats"],
        queryFn: async () => {
            const res = await fetch("/api/admin/loyalty/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json();
        },
        enabled: !!token,
    });

    const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<TransactionResponse>({
        queryKey: ["loyalty-transactions", page],
        queryFn: async () => {
            const res = await fetch(`/api/admin/loyalty/transactions?page=${page}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch transactions");
            return res.json();
        },
        enabled: !!token,
    });
    const [maxPercent, setMaxPercent] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [savingSettings, setSavingSettings] = useState(false);
    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/loyalty/settings", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMaxPercent(String(data.max_redemption_percentage));
                setMinAmount(String(data.min_order_amount_gbp));
            }
        } catch {}
    };
    if (token && !maxPercent && !minAmount) {
        fetchSettings();
    }
    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await fetch("/api/admin/loyalty/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    max_redemption_percentage: parseFloat(maxPercent || "0"),
                    min_order_amount_gbp: parseFloat(minAmount || "0"),
                }),
            });
            if (res.ok) {
                toast.success("Redemption settings updated");
            } else {
                toast.error("Failed to update redemption settings");
            }
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchCustomers = async () => {
        if (customers.length > 0) return;
        setLoadingCustomers(true);
        try {
            const res = await fetch("/api/admin/customers", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCustomers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handleAdjustPoints = async () => {
        if (!selectedUser || !pointsAmount || !adjustmentReason) {
            toast.error("Please fill in all fields");
            return;
        }

        setAdjusting(true);
        try {
            const response = await fetch(`/api/admin/loyalty/adjust/${selectedUser.id}`, {
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
                setAdjustOpen(false);
                setPointsAmount("");
                setAdjustmentReason("");
                setSelectedUser(null);
                refetchStats();
                refetchTransactions();
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'earned': return "bg-green-100 text-green-800 hover:bg-green-200";
            case 'bonus': return "bg-blue-100 text-blue-800 hover:bg-blue-200";
            case 'redeemed': return "bg-purple-100 text-purple-800 hover:bg-purple-200";
            case 'expired': return "bg-red-100 text-red-800 hover:bg-red-200";
            case 'adjustment': return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    if (statsLoading || transactionsLoading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Loyalty Program</h1>
                    <p className="text-muted-foreground">Monitor loyalty points, transactions, and program health.</p>
                </div>
                <Button onClick={() => {
                    setAdjustOpen(true);
                    fetchCustomers();
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Adjust Points
                </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rules">Earning Rules</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Liability</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.outstanding_balance.toLocaleString()} pts</div>
                        <p className="text-xs text-muted-foreground">Total points currently held by users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_issued.toLocaleString()} pts</div>
                        <p className="text-xs text-muted-foreground">Lifetime points awarded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Redeemed</CardTitle>
                        <TrendingDown className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_redeemed.toLocaleString()} pts</div>
                        <p className="text-xs text-muted-foreground">Lifetime points used for discounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expired</CardTitle>
                        <Clock className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_expired.toLocaleString()} pts</div>
                        <p className="text-xs text-muted-foreground">Points removed due to inactivity</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Recent loyalty point activities across all users.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Order</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionsData?.data.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{format(new Date(transaction.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{transaction.user.name}</span>
                                            <span className="text-xs text-muted-foreground">{transaction.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getTypeColor(transaction.type)} variant="outline">
                                            {transaction.type.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                                    </TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell>
                                        {transaction.order ? (
                                            <span className="font-mono text-xs">#{transaction.order.order_number}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!transactionsData?.data.length && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    
                    {transactionsData && transactionsData.last_page > 1 && (
                        <div className="flex justify-end gap-2 mt-4">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setPage(p => Math.min(transactionsData.last_page, p + 1))}
                                disabled={page === transactionsData.last_page}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="rules" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Redemption Rules</CardTitle>
                        <CardDescription>Control when and how many points can be used.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="max_percent">Max percentage paid using points</Label>
                                <Input
                                    id="max_percent"
                                    type="number"
                                    step="1"
                                    min="0"
                                    max="100"
                                    value={maxPercent}
                                    onChange={(e) => setMaxPercent(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="min_amount">Minimum order amount (GBP) to allow redemption</Label>
                                <Input
                                    id="min_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={saveSettings} disabled={savingSettings}>
                                {savingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Points Multiplier by Department</CardTitle>
                        <CardDescription>
                            Configure how many points customers earn per £1 spent in each department.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Points per £1</TableHead>
                                    <TableHead>Multiplier</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments?.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="font-medium">{dept.name}</TableCell>
                                        <TableCell>{(parseFloat(dept.points_multiplier !== null && dept.points_multiplier !== undefined ? String(dept.points_multiplier) : "1.00") * 1).toFixed(0)} points</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{dept.points_multiplier !== null && dept.points_multiplier !== undefined ? dept.points_multiplier : "1.00"}x</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{dept.loyalty_reason || "-"}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleEditRule(dept)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
            </Tabs>

            <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Adjust Loyalty Points</DialogTitle>
                        <DialogDescription>
                            Manually add or deduct points for a customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Customer</Label>
                            <Popover open={userOpen} onOpenChange={setUserOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={userOpen}
                                        className="w-full justify-between"
                                    >
                                        {selectedUser ? selectedUser.name : "Select customer..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search customer..." />
                                        <CommandList>
                                            <CommandEmpty>No customer found.</CommandEmpty>
                                            <CommandGroup>
                                                {customers.map((customer) => (
                                                    <CommandItem
                                                        key={customer.id}
                                                        value={customer.name}
                                                        onSelect={() => {
                                                            setSelectedUser(customer);
                                                            setUserOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedUser?.id === customer.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{customer.name}</span>
                                                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {selectedUser && (
                                <p className="text-sm text-muted-foreground">
                                    Current Balance: <span className="font-medium text-foreground">{selectedUser.points_balance} pts</span>
                                </p>
                            )}
                        </div>
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
                        <Button variant="outline" onClick={() => setAdjustOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAdjustPoints} disabled={adjusting || !selectedUser}>
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

            <Dialog open={editRuleOpen} onOpenChange={setEditRuleOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Loyalty Rule</DialogTitle>
                        <DialogDescription>
                            Configure points earning for {selectedDept?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="multiplier">Points Multiplier</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="multiplier"
                                    type="number"
                                    step="0.1"
                                    value={ruleMultiplier}
                                    onChange={(e) => setRuleMultiplier(e.target.value)}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">x (times base rate)</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                E.g. 10x means 10 points per £1 spent.
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rule-reason">Reason</Label>
                            <Textarea
                                id="rule-reason"
                                placeholder="Explain why this department has this multiplier..."
                                value={ruleReason}
                                onChange={(e) => setRuleReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditRuleOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveRule} disabled={savingRule}>
                            {savingRule && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
