import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, ArrowLeft, ShoppingCart, Star, Gift, Wallet, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  postcode: string | null;
  country: string | null;
}

interface CustomerSummary {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  order_count: number;
  total_spent: number;
  created_at: string;
  addresses: Address[];
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  currency: string;
  created_at: string;
}

interface LoyaltyEntry {
  id: number;
  type: string;
  points: number;
  description: string;
  created_at: string;
}

interface GiftCard {
  id: number;
  code: string;
  balance: number;
  initial_value: number;
  status: string;
  expiry: string | null;
}

interface MessageEntry {
  id: number;
  subject: string;
  status: string;
  channel: string;
  created_at: string;
}

interface StokvelStatus {
  enrolled: boolean;
  schedule: string | null;
  contribution_amount: number | null;
  next_contribution_date: string | null;
}

interface CustomerProfileResponse {
  customer: CustomerSummary;
  orders: Order[];
  loyalty_ledger: LoyaltyEntry[];
  gift_cards: GiftCard[];
  stokvel: StokvelStatus | null;
  messages: MessageEntry[];
}

export default function CustomerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState<CustomerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const currencySymbol = (code: string) => {
    const upper = code?.toUpperCase() || "GBP";
    if (upper === "GBP") return "£";
    if (upper === "USD") return "$";
    if (upper === "EUR") return "€";
    if (upper === "ZAR") return "R";
    if (upper === "NGN") return "₦";
    if (upper === "AUD") return "$";
    if (upper === "CAD") return "$";
    return upper + " ";
  };

  useEffect(() => {
    if (!id) {
      setError("Customer not found.");
      setLoading(false);
      return;
    }

    if (!isAuthenticated || !token) {
      setLoading(false);
      setError("You need to be signed in to view customer profiles.");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/admin/customers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let message = "Unable to load customer profile.";

          try {
            const body = await response.json();
            if (body && typeof body.message === "string") {
              message = body.message;
            }
          } catch {
          }

          setError(message);
          toast.error(message);
          return;
        }

        const profile: CustomerProfileResponse = await response.json();
        setData(profile);
      } catch {
        setError("Something went wrong while loading the profile.");
        toast.error("Something went wrong while loading the profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, token, isAuthenticated]);

  const renderAddress = (address: Address, index: number) => {
    const parts = [
      address.line1,
      address.line2,
      address.city,
      address.postcode,
      address.country,
    ].filter(Boolean);

    if (parts.length === 0) {
      return null;
    }

    return (
      <div key={index} className="flex items-start gap-2 text-sm">
        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
        <div>{parts.join(", ")}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Customers
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/customers")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Customer Profile</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { customer, orders, loyalty_ledger, gift_cards, stokvel, messages } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/customers")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {customer.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Customer since{" "}
              {new Date(customer.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            customer.status === "VIP"
              ? "bg-purple-100 text-purple-800 border-purple-200"
              : customer.status === "Active"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-slate-100 text-slate-800 border-slate-200"
          }
        >
          {customer.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Key metrics and contact details for this customer.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone || "Phone not provided"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Addresses
                </p>
                {customer.addresses.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No shipping addresses captured yet.
                  </p>
                )}
                {customer.addresses.map((address, index) =>
                  renderAddress(address, index)
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Orders
                </p>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    {customer.order_count}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Total Spent
                </p>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">
                    R {customer.total_spent.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Loyalty
                </p>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {loyalty_ledger.length > 0
                      ? `${loyalty_ledger.reduce(
                          (sum, entry) => sum + entry.points,
                          0
                        )} pts`
                      : "No points yet"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Gift Cards
                </p>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {gift_cards.length} active
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stokvel / Savings</CardTitle>
            <CardDescription>
              Contribution schedule and savings status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {stokvel && stokvel.enrolled ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Schedule</span>
                  <span>{stokvel.schedule}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contribution</span>
                  <span>
                    R{" "}
                    {stokvel.contribution_amount
                      ? stokvel.contribution_amount.toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Date</span>
                  <span>
                    {stokvel.next_contribution_date
                      ? new Date(
                          stokvel.next_contribution_date
                        ).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                This customer is not enrolled in a stokvel or savings plan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            Personal information, order history, loyalty, gift cards, savings, and messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty Ledger</TabsTrigger>
              <TabsTrigger value="gift-cards">Gift Cards Owned</TabsTrigger>
              <TabsTrigger value="stokvel">Stokvel / Savings</TabsTrigger>
              <TabsTrigger value="messages">Messages Sent</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Name
                    </p>
                    <p>{customer.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Email
                    </p>
                    <p>{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Phone
                    </p>
                    <p>{customer.phone || "Phone not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Joined
                    </p>
                    <p>{formatDate(customer.created_at)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Addresses
                  </p>
                  {customer.addresses.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No addresses available.
                    </p>
                  )}
                  {customer.addresses.map((address, index) =>
                    renderAddress(address, index)
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No orders found for this customer.
                </p>
              ) : (
                <div className="border rounded-md bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "Completed"
                                  ? "default"
                                  : order.status === "Cancelled"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.payment_status}</TableCell>
                          <TableCell>
                            {currencySymbol(order.currency)}
                            {order.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="loyalty">
              {loyalty_ledger.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No loyalty transactions recorded yet.
                </p>
              ) : (
                <div className="border rounded-md bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loyalty_ledger.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {new Date(entry.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{entry.type}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right">
                            {entry.points > 0 ? "+" : ""}
                            {entry.points}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="gift-cards">
              {gift_cards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No gift cards associated with this customer.
                </p>
              ) : (
                <div className="border rounded-md bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Initial Value</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expiry</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gift_cards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell className="font-mono">
                            {card.code}
                          </TableCell>
                          <TableCell>
                            R {card.initial_value.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            R {card.balance.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                card.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {card.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {card.expiry
                              ? new Date(card.expiry).toLocaleDateString()
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stokvel">
              {stokvel && stokvel.enrolled ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Contribution schedule: {stokvel.schedule || "Not set"}
                    </span>
                  </div>
                  <div>
                    Contribution amount:{" "}
                    {stokvel.contribution_amount
                      ? `R ${stokvel.contribution_amount.toFixed(2)}`
                      : "Not set"}
                  </div>
                  <div>
                    Next contribution:{" "}
                    {stokvel.next_contribution_date
                      ? new Date(
                          stokvel.next_contribution_date
                        ).toLocaleDateString()
                      : "Not set"}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This customer is not enrolled in a stokvel or savings plan.
                </p>
              )}
            </TabsContent>

            <TabsContent value="messages">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No support messages or inquiries found.
                </p>
              ) : (
                <div className="border rounded-md bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            {new Date(message.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span>{message.subject}</span>
                          </TableCell>
                          <TableCell>{message.channel}</TableCell>
                          <TableCell>{message.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
