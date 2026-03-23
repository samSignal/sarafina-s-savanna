import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Banner {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    image_path: string;
    link_url: string;
    cta_text: string;
    position: number;
    is_active: boolean;
}

export default function Banners() {
    const { token } = useAuth();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        link_url: "",
        cta_text: "Shop Now",
        position: "0",
        is_active: true,
    });

    const fetchBanners = async () => {
        try {
            const response = await fetch('/api/admin/banners', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setBanners(data);
            } else {
                console.error('Failed to fetch banners:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to fetch banners', error);
            toast.error("Failed to fetch banners");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchBanners();
        }
    }, [token]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, is_active: checked }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                e.target.value = "";
                setImageFile(null);
                return;
            }
            setImageFile(file);
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            subtitle: "",
            description: "",
            link_url: "",
            cta_text: "Shop Now",
            position: "0",
            is_active: true,
        });
        setImageFile(null);
        setCurrentBanner(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!imageFile && !currentBanner) {
            toast.error("Please select an image");
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('subtitle', formData.subtitle);
        data.append('description', formData.description);
        data.append('link_url', formData.link_url);
        data.append('cta_text', formData.cta_text);
        data.append('position', formData.position || "0");
        data.append('is_active', formData.is_active ? '1' : '0');
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const url = currentBanner 
                ? `/api/admin/banners/${currentBanner.id}?_method=PUT` // Laravel method spoofing for PUT with FormData
                : '/api/admin/banners';
            
            const response = await fetch(url, {
                method: 'POST', // Always POST for FormData with files
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: data,
            });

            if (response.ok) {
                toast.success(currentBanner ? "Banner updated" : "Banner created");
                fetchBanners();
                setIsCreateOpen(false);
                setIsEditOpen(false);
                resetForm();
            } else {
                try {
                    const error = await response.json();
                    console.error('Server error:', error);
                    toast.error(error.message || "Failed to save banner");
                } catch (e) {
                    console.error('Non-JSON error response:', response.status, response.statusText);
                    toast.error(`Failed to save banner: ${response.status} ${response.statusText}`);
                }
            }
        } catch (error) {
            console.error('Error saving banner', error);
            toast.error("An error occurred while connecting to the server");
        }
    };

    const handleEdit = (banner: Banner) => {
        setCurrentBanner(banner);
        setFormData({
            title: banner.title || "",
            subtitle: banner.subtitle || "",
            description: banner.description || "",
            link_url: banner.link_url || "",
            cta_text: banner.cta_text || "",
            position: banner.position.toString(),
            is_active: Boolean(banner.is_active),
        });
        setImageFile(null);
        setIsEditOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;

        try {
            const response = await fetch(`/api/admin/banners/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Banner deleted");
                fetchBanners();
            } else {
                toast.error("Failed to delete banner");
            }
        } catch (error) {
            console.error('Error deleting banner', error);
            toast.error("An error occurred");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" /> Add Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Banner</DialogTitle>
                            <DialogDescription>
                                Create a new banner for the homepage slider.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Main Heading" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subtitle">Subtitle</Label>
                                    <Input id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="Small top text" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Banner text content" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cta_text">Button Text</Label>
                                    <Input id="cta_text" name="cta_text" value={formData.cta_text} onChange={handleInputChange} placeholder="Shop Now" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link_url">Link URL</Label>
                                    <Input id="link_url" name="link_url" value={formData.link_url} onChange={handleInputChange} placeholder="/shop/category" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position (Order)</Label>
                                    <Input id="position" name="position" type="number" value={formData.position} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end pb-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
                                        <Label htmlFor="is_active">Active</Label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Banner Image</Label>
                                <Input id="image" type="file" accept="image/*" onChange={handleFileChange} />
                                <p className="text-xs text-muted-foreground">Recommended size: 1920x600px</p>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Banner</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Banner List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Subtitle</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No banners found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    banners.map((banner) => (
                                        <TableRow key={banner.id}>
                                            <TableCell>
                                                <div className="relative h-12 w-20 overflow-hidden rounded bg-muted">
                                                    <img 
                                                        src={banner.image_path} 
                                                        alt={banner.title} 
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{banner.title || '-'}</TableCell>
                                            <TableCell>{banner.subtitle || '-'}</TableCell>
                                            <TableCell>{banner.position}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {banner.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(banner.id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Banner</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input id="edit-title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Main Heading" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-subtitle">Subtitle</Label>
                                <Input id="edit-subtitle" name="subtitle" value={formData.subtitle} onChange={handleInputChange} placeholder="Small top text" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea id="edit-description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Banner text content" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-cta_text">Button Text</Label>
                                <Input id="edit-cta_text" name="cta_text" value={formData.cta_text} onChange={handleInputChange} placeholder="Shop Now" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-link_url">Link URL</Label>
                                <Input id="edit-link_url" name="link_url" value={formData.link_url} onChange={handleInputChange} placeholder="/shop/category" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-position">Position (Order)</Label>
                                <Input id="edit-position" name="position" type="number" value={formData.position} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2 flex flex-col justify-end pb-2">
                                <div className="flex items-center space-x-2">
                                    <Switch id="edit-is_active" checked={formData.is_active} onCheckedChange={handleSwitchChange} />
                                    <Label htmlFor="edit-is_active">Active</Label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-image">Banner Image (Leave empty to keep current)</Label>
                            <Input id="edit-image" type="file" accept="image/*" onChange={handleFileChange} />
                            {currentBanner && (
                                <div className="mt-2 relative h-20 w-32 overflow-hidden rounded bg-muted">
                                    <img 
                                        src={currentBanner.image_path} 
                                        alt="Current" 
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Banner</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}