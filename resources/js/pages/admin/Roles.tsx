import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Shield, MoreHorizontal, Edit, Trash, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface Role {
    id: number;
    name: string;
    description: string;
    is_system: boolean;
    users_count: number;
    permissions: string[];
}

interface PermissionGroup {
    [key: string]: Array<{
        id: number;
        name: string;
        description: string;
    }>;
}

export default function Roles() {
    const { token } = useAuth();
    const { toast } = useToast();
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<PermissionGroup>({});
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<Role | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        permissions: [] as string[]
    });

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/roles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
            }
        } catch (error) {
            console.error("Failed to fetch roles", error);
            toast({
                title: "Error",
                description: "Failed to load roles",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await fetch('/api/admin/permissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPermissions(data);
            }
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        }
    };

    const handleCreateRole = async () => {
        try {
            const response = await fetch('/api/admin/roles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({ title: "Success", description: "Role created successfully" });
                setIsCreateOpen(false);
                setFormData({ name: "", description: "", permissions: [] });
                fetchRoles();
            } else {
                const data = await response.json();
                toast({ 
                    title: "Error", 
                    description: data.message || "Failed to create role", 
                    variant: "destructive" 
                });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" });
        }
    };

    const handleUpdateRole = async () => {
        if (!currentRole) return;
        
        try {
            const response = await fetch(`/api/admin/roles/${currentRole.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({ title: "Success", description: "Role updated successfully" });
                setIsEditOpen(false);
                setCurrentRole(null);
                setFormData({ name: "", description: "", permissions: [] });
                fetchRoles();
            } else {
                const data = await response.json();
                toast({ 
                    title: "Error", 
                    description: data.message || "Failed to update role", 
                    variant: "destructive" 
                });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" });
        }
    };

    const handleDeleteRole = async (role: Role) => {
        if (role.is_system) {
            toast({ title: "Error", description: "Cannot delete system roles", variant: "destructive" });
            return;
        }

        if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

        try {
            const response = await fetch(`/api/admin/roles/${role.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast({ title: "Success", description: "Role deleted successfully" });
                fetchRoles();
            } else {
                const data = await response.json();
                toast({ 
                    title: "Error", 
                    description: data.message || "Failed to delete role", 
                    variant: "destructive" 
                });
            }
        } catch (error) {
            toast({ title: "Error", description: "An error occurred", variant: "destructive" });
        }
    };

    const openEditDialog = (role: Role) => {
        setCurrentRole(role);
        setFormData({
            name: role.name,
            description: role.description || "",
            permissions: role.permissions
        });
        setIsEditOpen(true);
    };

    const togglePermission = (permName: string) => {
        setFormData(prev => {
            if (prev.permissions.includes(permName)) {
                return { ...prev, permissions: prev.permissions.filter(p => p !== permName) };
            } else {
                return { ...prev, permissions: [...prev.permissions, permName] };
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Manage system roles and their access privileges.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Create Role
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>Define a new role and assign permissions.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Role Name</Label>
                                <Input 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Marketing Manager"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Describe what this role can do..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <div className="border rounded-md p-4 space-y-4">
                                    {Object.entries(permissions).map(([group, perms]) => (
                                        <div key={group} className="space-y-2">
                                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{group}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {perms.map(perm => (
                                                    <div key={perm.id} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`create-perm-${perm.id}`} 
                                                            checked={formData.permissions.includes(perm.name)}
                                                            onCheckedChange={() => togglePermission(perm.name)}
                                                        />
                                                        <Label htmlFor={`create-perm-${perm.id}`} className="text-sm font-normal cursor-pointer">
                                                            {perm.description || perm.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateRole}>Create Role</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>System Roles</CardTitle>
                        <CardDescription>
                            Define what users can do within the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">Role Name</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="w-[100px] text-center">Users</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-full ${role.is_system ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                                    {role.is_system ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{role.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{role.description}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.slice(0, 3).map((perm) => (
                                                    <Badge key={perm} variant="secondary" className="text-xs font-normal">
                                                        {perm.replace('_', ' ')}
                                                    </Badge>
                                                ))}
                                                {role.permissions.length > 3 && (
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        +{role.permissions.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline">{role.users_count}</Badge>
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
                                                    <DropdownMenuItem onClick={() => openEditDialog(role)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Role
                                                    </DropdownMenuItem>
                                                    {!role.is_system && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                className="text-red-600"
                                                                onClick={() => handleDeleteRole(role)}
                                                            >
                                                                <Trash className="mr-2 h-4 w-4" /> Delete Role
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>Modify permissions for {currentRole?.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Role Name</Label>
                            <Input 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                disabled={currentRole?.is_system}
                            />
                            {currentRole?.is_system && <p className="text-xs text-muted-foreground">System role names cannot be changed.</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="border rounded-md p-4 space-y-4">
                                {Object.entries(permissions).map(([group, perms]) => (
                                    <div key={group} className="space-y-2">
                                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">{group}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {perms.map(perm => (
                                                <div key={perm.id} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`edit-perm-${perm.id}`} 
                                                        checked={formData.permissions.includes(perm.name)}
                                                        onCheckedChange={() => togglePermission(perm.name)}
                                                    />
                                                    <Label htmlFor={`edit-perm-${perm.id}`} className="text-sm font-normal cursor-pointer">
                                                        {perm.description || perm.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateRole}>Update Role</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
