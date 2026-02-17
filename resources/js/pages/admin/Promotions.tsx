import { useState } from "react";
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

// Mock data
const initialPromotions = [
    { id: 1, code: "WELCOME20", type: "Percentage", value: 20, description: "20% off for new customers", usage: 145, status: "Active", startDate: "2024-01-01", endDate: "2024-12-31" },
    { id: 2, code: "FREESHIP", type: "Fixed Amount", value: 0, description: "Free shipping on orders over $50", usage: 89, status: "Active", startDate: "2024-03-01", endDate: "2024-06-30" },
    { id: 3, code: "SUMMER10", type: "Percentage", value: 10, description: "Summer sale discount", usage: 0, status: "Scheduled", startDate: "2024-06-01", endDate: "2024-08-31" },
    { id: 4, code: "FLASH50", type: "Percentage", value: 50, description: "Flash sale clearance", usage: 320, status: "Expired", startDate: "2024-02-14", endDate: "2024-02-15" },
];

export default function Promotions() {
    const [promotions, setPromotions] = useState(initialPromotions);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Form state
    const [newPromo, setNewPromo] = useState({ 
        code: "", 
        type: "Percentage", 
        value: "", 
        description: "", 
        startDate: "", 
        endDate: "",
        status: "Active" 
    });

    const handleCreatePromo = () => {
        if (!newPromo.code || !newPromo.value) {
            toast.error("Please fill in all required fields");
            return;
        }

        const promo = {
            id: promotions.length + 1,
            ...newPromo,
            value: parseFloat(newPromo.value),
            usage: 0
        };

        setPromotions([promo, ...promotions]);
        setIsCreateOpen(false);
        setNewPromo({ code: "", type: "Percentage", value: "", description: "", startDate: "", endDate: "", status: "Active" });
        toast.success("Promotion created successfully");
    };

    const handleDelete = (id: number) => {
        setPromotions(promotions.filter(p => p.id !== id));
        toast.success("Promotion deleted");
    };

    const filteredPromotions = promotions.filter(promo => 
        promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Promotion</DialogTitle>
                            <DialogDescription>
                                Set up a new discount code or promotional campaign.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Promo Code</Label>
                                <Input 
                                    id="code" 
                                    placeholder="e.g., SUMMER2024" 
                                    className="uppercase"
                                    value={newPromo.code}
                                    onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Discount Type</Label>
                                    <Select 
                                        value={newPromo.type} 
                                        onValueChange={(value) => setNewPromo({...newPromo, type: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="Fixed Amount">Fixed Amount ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="value">Value</Label>
                                    <Input 
                                        id="value" 
                                        type="number" 
                                        placeholder="20" 
                                        value={newPromo.value}
                                        onChange={(e) => setNewPromo({...newPromo, value: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input 
                                    id="description" 
                                    placeholder="Internal note or customer facing description" 
                                    value={newPromo.description}
                                    onChange={(e) => setNewPromo({...newPromo, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input 
                                        id="startDate" 
                                        type="date" 
                                        value={newPromo.startDate}
                                        onChange={(e) => setNewPromo({...newPromo, startDate: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input 
                                        id="endDate" 
                                        type="date" 
                                        value={newPromo.endDate}
                                        onChange={(e) => setNewPromo({...newPromo, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreatePromo}>Create Promotion</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{promotions.filter(p => p.status === "Active").length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{promotions.reduce((acc, curr) => acc + curr.usage, 0)}</div>
                        <p className="text-xs text-muted-foreground">Across all campaigns</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{promotions.filter(p => p.status === "Scheduled").length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search promotions..." 
                            className="pl-8" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="border rounded-md bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPromotions.map((promo) => (
                            <TableRow key={promo.id}>
                                <TableCell className="font-mono font-bold">
                                    <div className="flex flex-col">
                                        <span>{promo.code}</span>
                                        <span className="text-xs font-normal text-muted-foreground">{promo.description}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-slate-50">
                                        {promo.type === "Percentage" ? `${promo.value}% OFF` : `$${promo.value} OFF`}
                                    </Badge>
                                </TableCell>
                                <TableCell>{promo.usage} uses</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        promo.status === "Active" ? "default" : 
                                        promo.status === "Scheduled" ? "secondary" : 
                                        "destructive"
                                    } className={
                                        promo.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : 
                                        promo.status === "Scheduled" ? "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200" : 
                                        "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200"
                                    }>
                                        {promo.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {promo.startDate} — {promo.endDate}
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
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(promo.id)}
                                            >
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}