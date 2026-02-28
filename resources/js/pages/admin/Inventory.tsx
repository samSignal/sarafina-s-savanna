import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [newStock, setNewStock] = useState("");
    const [newThreshold, setNewThreshold] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error("Failed to load inventory");
        }
    };

    const handleOpenUpdateDialog = (product) => {
        setCurrentProduct(product);
        setNewStock(product.stock.toString());
        setNewThreshold(product.low_stock_threshold ? product.low_stock_threshold.toString() : "10");
        setIsDialogOpen(true);
    };

    const handleUpdateStock = async () => {
        if (!currentProduct) return;

        try {
            const response = await fetch(`/api/products/${currentProduct.id}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    stock: parseInt(newStock),
                    low_stock_threshold: parseInt(newThreshold)
                }),
            });

            if (response.ok) {
                toast.success("Stock updated successfully");
                fetchProducts();
                setIsDialogOpen(false);
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to update stock");
            }
        } catch (error) {
            console.error("Failed to update stock", error);
            toast.error("Failed to update stock");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'In Stock':
                return <Badge className="bg-green-500">In Stock</Badge>;
            case 'Low Stock':
                return <Badge className="bg-yellow-500">Low Stock</Badge>;
            case 'Out of Stock':
                return <Badge variant="destructive">Out of Stock</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                    <p className="text-muted-foreground">Monitor and update product stock levels.</p>
                </div>
                <Button onClick={fetchProducts} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Current Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.department?.name}</TableCell>
                                    <TableCell>{product.category?.name || '-'}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleOpenUpdateDialog(product)}
                                        >
                                            Update Stock
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Stock Level</DialogTitle>
                        <DialogDescription>
                            Update inventory count for <strong>{currentProduct?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="stock" className="text-right">
                                    Quantity
                                </Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={newStock}
                                    onChange={(e) => setNewStock(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="threshold" className="text-right">
                                    Low Stock Alert
                                </Label>
                                <Input
                                    id="threshold"
                                    type="number"
                                    min="0"
                                    value={newThreshold}
                                    onChange={(e) => setNewThreshold(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStock}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
