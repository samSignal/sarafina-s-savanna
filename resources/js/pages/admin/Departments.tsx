import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, FolderTree } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Departments() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDept, setCurrentDept] = useState<{ id: number | null; name: string; description: string; status: string; image: string; points_multiplier: string; loyalty_reason: string }>({ id: null, name: "", description: "", status: "Active", image: "", points_multiplier: "1.00", loyalty_reason: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments');
            if (response.ok) {
                const data = await response.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error("Failed to fetch departments", error);
            toast.error("Failed to load departments");
        }
    };

    // Filter departments based on search query
    const filteredDepartments = departments.filter(dept => 
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleOpenDialog = (dept: any = null) => {
        if (dept) {
            setIsEditing(true);
            setCurrentDept({ 
                ...dept,
                image: dept.image || "",
                points_multiplier: dept.points_multiplier || "1.00",
                loyalty_reason: dept.loyalty_reason || ""
            });
        } else {
            setIsEditing(false);
            setCurrentDept({ id: null, name: "", description: "", status: "Active", image: "", points_multiplier: "1.00", loyalty_reason: "" });
        }
        setImageFile(null);
        setIsDialogOpen(true);
    };

    const handleSaveDepartment = async () => {
        if (!currentDept.name) {
            toast.error("Department name is required");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", currentDept.name);
            formData.append("description", currentDept.description || "");
            formData.append("status", currentDept.status);
            formData.append("points_multiplier", currentDept.points_multiplier);
            formData.append("loyalty_reason", currentDept.loyalty_reason);
            if (currentDept.image) {
                formData.append("image", currentDept.image);
            }
            if (imageFile) {
                formData.append("image_file", imageFile);
            }

            if (isEditing && currentDept.id !== null) {
                formData.append("_method", "PUT");
                const response = await fetch(`/api/departments/${currentDept.id}`, {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const updatedDept = await response.json();
                    setDepartments(departments.map(d => d.id === updatedDept.id ? updatedDept : d));
                    toast.success("Department updated successfully");
                }
            } else {
                const response = await fetch('/api/departments', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const newDept = await response.json();
                    setDepartments([newDept, ...departments]);
                    toast.success("Department added successfully");
                }
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error saving department", error);
            toast.error("Failed to save department");
        }
    };

    const handleDeleteDepartment = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this department?")) {
            try {
                const response = await fetch(`/api/departments/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setDepartments(departments.filter(d => d.id !== id));
                    toast.success("Department removed successfully");
                }
            } catch (error) {
                console.error("Error deleting department", error);
                toast.error("Failed to delete department");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
                    <p className="text-muted-foreground">Manage product categories and store departments.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                </Button>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Department" : "Add New Department"}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? "Update department details." : "Create a new product category for your store."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g., Frozen Foods" 
                                    value={currentDept.name}
                                    onChange={(e) => setCurrentDept({...currentDept, name: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="Brief description of the department..." 
                                    value={currentDept.description}
                                    onChange={(e) => setCurrentDept({...currentDept, description: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={currentDept.status} 
                                    onValueChange={(value) => setCurrentDept({...currentDept, status: value})}
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
                            <div className="grid gap-2">
                                <Label htmlFor="points_multiplier">Points Multiplier</Label>
                                <Input 
                                    id="points_multiplier" 
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="1.0"
                                    value={currentDept.points_multiplier}
                                    onChange={(e) => setCurrentDept({...currentDept, points_multiplier: e.target.value})}
                                />
                                <p className="text-sm text-muted-foreground">Default is 1.0. Higher means more points.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="loyalty_reason">Loyalty Reason</Label>
                                <Input 
                                    id="loyalty_reason" 
                                    placeholder="e.g., High margin item" 
                                    value={currentDept.loyalty_reason || ""}
                                    onChange={(e) => setCurrentDept({...currentDept, loyalty_reason: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Image URL</Label>
                                <Input 
                                    id="image" 
                                    placeholder="/images/departments/example.jpg or leave blank when uploading" 
                                    value={currentDept.image}
                                    onChange={(e) => setCurrentDept({...currentDept, image: e.target.value})}
                                />
                                <Label htmlFor="image_file">Upload Image</Label>
                                <Input
                                    id="image_file"
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
                            <Button onClick={handleSaveDepartment}>{isEditing ? "Update" : "Save"} Department</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search departments..." 
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
                    Showing <strong>{filteredDepartments.length}</strong> of <strong>{departments.length}</strong> departments
                </div>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Multiplier</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDepartments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No departments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDepartments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell>
                                        {dept.image ? (
                                            <img src={dept.image} alt={dept.name} className="h-10 w-10 object-cover rounded-md" />
                                        ) : (
                                            <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                                                <FolderTree className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">{dept.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={dept.status === "Active" ? "default" : "secondary"}>
                                            {dept.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{dept.points_multiplier || "1.00"}x</Badge>
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
                                                <DropdownMenuItem onClick={() => handleOpenDialog(dept)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteDepartment(dept.id)}
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
