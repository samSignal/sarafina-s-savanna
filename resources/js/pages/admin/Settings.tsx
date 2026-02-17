import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Manage your store details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" defaultValue="Sarafina Market" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store-email">Contact Email</Label>
            <Input id="store-email" type="email" defaultValue="admin@sarafina.africa" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
