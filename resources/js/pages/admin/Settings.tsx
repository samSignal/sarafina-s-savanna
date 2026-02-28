import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { toast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    store_name: "",
    support_email: "",
    support_phone_uk: "",
    support_phone_zim: "",
    address_uk: "",
    address_zim: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/general/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: "Error",
        description: "You are not logged in. Please login and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/general/settings', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Settings updated",
          description: "Store information has been updated successfully.",
        });
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Manage your store details, contact information, and social media links.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="store_name">Store Name</Label>
                <Input id="store_name" value={settings.store_name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_email">Support Email</Label>
                <Input id="support_email" type="email" value={settings.support_email} onChange={handleChange} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="support_phone_uk">Support Phone (UK)</Label>
                <Input id="support_phone_uk" value={settings.support_phone_uk} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support_phone_zim">Support Phone (Zimbabwe)</Label>
                <Input id="support_phone_zim" value={settings.support_phone_zim} onChange={handleChange} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address_uk">Address (UK)</Label>
                <Textarea id="address_uk" value={settings.address_uk} onChange={handleChange} className="min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_zim">Address (Zimbabwe)</Label>
                <Textarea id="address_zim" value={settings.address_zim} onChange={handleChange} className="min-h-[100px]" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Social Media Links</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input id="facebook_url" value={settings.facebook_url} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input id="instagram_url" value={settings.instagram_url} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok_url">TikTok URL</Label>
                  <Input id="tiktok_url" value={settings.tiktok_url} onChange={handleChange} />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
