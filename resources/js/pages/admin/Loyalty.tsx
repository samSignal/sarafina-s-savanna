import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Award, Gift, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Mock data
const initialTiers = [
    { id: 1, name: "Bronze Member", minPoints: 0, multiplier: "1x", benefits: "Standard shipping", status: "Active", members: 1250 },
    { id: 2, name: "Silver Member", minPoints: 1000, multiplier: "1.2x", benefits: "Free shipping on orders > $50", status: "Active", members: 450 },
    { id: 3, name: "Gold Member", minPoints: 5000, multiplier: "1.5x", benefits: "Free priority shipping, Early access", status: "Active", members: 120 },
    { id: 4, name: "Platinum Member", minPoints: 10000, multiplier: "2x", benefits: "All benefits + Dedicated support", status: "Active", members: 25 },
];

const initialRewards = [
    { id: 1, name: "$5 Off Coupon", pointsCost: 500, type: "Discount", status: "Active", redemptions: 342 },
    { id: 2, name: "$10 Off Coupon", pointsCost: 900, type: "Discount", status: "Active", redemptions: 156 },
    { id: 3, name: "Free Product Sample", pointsCost: 300, type: "Item", status: "Active", redemptions: 89 },
];

export default function Loyalty() {
    const [tiers, setTiers] = useState(initialTiers);
    const [rewards, setRewards] = useState(initialRewards);
    const [activeTab, setActiveTab] = useState("tiers"); // tiers | rewards
    const [isAddTierOpen, setIsAddTierOpen] = useState(false);
    
    // Form state for new tier
    const [newTier, setNewTier] = useState({ name: "", minPoints: "", multiplier: "", benefits: "", status: "Active" });

    const handleAddTier = () => {
        if (!newTier.name || !newTier.minPoints) {
            toast.error("Please fill in all required fields");
            return;
        }

        const tier = {
            id: tiers.length + 1,
            name: newTier.name,
            minPoints: parseInt(newTier.minPoints),
            multiplier: newTier.multiplier,
            benefits: newTier.benefits,
            status: newTier.status,
            members: 0
        };

        setTiers([...tiers, tier]);
        setIsAddTierOpen(false);
        setNewTier({ name: "", minPoints: "", multiplier: "", benefits: "", status: "Active" });
        toast.success("Loyalty tier added successfully");
    };

    const handleDeleteTier = (id: number) => {
        setTiers(tiers.filter(t => t.id !== id));
        toast.success("Tier removed successfully");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Loyalty & Rewards</h1>
                    <p className="text-muted-foreground">Manage loyalty tiers, points, and rewards configuration.</p>
                </div>
                <Dialog open={isAddTierOpen} onOpenChange={setIsAddTierOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Add Reward Tier
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Loyalty Tier</DialogTitle>
                            <DialogDescription>
                                Create a new membership level for your customers.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Tier Name</Label>
                                <Input 
                                    id="name" 
                                    placeholder="e.g., Diamond" 
                                    value={newTier.name}
                                    onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="points">Min Points</Label>
                                    <Input 
                                        id="points" 
                                        type="number" 
                                        placeholder="0" 
                                        value={newTier.minPoints}
                                        onChange={(e) => setNewTier({...newTier, minPoints: e.target.value})}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="multiplier">Points Multiplier</Label>
                                    <Input 
                                        id="multiplier" 
                                        placeholder="1.5x" 
                                        value={newTier.multiplier}
                                        onChange={(e) => setNewTier({...newTier, multiplier: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="benefits">Benefits</Label>
                                <Input 
                                    id="benefits" 
                                    placeholder="e.g., Free Shipping" 
                                    value={newTier.benefits}
                                    onChange={(e) => setNewTier({...newTier, benefits: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select 
                                    value={newTier.status} 
                                    onValueChange={(value) => setNewTier({...newTier, status: value})}
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
                            <Button variant="outline" onClick={() => setIsAddTierOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddTier}>Save Tier</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Loyalty Members</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,845</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">845.2K</div>
                        <p className="text-xs text-muted-foreground">+24% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rewards Redeemed</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">587</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Button 
                        variant={activeTab === "tiers" ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setActiveTab("tiers")}
                    >
                        Reward Tiers
                    </Button>
                    <Button 
                        variant={activeTab === "rewards" ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setActiveTab("rewards")}
                    >
                        Redeemable Rewards
                    </Button>
                </div>

                {activeTab === "tiers" && (
                    <div className="border rounded-md bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tier Name</TableHead>
                                    <TableHead>Min. Points</TableHead>
                                    <TableHead>Multiplier</TableHead>
                                    <TableHead>Benefits</TableHead>
                                    <TableHead>Members</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tiers.map((tier) => (
                                    <TableRow key={tier.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Award className={`h-4 w-4 ${tier.id === 1 ? "text-amber-700" : tier.id === 2 ? "text-slate-400" : tier.id === 3 ? "text-yellow-500" : "text-cyan-400"}`} />
                                                {tier.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{tier.minPoints.toLocaleString()}</TableCell>
                                        <TableCell>{tier.multiplier}</TableCell>
                                        <TableCell className="max-w-xs truncate" title={tier.benefits}>{tier.benefits}</TableCell>
                                        <TableCell>{tier.members}</TableCell>
                                        <TableCell>
                                            <Badge variant={tier.status === "Active" ? "default" : "secondary"}>
                                                {tier.status}
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
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteTier(tier.id)}
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
                )}

                {activeTab === "rewards" && (
                     <div className="border rounded-md bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reward Name</TableHead>
                                    <TableHead>Points Cost</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Redemptions</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rewards.map((reward) => (
                                    <TableRow key={reward.id}>
                                        <TableCell className="font-medium">{reward.name}</TableCell>
                                        <TableCell>{reward.pointsCost}</TableCell>
                                        <TableCell>{reward.type}</TableCell>
                                        <TableCell>{reward.redemptions}</TableCell>
                                        <TableCell>
                                            <Badge variant={reward.status === "Active" ? "default" : "secondary"}>
                                                {reward.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}