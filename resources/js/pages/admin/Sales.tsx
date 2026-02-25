import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PoundSterling, ShoppingCart, TrendingUp, Calendar as CalendarIcon, Package } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays, startOfMonth, endOfMonth, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ChartData {
  name: string;
  total: number;
}

interface RecentSale {
  id: number;
  user: {
      name: string;
      email: string;
  } | null;
  total: number;
  currency: string;
  total_gbp: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface TopProduct {
    product_id: number;
    product_name: string;
    total_quantity: number;
    total_revenue: number;
}

interface SalesStats {
  total_revenue: number;
  orders_count: number;
  average_order_value: number;
  revenue_growth: number;
}

export default function Sales() {
  const [stats, setStats] = useState<SalesStats>({
    total_revenue: 0,
    orders_count: 0,
    average_order_value: 0,
    revenue_growth: 0,
  });
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [loading, setLoading] = useState(true);

  const fetchSalesData = async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', format(startDate, 'yyyy-MM-dd'));
      if (endDate) params.append('end_date', format(endDate, 'yyyy-MM-dd'));
      
      const queryString = params.toString();

      const [statsRes, chartRes, recentRes, topRes] = await Promise.all([
          fetch(`/api/admin/sales/stats?${queryString}`),
          fetch(`/api/admin/sales/chart?${queryString}`),
          fetch(`/api/admin/sales/recent?${queryString}`), // Recent sales might not need date filter for pagination, but maybe for context? Let's keep consistent.
          fetch(`/api/admin/sales/top-products?${queryString}`)
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (chartRes.ok) setChartData(await chartRes.json());
      if (recentRes.ok) {
          const data = await recentRes.json();
          setRecentSales(data.data); // Pagination wrapper
      }
      if (topRes.ok) setTopProducts(await topRes.json());

    } catch (err) {
      console.error("Failed to fetch sales data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date?.from) {
      fetchSalesData(date.from, date.to);
    }
  }, [date]);

  const handleQuickFilterChange = (value: string) => {
    const today = new Date();
    switch (value) {
      case "7d":
        setDate({ from: subDays(today, 7), to: today });
        break;
      case "30d":
        setDate({ from: subDays(today, 30), to: today });
        break;
      case "this_month":
        setDate({ from: startOfMonth(today), to: today });
        break;
      case "last_month":
        const lastMonth = subDays(startOfMonth(today), 1);
        setDate({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      case "this_year":
        setDate({ from: startOfYear(today), to: today });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Sales Management</h2>
            <p className="text-muted-foreground">Comprehensive view of your store's performance.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Select onValueChange={handleQuickFilterChange} defaultValue="30d">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
            </Select>

            <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `£${stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">
                {stats.revenue_growth > 0 ? '+' : ''}{stats.revenue_growth}% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Count</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.orders_count}</div>
            <p className="text-xs text-muted-foreground">
              Total orders in period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {loading ? "..." : `£${stats.average_order_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>
              Sales performance over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `£${value}`}
              />
               <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`£${value.toFixed(2)}`, 'Revenue']}
               />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest orders and their payment status.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {recentSales.map((sale) => (
                          <TableRow key={sale.id}>
                              <TableCell>
                                  <div className="font-medium">{sale.user?.name || 'Guest'}</div>
                                  <div className="text-xs text-muted-foreground hidden md:block">{sale.user?.email || 'N/A'}</div>
                              </TableCell>
                              <TableCell>
                                  <Badge variant={sale.payment_status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                                      {sale.payment_status}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                  {format(new Date(sale.created_at), 'MMM dd, yyyy')}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                  {!sale.currency || sale.currency === 'GBP' ? (
                                      `£${Number(sale.total).toFixed(2)}`
                                  ) : (
                                      <div className="flex flex-col items-end">
                                          <span>£{Number(sale.total_gbp || sale.total).toFixed(2)}</span>
                                          <span className="text-xs text-muted-foreground">
                                              {sale.currency} {Number(sale.total).toFixed(2)}
                                          </span>
                                      </div>
                                  )}
                              </TableCell>
                          </TableRow>
                      ))}
                      {!loading && recentSales.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={4} className="h-24 text-center">
                                  No sales found.
                              </TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Best performers by revenue.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {topProducts.map((product) => (
                          <TableRow key={product.product_id}>
                              <TableCell className="font-medium truncate max-w-[150px]" title={product.product_name}>
                                  {product.product_name}
                              </TableCell>
                              <TableCell className="text-right">
                                  {product.total_quantity}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                  £{Number(product.total_revenue).toFixed(2)}
                              </TableCell>
                          </TableRow>
                      ))}
                      {!loading && topProducts.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={3} className="h-24 text-center">
                                  No products found.
                              </TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
