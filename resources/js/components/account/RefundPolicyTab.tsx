import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Department {
  id: number;
  name: string;
  allow_refunds: boolean;
  refund_window_days: number;
  restock_on_refund: boolean;
}

export function RefundPolicyTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/public/departments");
      if (!response.ok) throw new Error("Failed to fetch refund policies");
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load refund policies at this time.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refund Policy</CardTitle>
          <CardDescription>
            Our refund policies vary by department to ensure product quality and safety. 
            Please review the specific rules below for your purchased items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4 text-blue-800" />
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              These policies are subject to change. The rules applicable to your refund will be based on the policy active at the time of your request.
            </AlertDescription>
          </Alert>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Department</TableHead>
                  <TableHead className="text-center">Refundable?</TableHead>
                  <TableHead className="text-center">Return Window</TableHead>
                  <TableHead className="text-right">Policy Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-center">
                      {dept.allow_refunds ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="destructive">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {dept.allow_refunds ? (
                        <span className="font-medium">{dept.refund_window_days} Days</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {!dept.allow_refunds ? (
                        "Non-refundable item"
                      ) : (
                        <>
                          Valid for {dept.refund_window_days} days from purchase.
                          {!dept.restock_on_refund && (
                            <span className="block text-xs text-orange-600 mt-1">
                              * Perishable / No Restock
                            </span>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General Refund Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>• Refunds must be requested within the specified window for each department.</p>
            <p>• Items must be unused and in original packaging (unless perishable/defective).</p>
            <p>• Refunds are processed to your original payment method or as store credit.</p>
            <p>• Loyalty points earned on refunded items will be deducted from your balance.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">How to Request a Refund</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>1. Go to your <strong>Order History</strong> tab.</p>
            <p>2. Select the order containing the item you wish to return.</p>
            <p>3. Click the <strong>Request Refund</strong> button (if eligible).</p>
            <p>4. Select items and provide a reason for the return.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
