import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, MoreHorizontal, Gift, Plus, Copy, Mail, Ban, FileDown, History, Loader2, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface GiftCard {
    id: number;
    code: string;
    initial_value: string;
    balance: string;
    status: 'active' | 'used' | 'expired' | 'deactivated';
    expiry_date: string;
    recipient_email: string | null;
    purchaser: { name: string; email: string } | null;
    created_at: string;
}

interface Transaction {
    id: number;
    amount: string;
    type: 'credit' | 'debit';
    description: string;
    created_at: string;
    order?: { order_number: string };
}

interface AuditLog {
    id: number;
    action: string;
    details: any;
    created_at: string;
    user: { name: string; email: string };
    ip_address: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    status: string;
}

export default function GiftCards() {
    const { token } = useAuth();
    const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    
    // Create Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCard, setNewCard] = useState({ value: "", recipient: "", note: "" });
    const [creating, setCreating] = useState(false);

    // Transactions Dialog State
    const [transactionsOpen, setTransactionsOpen] = useState(false);
    const [selectedCardTransactions, setSelectedCardTransactions] = useState<Transaction[]>([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [selectedCardCode, setSelectedCardCode] = useState("");

    // Audit Logs Dialog State
    const [auditLogsOpen, setAuditLogsOpen] = useState(false);
    const [selectedCardAuditLogs, setSelectedCardAuditLogs] = useState<AuditLog[]>([]);
    const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);

    // Deactivate Dialog State
    const [deactivateOpen, setDeactivateOpen] = useState(false);
    const [deactivateReason, setDeactivateReason] = useState("");
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

    // Products Tab State
    const [activeTab, setActiveTab] = useState("issued");
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "" });
    const [creatingProduct, setCreatingProduct] = useState(false);

    const fetchGiftCards = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append('search', searchQuery);
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);

            const response = await fetch(`/api/admin/gift-cards?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGiftCards(data.data); // Assuming paginated response structure
            } else {
                toast.error("Failed to fetch gift cards");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while fetching gift cards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            if (activeTab === 'products') {
                fetchProducts();
            } else {
                fetchGiftCards();
            }
        }
    }, [token, statusFilter, activeTab]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await fetch(`/api/admin/gift-cards/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            } else {
                toast.error("Failed to fetch products");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleCreateProduct = async () => {
        if (!newProduct.name || !newProduct.price) {
            toast.error("Please fill in all required fields");
            return;
        }

        setCreatingProduct(true);
        try {
            const response = await fetch('/api/admin/gift-cards/products', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newProduct)
            });

            if (response.ok) {
                toast.success("Product created successfully");
                setIsCreateProductOpen(false);
                setNewProduct({ name: "", price: "", description: "" });
                fetchProducts();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to create product");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setCreatingProduct(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        
        try {
            const response = await fetch(`/api/admin/gift-cards/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                toast.success("Product deleted successfully");
                fetchProducts();
            } else {
                toast.error("Failed to delete product");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    // Search debounce could be added here, for now just search on enter or button click if needed, 
    // but typically we want it to filter as we type or on blur. 
    // Let's add a simple effect for search query with a timeout to debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (token) fetchGiftCards();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleCreateCard = async () => {
        if (!newCard.value) {
            toast.error("Please enter a value");
            return;
        }

        setCreating(true);
        try {
            const response = await fetch('/api/admin/gift-cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(newCard.value),
                    recipient_email: newCard.recipient,
                    notes: newCard.note
                })
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(`Gift card ${data.gift_card.code} created successfully`);
                setIsCreateOpen(false);
                setNewCard({ value: "", recipient: "", note: "" });
                fetchGiftCards();
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to create gift card");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setCreating(false);
        }
    };

    const openDeactivateDialog = (id: number) => {
        setSelectedCardId(id);
        setDeactivateReason("");
        setDeactivateOpen(true);
    };

    const confirmDeactivate = async () => {
        if (!selectedCardId) return;
        if (!deactivateReason.trim()) {
            toast.error("Please provide a reason for deactivation");
            return;
        }

        try {
            const response = await fetch(`/api/admin/gift-cards/${selectedCardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    status: 'deactivated',
                    reason: deactivateReason
                })
            });

            if (response.ok) {
                toast.success("Gift card deactivated");
                setDeactivateOpen(false);
                fetchGiftCards();
            } else {
                toast.error("Failed to deactivate gift card");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        }
    };

    const handleViewTransactions = async (card: GiftCard) => {
        setSelectedCardCode(card.code);
        setTransactionsOpen(true);
        setLoadingTransactions(true);
        try {
            const response = await fetch(`/api/admin/gift-cards/${card.id}/transactions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedCardTransactions(data);
            } else {
                toast.error("Failed to fetch transactions");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoadingTransactions(false);
        }
    };

    const handleViewAuditLogs = async (card: GiftCard) => {
        setSelectedCardCode(card.code);
        setAuditLogsOpen(true);
        setLoadingAuditLogs(true);
        try {
            const response = await fetch(`/api/admin/gift-cards/${card.id}/audit-logs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedCardAuditLogs(data);
            } else {
                toast.error("Failed to fetch audit logs");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoadingAuditLogs(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch(`/api/admin/gift-cards/export?status=${statusFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gift-cards-${format(new Date(), 'yyyy-MM-dd')}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                toast.error("Failed to export");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred during export");
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'used': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'expired': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'deactivated': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
                    <p className="text-muted-foreground">Manage gift cards, track balances, and view transaction history.</p>
                </div>
            </div>

            <Tabs defaultValue="issued" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="issued">Issued Cards</TabsTrigger>
                    <TabsTrigger value="products">Products (Denominations)</TabsTrigger>
                </TabsList>

                <TabsContent value="issued" className="space-y-6">
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleExport}>
                            <FileDown className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90">
                                    <Plus className="mr-2 h-4 w-4" /> Issue Gift Card
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Issue New Gift Card</DialogTitle>
                                    <DialogDescription>
                                        Create a new digital gift card code manually.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="value">Value (£)</Label>
                                        <Input 
                                            id="value" 
                                            type="number" 
                                            placeholder="50.00" 
                                            value={newCard.value}
                                            onChange={(e) => setNewCard({...newCard, value: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="recipient">Recipient Email (Optional)</Label>
                                        <Input 
                                            id="recipient" 
                                            type="email" 
                                            placeholder="customer@example.com" 
                                            value={newCard.recipient}
                                            onChange={(e) => setNewCard({...newCard, recipient: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="note">Internal Note</Label>
                                        <Input 
                                            id="note" 
                                            placeholder="Reason for issuance..." 
                                            value={newCard.note}
                                            onChange={(e) => setNewCard({...newCard, note: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateCard} disabled={creating}>
                                        {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Issue Card
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search code or email..." 
                        className="pl-8" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                            <SelectItem value="deactivated">Deactivated</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Balance / Initial</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Created By</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : giftCards.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No gift cards found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            giftCards.map((card) => (
                                <TableRow key={card.id}>
                                    <TableCell className="font-mono font-medium">
                                        <div className="flex items-center gap-2">
                                            <Gift className="h-4 w-4 text-primary" />
                                            {card.code}
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyCode(card.code)}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-green-600">£{card.balance}</span>
                                            <span className="text-xs text-muted-foreground">of £{card.initial_value}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(card.status)}>
                                            {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(card.expiry_date), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{card.recipient_email || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-muted-foreground">
                                            {card.purchaser ? card.purchaser.name : 'System'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleCopyCode(card.code)}>
                                                    <Copy className="mr-2 h-4 w-4" /> Copy Code
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleViewTransactions(card)}>
                                                    <History className="mr-2 h-4 w-4" /> View History
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleViewAuditLogs(card)}>
                                                    <Activity className="mr-2 h-4 w-4" /> Audit Logs
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {card.status === 'active' && (
                                                    <DropdownMenuItem onClick={() => openDeactivateDialog(card.id)} className="text-red-600">
                                                        <Ban className="mr-2 h-4 w-4" /> Deactivate
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium">Gift Card Denominations</h3>
                        <p className="text-sm text-muted-foreground">
                            Manage the gift card products available for purchase on the frontend.
                        </p>
                    </div>
                    <Dialog open={isCreateProductOpen} onOpenChange={setIsCreateProductOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Add Denomination
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Denomination</DialogTitle>
                                <DialogDescription>
                                    Create a new gift card product variant.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="prod-name">Name</Label>
                                    <Input 
                                        id="prod-name" 
                                        placeholder="Gift Card £50" 
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="prod-price">Price / Value (£)</Label>
                                    <Input 
                                        id="prod-price" 
                                        type="number" 
                                        placeholder="50.00" 
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="prod-desc">Description</Label>
                                    <Input 
                                        id="prod-desc" 
                                        placeholder="Give the gift of choice..." 
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateProductOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateProduct} disabled={creatingProduct}>
                                    {creatingProduct && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Product
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Value/Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingProducts ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No denominations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>£{product.price}</TableCell>
                                        <TableCell className="max-w-md truncate">{product.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                {product.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                <Ban className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
            </Tabs>

            {/* Deactivate Dialog */}
            <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Deactivate Gift Card</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to deactivate this gift card? This action cannot be undone easily.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason for Deactivation</Label>
                            <Input 
                                id="reason" 
                                placeholder="e.g. Lost/Stolen, Fraudulent activity..." 
                                value={deactivateReason}
                                onChange={(e) => setDeactivateReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDeactivate}>
                            Deactivate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transactions Dialog */}
            <Dialog open={transactionsOpen} onOpenChange={setTransactionsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Transaction History</DialogTitle>
                        <DialogDescription>
                            History for gift card {selectedCardCode}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        {loadingTransactions ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : selectedCardTransactions.length === 0 ? (
                            <p className="text-center text-muted-foreground">No transactions found.</p>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {selectedCardTransactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                                                {tx.order && ` • Order #${tx.order.order_number}`}
                                            </p>
                                        </div>
                                        <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}£{tx.amount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Audit Logs Dialog */}
            <Dialog open={auditLogsOpen} onOpenChange={setAuditLogsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Audit Logs</DialogTitle>
                        <DialogDescription>
                            Activity log for gift card {selectedCardCode}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        {loadingAuditLogs ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : selectedCardAuditLogs.length === 0 ? (
                            <p className="text-center text-muted-foreground">No audit logs found.</p>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {selectedCardAuditLogs.map((log) => (
                                    <div key={log.id} className="border-b pb-4 last:border-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="font-bold text-sm uppercase tracking-wide bg-muted px-2 py-0.5 rounded text-xs">
                                                    {log.action}
                                                </span>
                                                <span className="ml-2 text-sm text-muted-foreground">
                                                    by {log.user?.name || 'Unknown'}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                                            </span>
                                        </div>
                                        <div className="bg-muted/50 p-2 rounded text-xs font-mono overflow-x-auto">
                                            {JSON.stringify(log.details, null, 2)}
                                        </div>
                                        <div className="mt-1 text-[10px] text-muted-foreground text-right">
                                            IP: {log.ip_address}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
