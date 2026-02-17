import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ id: null, department_id: "", name: "", description: "", status: "Active" });

    useEffect(() => {
        fetchCategories();
        fetchDepartments();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
            toast.error("Failed to load categories");
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

    // Filter categories based on search query
    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cat.department && cat.department.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleOpenDialog = (cat = null) => {
        if (cat) {
            setIsEditing(true);
            setCurrentCategory({ ...cat, department_id: cat.department_id.toString() });
        } else {
            setIsEditing(false);
            setCurrentCategory({ id: null, department_id: "", name: "", description: "", status: "Active" });
        }
        setIsDialogOpen(true);
    };

    const handleSaveCategory = async () => {
        if (!currentCategory.name || !currentCategory.department_id) {
            toast.error("Category name and department are required");
            return;
        }

        try {
            if (isEditing) {
                const response = await fetch(`/api/categories/${currentCategory.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentCategory)
                });
                
                if (response.ok) {
                    const updatedCat = await response.json();
                    setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c));
                    toast.success("Category updated successfully");
                }
            } else {
                const response = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentCategory)
                });

                if (response.ok) {
                    const newCat = await response.json();
                    setCategories([newCat, ...categories]);
                    toast.success("Category added successfully");
                }
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving category", error);
            toast.error("Failed to save category");
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const response = await fetch(`/api/categories/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setCategories(categories.filter(c => c.id !== id));
                    toast.success("Category removed successfully");
                }
            } catch (error) {
                console.error("Error deleting category", error);
                toast.error("Failed to delete category");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">Manage sub-categories under departments.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? "Update category details." : "Create a new category under a department."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Select 
                                    value={currentCategory.department_id} 
                                    onValueChange={(value) => setCurrentCategory({...currentCategory, department_id: value})}
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
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g., Beef" 
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="Brief description..." 
                                    value={currentCategory.description}
                                    onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={currentCategory.status} 
                                    onValueChange={(value) => setCurrentCategory({...currentCategory, status: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveCategory}>{isEditing ? "Update" : "Save"} Category</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search categories..." 
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
                    Showing <strong>{filteredCategories.length}</strong> of <strong>{categories.length}</strong> categories
                </div>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCategories.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                            <Tags className="h-4 w-4" />
                                        </div>
                                        {cat.name}
                                    </TableCell>
                                    <TableCell>
                                        {cat.department?.name}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate" title={cat.description}>
                                        {cat.description}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={cat.status === "Active" ? "default" : "secondary"} className={cat.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200"}>
                                            {cat.status}
                                        </Badge>
                                    </TableCell>
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
                                                <DropdownMenuItem onClick={() => handleOpenDialog(cat)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteCategory(cat.id)}
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
