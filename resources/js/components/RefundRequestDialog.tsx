import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface Order {
  id: number;
  order_number: string;
  currency: string;
  items: OrderItem[];
}

interface RefundRequestDialogProps {
  order: Order;
}

export function RefundRequestDialog({ order }: RefundRequestDialogProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason: string } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({});
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      checkEligibility();
    }
  }, [open]);

  const checkEligibility = async () => {
    setCheckingEligibility(true);
    try {
      const response = await fetch(`/api/client/orders/${order.id}/refund-eligibility`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEligibility(data);
    } catch (error) {
      console.error("Failed to check eligibility", error);
      toast.error("Failed to check refund eligibility");
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleQuantityChange = (itemId: number, productId: number, qty: number, max: number) => {
    if (qty < 0) qty = 0;
    if (qty > max) qty = max;

    setSelectedItems((prev) => {
      const newItems = { ...prev };
      if (qty === 0) {
        delete newItems[productId];
      } else {
        newItems[productId] = qty;
      }
      return newItems;
    });
  };

  const toggleItem = (productId: number, max: number) => {
    setSelectedItems((prev) => {
      const newItems = { ...prev };
      if (newItems[productId]) {
        delete newItems[productId];
      } else {
        newItems[productId] = max; // Default to max quantity
      }
      return newItems;
    });
  };

  const calculateTotalRefund = () => {
    let total = 0;
    order.items.forEach((item) => {
      if (selectedItems[item.product_id]) {
        // Calculate unit price from line total to be safe or use unit_price if reliable
        const unitPrice = Number(item.line_total) / Number(item.quantity);
        total += unitPrice * selectedItems[item.product_id];
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedItems).length === 0) {
      toast.error("Please select at least one item to refund");
      return;
    }
    if (!reason) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = Object.entries(selectedItems).map(([productId, qty]) => {
        const item = order.items.find((i) => i.product_id === Number(productId));
        const unitPrice = Number(item!.line_total) / Number(item!.quantity);
        return {
          product_id: Number(productId),
          quantity: qty,
          amount: unitPrice * qty
        };
      });

      const response = await fetch("/api/client/refunds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: order.id,
          reason,
          notes,
          items: itemsPayload,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Refund request submitted successfully");
        setOpen(false);
        // Reset form
        setSelectedItems({});
        setReason("");
        setNotes("");
      } else {
        toast.error(result.message || "Failed to submit refund request");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Request Refund
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Refund - Order #{order.order_number}</DialogTitle>
          <DialogDescription>
            Select items to refund. Refunds are subject to approval.
          </DialogDescription>
        </DialogHeader>

        {checkingEligibility ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : eligibility && !eligibility.eligible ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            <p className="font-medium">Not Eligible for Refund</p>
            <p className="text-sm">{eligibility.reason}</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Items to Refund</Label>
              <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item.id} className="p-2 flex items-center gap-2">
                    <Checkbox
                      checked={!!selectedItems[item.product_id]}
                      onCheckedChange={() => toggleItem(item.product_id, item.quantity)}
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium truncate">{item.product_name}</div>
                      <div className="text-muted-foreground">
                        Qty: {item.quantity} · {order.currency} {Number(item.unit_price).toFixed(2)}
                      </div>
                    </div>
                    {selectedItems[item.product_id] && (
                      <Input
                        type="number"
                        min="1"
                        max={item.quantity}
                        value={selectedItems[item.product_id]}
                        onChange={(e) =>
                          handleQuantityChange(item.id, item.product_id, parseInt(e.target.value), item.quantity)
                        }
                        className="w-16 h-8 text-right"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(selectedItems).length > 0 && (
              <div className="flex justify-between font-medium">
                <span>Estimated Refund:</span>
                <span>{order.currency} {calculateTotalRefund().toFixed(2)}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Refund</Label>
              <select
                id="reason"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="Damaged Item">Damaged Item</option>
                <option value="Wrong Item Received">Wrong Item Received</option>
                <option value="Item Missing">Item Missing</option>
                <option value="Quality Issue">Quality Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Please provide more details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || (eligibility && !eligibility.eligible) || !reason || Object.keys(selectedItems).length === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
