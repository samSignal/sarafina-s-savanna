import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Tag, Percent, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Product {
    id: number;
    name: string;
    price: number;
    image_url?: string;
}

interface Promotion {
    id: number;
    name: string;
    description: string;
    type: 'product' | 'holiday' | 'flash';
    discount_percentage: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    products?: Product[];
    order_items_count?: number;
    order_items_sum_line_total?: number;
}

export default function Promotions() {
    const { token } = useAuth();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Form state
    const [newPromo, setNewPromo] = useState({ 
        name: "", 
        type: "product", 
        discount_percentage: "", 
        description: "", 
        start_date: "", 
        end_date: "",
        product_ids: [] as number[]
    });

    const fetchPromotions = async () => {
        try {
            const response = await fetch('/api/admin/promotions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPromotions(data);
            }
        } catch (error) {
            console.error('Failed to fetch promotions', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products', {
                 headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                 const data = await res.json();
                 setProducts(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchPromotions();
            fetchProducts();
        }
    }, [token]);

    const handleCreatePromo = async () => {
        if (!newPromo.name || !newPromo.discount_percentage || newPromo.product_ids.length === 0) {
            toast.error("Please fill in name, discount, and select at least one product");
            return;
        }

        try {
            const response = await fetch('/api/admin/promotions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newPromo)
            });

            if (response.ok) {
                toast.success("Promotion created successfully");
                setIsCreateOpen(false);
                setNewPromo({ name: "", type: "product", discount_percentage: "", description: "", start_date: "", end_date: "", product_ids: [] });
                fetchPromotions();
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to create promotion");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const response = await fetch(`/api/admin/promotions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setPromotions(promotions.filter(p => p.id !== id));
                toast.success("Promotion deleted");
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const filteredPromotions = promotions.filter(promo => 
        promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleProductSelection = (productId: number) => {
        setNewPromo(prev => {
            const ids = prev.product_ids.includes(productId) 
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId];
            return { ...prev, product_ids: ids };
        });
    };
    
    const selectAllProducts = () => {
        if (newPromo.product_ids.length === products.length) {
            setNewPromo(prev => ({ ...prev, product_ids: [] }));
        } else {
            setNewPromo(prev => ({ ...prev, product_ids: products.map(p => p.id) }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
                    <p className="text-muted-foreground">Manage discount codes and marketing campaigns.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Create Promotion
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Promotion</DialogTitle>
                            <DialogDescription>
                                Set up a new discount code or promotional campaign.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Promotion Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g., Summer Sale 2024" 
                                    value={newPromo.name}
                                    onChange={(e) => setNewPromo({...newPromo, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select 
                                        value={newPromo.type} 
                                        onValueChange={(val) => setNewPromo({...newPromo, type: val as any})}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="product">Product Discount</SelectItem>
                                            <SelectItem value="holiday">Holiday Special</SelectItem>
                                            <SelectItem value="flash">Flash Sale</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discount">Discount Percentage (%)</Label>
                                    <Input 
                                        id="discount" 
                                        type="number"
                                        placeholder="20" 
                                        value={newPromo.discount_percentage}
                                        onChange={(e) => setNewPromo({...newPromo, discount_percentage: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input 
                                    id="description" 
                                    placeholder="Internal note or customer facing text" 
                                    value={newPromo.description}
                                    onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input 
                                        id="start_date" 
                                        type="datetime-local"
                                        value={newPromo.start_date}
                                        onChange={(e) => setNewPromo({...newPromo, start_date: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input 
                                        id="end_date" 
                                        type="datetime-local"
                                        value={newPromo.end_date}
                                        onChange={(e) => setNewPromo({...newPromo, end_date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <div className="flex justify-between items-center">
                                    <Label>Select Products</Label>
                                    <Button variant="ghost" size="sm" onClick={selectAllProducts}>
                                        {newPromo.product_ids.length === products.length ? "Deselect All" : "Select All"}
                                    </Button>
                                </div>
                                <ScrollArea className="h-[200px] border rounded-md p-4">
                                    <div className="grid grid-cols-1 gap-2">
                                        {products.map(product => (
                                            <div key={product.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`product-${product.id}`} 
                                                    checked={newPromo.product_ids.includes(product.id)}
                                                    onCheckedChange={() => toggleProductSelection(product.id)}
                                                />
                                                <Label htmlFor={`product-${product.id}`} className="text-sm font-normal cursor-pointer flex-1">
                                                    {product.name} - £{product.price}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <p className="text-sm text-muted-foreground">
                                    Selected: {newPromo.product_ids.length} products
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreatePromo}>Create Promotion</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Promotions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <Input
                            placeholder="Search promotions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Stats</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredPromotions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No promotions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPromotions.map((promo) => (
                                        <TableRow key={promo.id}>
                                            <TableCell className="font-medium">
                                                {promo.name}
                                                <div className="text-xs text-muted-foreground">{promo.description}</div>
                                            </TableCell>
                                            <TableCell className="capitalize">{promo.type}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{promo.discount_percentage}%</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span className="font-medium">{promo.order_items_count || 0} Sales</span>
                                                    <span className="text-muted-foreground">£{Number(promo.order_items_sum_line_total || 0).toFixed(2)} Rev</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                <div>{promo.start_date ? new Date(promo.start_date).toLocaleDateString() : 'Now'} - </div>
                                                <div>{promo.end_date ? new Date(promo.end_date).toLocaleDateString() : 'Forever'}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={promo.is_active ? "default" : "destructive"}>
                                                    {promo.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
