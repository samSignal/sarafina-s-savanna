import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";

interface Product {
    id: number;
    name: string;
    price: number;
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

const emptyForm = {
    name: "",
    type: "product" as 'product' | 'holiday' | 'flash',
    discount_percentage: "",
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
    product_ids: [] as number[],
};

export default function Promotions() {
    const { token } = useAuth();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);

    const fetchPromotions = async () => {
        try {
            const res = await fetch('/api/admin/promotions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setPromotions(await res.json());
        } catch { toast.error("Failed to load promotions"); }
        finally { setLoading(false); }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setProducts(Array.isArray(data) ? data : data.data || []);
            }
        } catch { console.error("Failed to fetch products"); }
    };

    useEffect(() => {
        if (token) { fetchPromotions(); fetchProducts(); }
    }, [token]);

    const openCreate = () => {
        setEditingPromo(null);
        setForm({ ...emptyForm });
        setDialogOpen(true);
    };

    const openEdit = (promo: Promotion) => {
        setEditingPromo(promo);
        setForm({
            name: promo.name,
            type: promo.type,
            discount_percentage: String(promo.discount_percentage),
            description: promo.description || "",
            start_date: promo.start_date ? promo.start_date.slice(0, 16) : "",
            end_date: promo.end_date ? promo.end_date.slice(0, 16) : "",
            is_active: promo.is_active,
            product_ids: promo.products?.map(p => p.id) || [],
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.discount_percentage || form.product_ids.length === 0) {
            toast.error("Please fill in name, discount, and select at least one product");
            return;
        }
        setSaving(true);
        try {
            const url = editingPromo
                ? `/api/admin/promotions/${editingPromo.id}`
                : '/api/admin/promotions';
            const method = editingPromo ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                toast.success(editingPromo ? "Promotion updated" : "Promotion created");
                setDialogOpen(false);
                fetchPromotions();
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to save promotion");
            }
        } catch { toast.error("An error occurred"); }
        finally { setSaving(false); }
    };

    const handleToggleActive = async (promo: Promotion) => {
        try {
            const res = await fetch(`/api/admin/promotions/${promo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ is_active: !promo.is_active }),
            });
            if (res.ok) {
                setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p));
                toast.success(`Promotion ${!promo.is_active ? 'activated' : 'deactivated'}`);
            }
        } catch { toast.error("Failed to update status"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this promotion? Products will have their prices reverted.")) return;
        try {
            const res = await fetch(`/api/admin/promotions/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setPromotions(prev => prev.filter(p => p.id !== id));
                toast.success("Promotion deleted");
            }
        } catch { toast.error("Failed to delete"); }
    };

    const toggleProduct = (id: number) => {
        setForm(prev => ({
            ...prev,
            product_ids: prev.product_ids.includes(id)
                ? prev.product_ids.filter(x => x !== id)
                : [...prev.product_ids, id],
        }));
    };

    const filtered = promotions.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Promotions</h1>
                    <p className="text-muted-foreground">Manage discount campaigns and special offers.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Promotion
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Promotions</CardTitle>
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
                                    <TableRow><TableCell colSpan={7} className="text-center h-24">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center h-24">No promotions found.</TableCell></TableRow>
                                ) : filtered.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell className="font-medium">
                                            {promo.name}
                                            {promo.description && <div className="text-xs text-muted-foreground">{promo.description}</div>}
                                        </TableCell>
                                        <TableCell className="capitalize">{promo.type}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{Number(promo.discount_percentage)}% OFF</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">{promo.order_items_count || 0} sales</div>
                                                <div className="text-muted-foreground">£{Number(promo.order_items_sum_line_total || 0).toFixed(2)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            <div>{promo.start_date ? new Date(promo.start_date).toLocaleDateString() : 'Immediately'}</div>
                                            <div className="text-muted-foreground">{promo.end_date ? `until ${new Date(promo.end_date).toLocaleDateString()}` : 'No end date'}</div>
                                            {promo.end_date && new Date(promo.end_date) < new Date() && (
                                                <Badge variant="destructive" className="mt-1 text-xs">Expired</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={promo.is_active}
                                                    onCheckedChange={() => handleToggleActive(promo)}
                                                />
                                                <Badge variant={promo.is_active ? "default" : "secondary"}>
                                                    {promo.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(promo)} title="Edit">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)} title="Delete" className="text-destructive hover:text-destructive">
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPromo ? "Edit Promotion" : "Create Promotion"}</DialogTitle>
                        <DialogDescription>
                            {editingPromo ? "Update the promotion details below." : "Set up a new promotional campaign."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Promotion Name</Label>
                            <Input
                                placeholder="e.g., Summer Sale 2025"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Type</Label>
                                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="product">Product Discount</SelectItem>
                                        <SelectItem value="holiday">Holiday Special</SelectItem>
                                        <SelectItem value="flash">Flash Sale</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Discount (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="20"
                                    value={form.discount_percentage}
                                    onChange={(e) => setForm({ ...form, discount_percentage: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Optional description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date</Label>
                                <Input type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={form.is_active}
                                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                            />
                            <Label>Active (visible to customers)</Label>
                        </div>
                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <Label>Select Products ({form.product_ids.length} selected)</Label>
                                <Button variant="ghost" size="sm" onClick={() =>
                                    setForm(prev => ({
                                        ...prev,
                                        product_ids: prev.product_ids.length === products.length ? [] : products.map(p => p.id)
                                    }))
                                }>
                                    {form.product_ids.length === products.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>
                            <ScrollArea className="h-[200px] border rounded-md p-4">
                                <div className="grid gap-2">
                                    {products.map(product => (
                                        <div key={product.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`p-${product.id}`}
                                                checked={form.product_ids.includes(product.id)}
                                                onCheckedChange={() => toggleProduct(product.id)}
                                            />
                                            <Label htmlFor={`p-${product.id}`} className="text-sm font-normal cursor-pointer flex-1">
                                                {product.name} — £{Number(product.price).toFixed(2)}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : editingPromo ? "Save Changes" : "Create Promotion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
