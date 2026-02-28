import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const STRIPE_FEE_CONFIG = {
    uk_eu: {
        percent: 0.014,
        fixed: 0.2,
    },
    international: {
        percent: 0.029,
        fixed: 0.2,
    },
} as const;

function calculatePriceWithStripeFees(net: number, percentFee: number, fixedFee: number): number {
    if (!Number.isFinite(net) || net <= 0) {
        return 0;
    }

    const denominator = 1 - percentFee;
    if (denominator <= 0) {
        return net;
    }

    return (net + fixedFee) / denominator;
}

export default function Products() {
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const initialDeptId = searchParams.get("department_id");

    const [products, setProducts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [desiredNetPrice, setDesiredNetPrice] = useState("");
    
    const [currentProduct, setCurrentProduct] = useState({
        id: null as number | null,
        department_id: initialDeptId || "",
        category_id: "",
        name: "",
        description: "",
        price: "",
        desired_net_price: "",
        price_uk_eu: "",
        price_international: "",
        stock: "",
        low_stock_threshold: "10",
        status: "In Stock",
        image: ""
    });

    useEffect(() => {
        fetchProducts();
        fetchDepartments();
        fetchCategories();
        
        if (initialDeptId) {
            setIsDialogOpen(true);
        }
    }, [initialDeptId]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProducts(data.filter((p: any) => p.type !== 'gift_card'));
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error("Failed to load products");
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    // Filter categories based on selected department
    const availableCategories = categories.filter(cat => 
        !currentProduct.department_id || cat.department_id.toString() === currentProduct.department_id.toString()
    );

    const handleOpenDialog = (prod: any = null) => {
        if (prod) {
            setIsEditing(true);
            setCurrentProduct({
                ...prod,
                department_id: prod.department_id?.toString() || "",
                category_id: prod.category_id?.toString() || "",
                price: prod.price.toString(),
                desired_net_price: prod.desired_net_price ? prod.desired_net_price.toString() : "",
                price_uk_eu: prod.price_uk_eu ? prod.price_uk_eu.toString() : "",
                price_international: prod.price_international ? prod.price_international.toString() : "",
                stock: prod.stock.toString(),
                low_stock_threshold: prod.low_stock_threshold ? prod.low_stock_threshold.toString() : "10"
            });
            setImageFile(null);
            setDesiredNetPrice(prod.desired_net_price ? prod.desired_net_price.toString() : "");
        } else {
            setIsEditing(false);
            setCurrentProduct({
                id: null,
                department_id: initialDeptId || "",
                category_id: "",
                name: "",
                description: "",
                price: "",
                desired_net_price: "",
                price_uk_eu: "",
                price_international: "",
                stock: "",
                low_stock_threshold: "10",
                status: "In Stock",
                image: ""
            });
            setImageFile(null);
            setDesiredNetPrice("");
        }
        setIsDialogOpen(true);
    };

    const handleDesiredNetPriceChange = (value: string) => {
        setDesiredNetPrice(value);
        const net = parseFloat(value);

        if (Number.isNaN(net) || net <= 0) {
            return;
        }

        const { percent: percentUkEu, fixed: fixedUkEu } = STRIPE_FEE_CONFIG.uk_eu;
        const { percent: percentIntl, fixed: fixedIntl } = STRIPE_FEE_CONFIG.international;

        const grossUkEu = calculatePriceWithStripeFees(net, percentUkEu, fixedUkEu);
        const grossIntl = calculatePriceWithStripeFees(net, percentIntl, fixedIntl);

        setCurrentProduct((prev) => ({
            ...prev,
            price: grossUkEu.toFixed(2),
            desired_net_price: net.toFixed(2),
            price_uk_eu: grossUkEu.toFixed(2),
            price_international: grossIntl.toFixed(2),
        }));
    };

    const handleSaveProduct = async () => {
        if (!currentProduct.name || !currentProduct.department_id || !currentProduct.price) {
            toast.error("Name, Department, and Price are required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("department_id", currentProduct.department_id);
            if (currentProduct.category_id) {
                formData.append("category_id", currentProduct.category_id);
            }
            formData.append("name", currentProduct.name);
            if (currentProduct.description) {
                formData.append("description", currentProduct.description);
            }

            const priceValue = currentProduct.price || "0";
            const desiredNetValue = desiredNetPrice || currentProduct.desired_net_price || "";
            const priceUkEuValue = currentProduct.price_uk_eu || priceValue;
            const priceInternationalValue = currentProduct.price_international || priceValue;

            formData.append("price", priceValue);
            if (desiredNetValue) {
                formData.append("desired_net_price", desiredNetValue);
            }
            formData.append("price_uk_eu", priceUkEuValue);
            formData.append("price_international", priceInternationalValue);
            formData.append("stock", currentProduct.stock || "0");
            formData.append("low_stock_threshold", currentProduct.low_stock_threshold || "10");
            formData.append("status", currentProduct.status);
            if (currentProduct.image) {
                formData.append("image", currentProduct.image);
            }
            if (imageFile) {
                formData.append("image_file", imageFile);
            }

            if (isEditing) {
                const response = await fetch(`/api/products/${currentProduct.id}`, {
                    method: 'POST',
                    headers: {
                        "X-HTTP-Method-Override": "PUT",
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                });
                
                if (response.ok) {
                    const updatedProd = await response.json();
                    setProducts(products.map(p => p.id === updatedProd.id ? updatedProd : p));
                    toast.success("Product updated successfully");
                }
            } else {
                const response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                });

                if (response.ok) {
                    const newProd = await response.json();
                    setProducts([newProd, ...products]);
                    toast.success("Product added successfully");
                }
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving product", error);
            toast.error("Failed to save product");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    setProducts(products.filter(p => p.id !== id));
                    toast.success("Product removed successfully");
                }
            } catch (error) {
                console.error("Error deleting product", error);
                toast.error("Failed to delete product");
            }
        }
    };

    const filteredProducts = products.filter(prod => 
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.department && prod.department.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your product inventory.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? "Update product details." : "Add a new item to your inventory."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="department">Department *</Label>
                                    <Select 
                                        value={currentProduct.department_id} 
                                        onValueChange={(value) => setCurrentProduct({...currentProduct, department_id: value, category_id: ""})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>{dept.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category (Optional)</Label>
                                    <Select 
                                        value={currentProduct.category_id} 
                                        onValueChange={(value) => setCurrentProduct({...currentProduct, category_id: value})}
                                        disabled={!currentProduct.department_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g., Premium Coffee Beans" 
                                    value={currentProduct.name}
                                    onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="Product description..." 
                                    value={currentProduct.description}
                                    onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-lg border bg-muted/40 p-3 sm:p-4 space-y-3">
                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="desiredPrice">Smart pricing</Label>
                                        <span className="text-[11px] text-muted-foreground">
                                            Enter what you want to receive; we add Stripe fees on top.
                                        </span>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="desiredPrice" className="text-xs text-muted-foreground">
                                            Amount you want to receive (after Stripe fees)
                                        </Label>
                                        <Input
                                            id="desiredPrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter net amount, e.g. 10.00"
                                            value={desiredNetPrice}
                                            onChange={(e) => handleDesiredNetPriceChange(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="priceUkEu" className="text-xs text-muted-foreground">
                                            Price for UK / EU cards (1.4% + £0.20)
                                        </Label>
                                        <Input 
                                            id="priceUkEu" 
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Auto-calculated from desired amount"
                                            value={currentProduct.price_uk_eu || currentProduct.price}
                                            readOnly
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="priceInternational" className="text-xs text-muted-foreground">
                                            Price for international cards (2.9% + £0.20)
                                        </Label>
                                        <Input 
                                            id="priceInternational" 
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Auto-calculated from desired amount"
                                            value={currentProduct.price_international}
                                            readOnly
                                        />
                                    </div>
                                    {desiredNetPrice && (currentProduct.price_uk_eu || currentProduct.price) && currentProduct.price_international && (
                                        <span className="text-[11px] text-muted-foreground">
                                            UK / EU customer pays <span className="font-medium">£{Number(currentProduct.price_uk_eu || currentProduct.price || 0).toFixed(2)}</span>{" "}
                                            and international customer pays <span className="font-medium">£{Number(currentProduct.price_international || 0).toFixed(2)}</span>{" "}
                                            so you receive about <span className="font-medium">£{Number(desiredNetPrice || 0).toFixed(2)}</span> after Stripe fees.
                                        </span>
                                    )}
                                </div>
                                <div className="rounded-lg border bg-muted/40 p-3 sm:p-4 space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="stock">Stock quantity</Label>
                                        <Input 
                                            id="stock" 
                                            type="number"
                                            min="0"
                                            placeholder="0" 
                                            value={currentProduct.stock}
                                            onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                                        <div className="text-[10px] text-muted-foreground">
                                            Alert when stock is below this value.
                                        </div>
                                        <Input 
                                            id="low_stock_threshold" 
                                            type="number"
                                            min="0"
                                            placeholder="10" 
                                            value={currentProduct.low_stock_threshold}
                                            onChange={(e) => setCurrentProduct({...currentProduct, low_stock_threshold: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={currentProduct.status} 
                                    onValueChange={(value) => setCurrentProduct({...currentProduct, status: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="In Stock">In Stock</SelectItem>
                                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">Product Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setImageFile(file);
                                    }}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveProduct}>{isEditing ? "Update" : "Save"} Product</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search products..." 
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
                    Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
                </div>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-md bg-slate-100 border overflow-hidden flex items-center justify-center">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div>{product.name}</div>
                                        {product.category && (
                                            <div className="text-xs text-muted-foreground">{product.category.name}</div>
                                        )}
                                    </TableCell>
                                    <TableCell>{product.department?.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.status === "In Stock" ? "default" : product.status === "Low Stock" ? "secondary" : "destructive"} className={product.status === "In Stock" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : product.status === "Low Stock" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200" : "bg-red-100 text-red-800 hover:bg-red-200 border-red-200"}>
                                            {product.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>£{Number(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
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
                                                <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
