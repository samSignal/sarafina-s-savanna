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

export default function Products() {
    const [searchParams] = useSearchParams();
    const initialDeptId = searchParams.get("department_id");

    const [products, setProducts] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    const [currentProduct, setCurrentProduct] = useState({
        id: null,
        department_id: initialDeptId || "",
        category_id: "",
        name: "",
        description: "",
        price: "",
        stock: "",
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
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error("Failed to load products");
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments');
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
            const response = await fetch('/api/categories');
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

    const handleOpenDialog = (prod = null) => {
        if (prod) {
            setIsEditing(true);
            setCurrentProduct({
                ...prod,
                department_id: prod.department_id?.toString() || "",
                category_id: prod.category_id?.toString() || "",
                price: prod.price.toString(),
                stock: prod.stock.toString()
            });
            setImageFile(null);
        } else {
            setIsEditing(false);
            setCurrentProduct({
                id: null,
                department_id: initialDeptId || "",
                category_id: "",
                name: "",
                description: "",
                price: "",
                stock: "",
                status: "In Stock",
                image: ""
            });
            setImageFile(null);
        }
        setIsDialogOpen(true);
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
            formData.append("price", currentProduct.price);
            formData.append("stock", currentProduct.stock || "0");
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
                    method: 'DELETE'
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
                                <div className="grid gap-2">
                                    <Label htmlFor="price">Price ($) *</Label>
                                    <Input 
                                        id="price" 
                                        type="number"
                                        placeholder="0.00" 
                                        value={currentProduct.price}
                                        onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Stock Quantity</Label>
                                    <Input 
                                        id="stock" 
                                        type="number"
                                        placeholder="0" 
                                        value={currentProduct.stock}
                                        onChange={(e) => setCurrentProduct({...currentProduct, stock: e.target.value})}
                                    />
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
                                        <div className="h-10 w-10 rounded-md bg-slate-100 border flex items-center justify-center">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
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
                                    <TableCell>${Number(product.price).toFixed(2)}</TableCell>
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
