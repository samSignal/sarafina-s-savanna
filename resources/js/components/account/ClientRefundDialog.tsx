import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    unit_price_gbp: number;
    line_total_gbp: number;
}

interface Order {
    id: number;
    order_number: string;
    items: OrderItem[];
    currency: string;
}

interface ClientRefundDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ClientRefundDialog({ order, open, onOpenChange, onSuccess }: ClientRefundDialogProps) {
    const { token } = useAuth();
    const [reason, setReason] = useState("");
    const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setReason("");
            setSelectedItems({});
            setNotes("");
            setError(null);
        }
    }, [open]);

    const handleQuantityChange = (itemId: number, qty: number, max: number) => {
        if (qty < 0) return;
        if (qty > max) qty = max;
        
        setSelectedItems(prev => {
            const newState = { ...prev };
            if (qty === 0) {
                delete newState[itemId];
            } else {
                newState[itemId] = qty;
            }
            return newState;
        });
    };

    const toggleItem = (itemId: number, max: number) => {
        setSelectedItems(prev => {
            const newState = { ...prev };
            if (newState[itemId]) {
                delete newState[itemId];
            } else {
                newState[itemId] = max; // Default to max quantity
            }
            return newState;
        });
    };

    const calculateTotal = () => {
        if (!order) return 0;
        let total = 0;
        Object.entries(selectedItems).forEach(([itemId, qty]) => {
            const item = order.items.find(i => i.id === Number(itemId));
            if (item) {
                total += (item.unit_price || 0) * qty;
            }
        });
        return total;
    };

    const handleSubmit = async () => {
        if (!order) return;
        
        const itemsToRefund = Object.entries(selectedItems).map(([itemId, qty]) => {
            const item = order.items.find(i => i.id === Number(itemId));
            return {
                product_id: item?.product_id, // Important: Send product_id not order_item_id if backend expects it
                quantity: qty,
                amount: (item?.unit_price || 0) * qty
            };
        });

        if (itemsToRefund.length === 0) {
            toast.error("Please select at least one item to refund.");
            return;
        }

        if (!reason.trim()) {
            toast.error("Please provide a reason for the refund.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/client/refunds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    order_id: order.id,
                    reason,
                    items: itemsToRefund,
                    notes
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Refund request submitted successfully!");
                onSuccess();
                onOpenChange(false);
            } else {
                setError(data.message || "Failed to submit refund request.");
                toast.error(data.message || "Failed to submit refund request.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while submitting the request.");
            toast.error("An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!order) return null;

    const totalRefund = calculateTotal();
    const currencySymbol = order.currency === 'GBP' ? '£' : order.currency; // Simplified

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Request Refund</DialogTitle>
                    <DialogDescription>
                        Select items from Order #{order.order_number} to refund.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <Label>Select Items</Label>
                        <div className="border rounded-md divide-y">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-3 flex items-center gap-3">
                                    <Checkbox 
                                        checked={!!selectedItems[item.id]}
                                        onCheckedChange={() => toggleItem(item.id, item.quantity)}
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Qty: {item.quantity} • {currencySymbol}{Number(item.unit_price || 0).toFixed(2)} each
                                        </p>
                                    </div>
                                    {selectedItems[item.id] && (
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs whitespace-nowrap">Refund Qty:</Label>
                                            <Input 
                                                type="number" 
                                                min="1" 
                                                max={item.quantity}
                                                className="w-20 h-8"
                                                value={selectedItems[item.id]}
                                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0, item.quantity)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Return</Label>
                        <select 
                            id="reason"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option value="">Select a reason...</option>
                            <option value="Damaged">Damaged / Defective</option>
                            <option value="Wrong Item">Wrong Item Received</option>
                            <option value="Not as Described">Not as Described</option>
                            <option value="Changed Mind">Changed Mind</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea 
                            id="notes" 
                            placeholder="Please provide more details about your request..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end items-center gap-2 pt-2 border-t">
                        <div className="text-right mr-4">
                            <span className="text-sm text-muted-foreground">Estimated Refund:</span>
                            <span className="ml-2 font-bold text-lg">{currencySymbol}{totalRefund.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || Object.keys(selectedItems).length === 0 || !reason}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
