import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, ShoppingCart, Wallet, Star, Gift, MessageCircle } from "lucide-react";

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

interface ClientProfileResponse {
  customer: CustomerSummary;
  orders: Order[];
  loyalty_ledger: LoyaltyEntry[];
  gift_cards: GiftCard[];
  stokvel: StokvelStatus | null;
  messages: MessageEntry[];
}

const Account = () => {
  const { token, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ClientProfileResponse | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/client/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError("Unable to load your account information.");
          return;
        }

        const profile: ClientProfileResponse = await response.json();
        setData(profile);
      } catch {
        setError("Something went wrong while loading your account.");
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [loading, isAuthenticated, token, navigate]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold">My Account</h1>
          <p className="text-muted-foreground">
            View your personal information, orders, rewards, and messages.
          </p>
        </div>

        {fetching ? (
          <div className="space-y-6">
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
        ) : error || !data ? (
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")}>Back to home</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>{data.customer.name}</CardTitle>
                  <CardDescription>
                    Customer since{" "}
                    {new Date(data.customer.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{data.customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{data.customer.phone || "Phone not provided"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Addresses
                      </p>
                      {data.customer.addresses.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No shipping addresses captured yet.
                        </p>
                      )}
                      {data.customer.addresses.map((address, index) =>
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
                          {data.customer.order_count}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Total spent
                      </p>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-semibold">
                          £{data.customer.total_spent.toFixed(2)}
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
                          {data.loyalty_ledger.length > 0
                            ? `${data.loyalty_ledger.reduce(
                                (sum, entry) => sum + entry.points,
                                0
                              )} pts`
                            : "No points yet"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Gift cards
                      </p>
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {data.gift_cards.length} active
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Your customer status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge
                    variant="outline"
                    className={
                      data.customer.status === "VIP"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : data.customer.status === "Active"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-slate-100 text-slate-800 border-slate-200"
                    }
                  >
                    {data.customer.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Status is based on your total number of orders.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  Personal info, order history, rewards, savings, and messages.
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
                          <p>{data.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            Email
                          </p>
                          <p>{data.customer.email}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            Phone
                          </p>
                          <p>{data.customer.phone || "Phone not provided"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">
                            Joined
                          </p>
                          <p>{formatDate(data.customer.created_at)}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Addresses
                        </p>
                        {data.customer.addresses.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No addresses available.
                          </p>
                        )}
                        {data.customer.addresses.map((address, index) =>
                          renderAddress(address, index)
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="orders">
                    {data.orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You do not have any orders yet.
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
                            {data.orders.map((order) => (
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
                    {data.loyalty_ledger.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You do not have any loyalty transactions yet.
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
                            {data.loyalty_ledger.map((entry) => (
                              <TableRow key={entry.id}>
                                <TableCell>{formatDate(entry.created_at)}</TableCell>
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
                    {data.gift_cards.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You do not have any gift cards linked to your account yet.
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
                            {data.gift_cards.map((card) => (
                              <TableRow key={card.id}>
                                <TableCell className="font-mono">
                                  {card.code}
                                </TableCell>
                                <TableCell>
                                  R {card.initial_value.toFixed(2)}
                                </TableCell>
                                <TableCell>R {card.balance.toFixed(2)}</TableCell>
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
                    {data.stokvel && data.stokvel.enrolled ? (
                      <div className="space-y-2 text-sm">
                        <div>
                          Contribution schedule: {data.stokvel.schedule || "Not set"}
                        </div>
                        <div>
                          Contribution amount:{" "}
                          {data.stokvel.contribution_amount
                            ? `£${data.stokvel.contribution_amount.toFixed(2)}`
                            : "Not set"}
                        </div>
                        <div>
                          Next contribution:{" "}
                          {data.stokvel.next_contribution_date
                            ? new Date(
                                data.stokvel.next_contribution_date
                              ).toLocaleDateString()
                            : "Not set"}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        You are not enrolled in a stokvel or savings plan yet.
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="messages">
                    {data.messages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        You have not sent any support messages yet.
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
                            {data.messages.map((message) => (
                              <TableRow key={message.id}>
                                <TableCell>
                                  {formatDate(message.created_at)}
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Account;
