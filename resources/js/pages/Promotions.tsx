import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { Clock, Tag, ShoppingBag } from "lucide-react";
import { SEO } from "@/components/SEO";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    price_uk_eu?: number;
    price_international?: number;
    image: string;
    status: string;
    is_on_promotion: boolean;
    promotion_price: number;
}

interface Promotion {
    id: number;
    name: string;
    description: string;
    type: 'product' | 'holiday' | 'flash';
    discount_percentage: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    products: Product[];
    banner_image?: string;
}

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!timeLeft) return <Badge variant="secondary">Expired</Badge>;

    return (
        <div className="flex gap-2 text-sm font-mono bg-black/5 p-2 rounded">
            <span className="font-bold text-primary">{timeLeft.days}d</span>
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
        </div>
    );
};

export default function Promotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { format: formatPrice, selected } = useCurrency();

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await fetch('/api/public/promotions');
                if (response.ok) {
                    const data = await response.json();
                    setPromotions(data);
                }
            } catch (error) {
                console.error("Failed to fetch promotions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const handleAddToCart = (product: Product) => {
        const price = product.is_on_promotion && product.promotion_price
            ? Number(product.promotion_price)
            : Number(product.price_uk_eu ?? product.price);
        addItem({ id: product.id, name: product.name, price, image: product.image });
        toast.success(`Added ${product.name} to cart`);
    };

    const getDisplayPrice = (product: Product) => {
        const isPromo = product.is_on_promotion && product.promotion_price;
        const price = isPromo ? product.promotion_price : (product.price_uk_eu ?? product.price);
        
        // If promo, show both
        if (isPromo) {
             const original = product.price_uk_eu ?? product.price;
             return (
                 <div className="flex flex-col">
                     <span className="line-through text-muted-foreground text-sm">
                         {formatPrice(Number(original))}
                     </span>
                     <span className="font-bold text-red-600">
                         {formatPrice(Number(price))}
                     </span>
                 </div>
             );
        }
        return <span className="font-bold">{formatPrice(Number(price))}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto py-8 px-4">
                    <Skeleton className="h-12 w-48 mb-8" />
                    <div className="space-y-8">
                        {[1, 2].map(i => (
                            <Skeleton key={i} className="h-64 w-full rounded-xl" />
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <SEO 
                title="Promotions & Deals" 
                description="Check out our latest promotions and special offers on authentic African products. Save more on your favourite items!"
                keywords="African food deals, promotions, Sarafina discounts, special offers"
            />
            <Header />
            <main className="flex-1 container mx-auto py-8 px-4">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Current Promotions</h1>
                    <p className="text-gray-600">Don't miss out on our latest deals and special offers!</p>
                </div>

                {promotions.length === 0 ? (
                    <div className="text-center py-16">
                        <Tag className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900">No Active Promotions</h2>
                        <p className="text-gray-500 mt-2">Check back soon for new offers!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {promotions.map((promo) => (
                            <div key={promo.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                                <div className="p-6 md:p-8 border-b bg-gradient-to-r from-orange-50 to-orange-100/50">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Badge variant={promo.type === 'flash' ? 'destructive' : 'secondary'} className="uppercase">
                                                    {promo.type} Sale
                                                </Badge>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    {Number(promo.discount_percentage)}% OFF
                                                </Badge>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">{promo.name}</h2>
                                            {promo.description && (
                                                <p className="text-gray-600 mt-1 max-w-2xl">{promo.description}</p>
                                            )}
                                        </div>
                                        {promo.end_date && (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Ends in
                                                </span>
                                                <CountdownTimer targetDate={promo.end_date} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {promo.products && promo.products.length > 0 ? (
                                            promo.products.map((product) => (
                                                <Card key={product.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                                    <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-t-lg">
                                                        <img 
                                                            src={product.image} 
                                                            alt={product.name}
                                                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                                        />
                                                        {product.status !== 'In Stock' && (
                                                            <div className="absolute top-2 right-2">
                                                                <Badge variant="destructive">{product.status}</Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <CardContent className="flex-1 p-4">
                                                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-2" title={product.name}>
                                                            {product.name}
                                                        </h3>
                                                        <div className="mt-auto">
                                                            {getDisplayPrice(product)}
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="p-4 pt-0">
                                                        <Button 
                                                            className="w-full" 
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={product.status === 'Out of Stock'}
                                                        >
                                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                                            Add to Cart
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="col-span-full text-center py-8 text-gray-500 italic">
                                                No products linked to this promotion.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
