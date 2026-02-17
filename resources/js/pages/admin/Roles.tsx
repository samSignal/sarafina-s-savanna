import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Shield, MoreHorizontal, Edit, Trash, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const roles = [
    { 
        id: 1, 
        name: "Administrator", 
        description: "Full access to all system resources", 
        users: 3, 
        permissions: ["All Permissions"],
        isSystem: true
    },
    { 
        id: 2, 
        name: "Store Manager", 
        description: "Can manage products, orders, and view reports", 
        users: 5, 
        permissions: ["manage_products", "manage_orders", "view_reports", "manage_customers"],
        isSystem: false
    },
    { 
        id: 3, 
        name: "Support Agent", 
        description: "Can view orders and manage customer support tickets", 
        users: 8, 
        permissions: ["view_orders", "manage_support", "view_customers"],
        isSystem: false
    },
    { 
        id: 4, 
        name: "Content Editor", 
        description: "Can edit blog posts and page content", 
        users: 2, 
        permissions: ["manage_content", "view_dashboard"],
        isSystem: false
    }
];

export default function Roles() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-muted-foreground">Manage system roles and their access privileges.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Create Role
        </Button>
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
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-full ${role.isSystem ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {role.isSystem ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
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
                                    <Badge variant="outline" className="rounded-full px-3">
                                        {role.users}
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
                                            <DropdownMenuItem>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Permissions
                                            </DropdownMenuItem>
                                            {!role.isSystem && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
