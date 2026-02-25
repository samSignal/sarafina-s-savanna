import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PoundSterling, Package, ShoppingCart, TrendingUp, Users, Calendar as CalendarIcon } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
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

interface ChartData {
  name: string;
  total: number;
}

interface RecentSale {
  id: number;
  name: string;
  email: string;
  amount: number;
  initials: string;
}

interface AnalyticsStats {
  total_revenue: number;
  orders_count: number;
  orders_growth: number;
  products_count: number;
  active_now: number;
  chart_data: ChartData[];
  recent_sales: RecentSale[];
  period?: {
    start: string;
    end: string;
    diff_days: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<AnalyticsStats>({
    total_revenue: 0,
    orders_count: 0,
    orders_growth: 0,
    products_count: 0,
    active_now: 0,
    chart_data: [],
    recent_sales: []
  });

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (startDate?: Date, endDate?: Date) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', format(startDate, 'yyyy-MM-dd'));
      if (endDate) params.append('end_date', format(endDate, 'yyyy-MM-dd'));
      
      const response = await fetch(`/api/admin/analytics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date?.from) {
      fetchAnalytics(date.from, date.to);
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
        setDate({ from: startOfMonth(today), to: today }); // To today or endOfMonth? usually today for "so far"
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `£${stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `+${stats.orders_count}`}</div>
            <p className="text-xs text-muted-foreground">
              {stats.orders_growth >= 0 ? '+' : ''}{stats.orders_growth}% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `+${stats.products_count}`}</div>
            <p className="text-xs text-muted-foreground">Total Products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `+${stats.active_now}`}</div>
            <p className="text-xs text-muted-foreground">Active in last 24h</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.chart_data}>
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
                 />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `Latest transactions from the store.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.recent_sales.map((sale) => (
                <div key={sale.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {sale.initials}
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{sale.name}</p>
                        <p className="text-xs text-muted-foreground">{sale.email}</p>
                    </div>
                    <div className="ml-auto font-medium">+£{sale.amount.toFixed(2)}</div>
                </div>
              ))}
              {!loading && stats.recent_sales.length === 0 && (
                 <div className="text-center text-muted-foreground">No recent sales found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
