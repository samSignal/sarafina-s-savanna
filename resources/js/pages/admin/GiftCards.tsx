import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, MoreHorizontal, Gift, Plus, Copy, Mail, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Mock data
const initialGiftCards = [
    { id: 1, code: "GIFT-8921-XMAS", initialValue: 100.00, balance: 45.50, recipient: "john.doe@example.com", status: "Active", expiry: "2025-12-31" },
    { id: 2, code: "GIFT-7723-BDAY", initialValue: 50.00, balance: 50.00, recipient: "sarah.smith@example.com", status: "Active", expiry: "2025-06-15" },
    { id: 3, code: "GIFT-5512-PROMO", initialValue: 25.00, balance: 0.00, recipient: "mike.brown@example.com", status: "Redeemed", expiry: "2024-12-31" },
    { id: 4, code: "GIFT-9901-WELC", initialValue: 10.00, balance: 10.00, recipient: "new.user@example.com", status: "Expired", expiry: "2023-12-31" },
];

export default function GiftCards() {
    const [giftCards, setGiftCards] = useState(initialGiftCards);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    const [newCard, setNewCard] = useState({ value: "", recipient: "", note: "" });

    const handleCreateCard = () => {
        if (!newCard.value) {
            toast.error("Please enter a value");
            return;
        }

        const code = `GIFT-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        const card = {
            id: giftCards.length + 1,
            code: code,
            initialValue: parseFloat(newCard.value),
            balance: parseFloat(newCard.value),
            recipient: newCard.recipient || "N/A",
            status: "Active",
            expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
        };

        setGiftCards([card, ...giftCards]);
        setIsCreateOpen(false);
        setNewCard({ value: "", recipient: "", note: "" });
        toast.success(`Gift card ${code} created successfully`);
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard");
    };

    const handleDeactivate = (id: number) => {
        setGiftCards(giftCards.map(c => c.id === id ? { ...c, status: "Disabled" } : c));
        toast.success("Gift card deactivated");
    };

    const filteredCards = giftCards.filter(card => 
        card.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.recipient.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
                    <p className="text-muted-foreground">Issue and manage digital gift cards.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Issue Gift Card
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Issue New Gift Card</DialogTitle>
                            <DialogDescription>
                                Create a new digital gift card code.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="value">Value (£)</Label>
                                <Input 
                                    id="value" 
                                    type="number" 
                                    placeholder="50.00" 
                                    value={newCard.value}
                                    onChange={(e) => setNewCard({...newCard, value: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="recipient">Recipient Email (Optional)</Label>
                                <Input 
                                    id="recipient" 
                                    placeholder="client@example.com" 
                                    value={newCard.recipient}
                                    onChange={(e) => setNewCard({...newCard, recipient: e.target.value})}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="note">Internal Note (Optional)</Label>
                                <Input 
                                    id="note" 
                                    placeholder="Reason for issuance..." 
                                    value={newCard.note}
                                    onChange={(e) => setNewCard({...newCard, note: e.target.value})}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateCard}>Generate Code</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">£{giftCards.reduce((acc, curr) => acc + curr.initialValue, 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">£{giftCards.reduce((acc, curr) => acc + curr.balance, 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{giftCards.filter(c => c.status === "Active").length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search gift cards..." 
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
                            <TableHead>Recipient</TableHead>
                            <TableHead>Initial Value</TableHead>
                            <TableHead>Current Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCards.map((card) => (
                            <TableRow key={card.id}>
                                <TableCell className="font-mono font-medium">{card.code}</TableCell>
                                <TableCell>{card.recipient}</TableCell>
                                <TableCell>£{card.initialValue.toFixed(2)}</TableCell>
                                <TableCell>£{card.balance.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        card.status === "Active" ? "default" : 
                                        card.status === "Redeemed" ? "secondary" : 
                                        "destructive"
                                    }>
                                        {card.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{card.expiry}</TableCell>
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
                                            <DropdownMenuItem onClick={() => handleCopyCode(card.code)}>
                                                <Copy className="mr-2 h-4 w-4" /> Copy Code
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Mail className="mr-2 h-4 w-4" /> Resend Email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem 
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDeactivate(card.id)}
                                            >
                                                <Ban className="mr-2 h-4 w-4" /> Deactivate
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