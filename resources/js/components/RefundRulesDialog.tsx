import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Settings, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Department {
  id: number;
  name: string;
  allow_refunds: boolean;
  restock_on_refund: boolean;
  refund_window_days: number;
}

export function RefundRulesDialog() {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load department rules");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (dept: Department) => {
    setSaving(dept.id);
    try {
      const response = await fetch(`/api/admin/departments/${dept.id}/refund-rules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          allow_refunds: dept.allow_refunds,
          restock_on_refund: dept.restock_on_refund,
          refund_window_days: dept.refund_window_days,
        }),
      });

      if (!response.ok) throw new Error("Failed to update rules");
      
      toast.success(`Rules updated for ${dept.name}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update rules");
    } finally {
      setSaving(null);
    }
  };

  const updateLocalState = (id: number, field: keyof Department, value: any) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Refund Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Department Refund Rules</DialogTitle>
          <DialogDescription>
            Configure refund eligibility and restocking rules for each department.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-md text-sm space-y-2 my-4">
          <p className="font-semibold">Column Guide:</p>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
            <li><strong>Allow Refunds:</strong> If disabled, customers cannot select items from this department for a refund.</li>
            <li><strong>Restock:</strong> If enabled, refunded quantities are added back to inventory. Disable for perishables.</li>
            <li><strong>Window:</strong> Maximum days after purchase to request a refund.</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
            <em>Example: For <strong>Butchery</strong>, set <strong>Restock</strong> to OFF (spoiled goods) and <strong>Window</strong> to 1 day.</em>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="w-[100px] text-center">Allow Refunds</TableHead>
                <TableHead className="w-[100px] text-center">Restock</TableHead>
                <TableHead className="w-[120px]">Window (Days)</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={dept.allow_refunds}
                      onCheckedChange={(checked) => updateLocalState(dept.id, 'allow_refunds', checked)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch 
                      checked={dept.restock_on_refund}
                      onCheckedChange={(checked) => updateLocalState(dept.id, 'restock_on_refund', checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min={0}
                      value={dept.refund_window_days}
                      onChange={(e) => updateLocalState(dept.id, 'refund_window_days', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      onClick={() => handleUpdate(dept)}
                      disabled={saving === dept.id}
                    >
                      {saving === dept.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
