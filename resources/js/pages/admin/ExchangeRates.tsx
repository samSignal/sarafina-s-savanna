import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  History,
  DollarSign,
  Euro,
  Info,
  ArrowsUpFromLine,
  ArrowLeftRight
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface RateData {
  code: string;
  rate: number;
  symbol: string;
  name: string;
}

const currencyInfo: Record<string, { name: string; symbol: string }> = {
  GBP: { name: "British Pound Sterling", symbol: "£" },
  USD: { name: "United States Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  ZAR: { name: "South African Rand", symbol: "R" },
  NGN: { name: "Nigerian Naira", symbol: "₦" },
  AUD: { name: "Australian Dollar", symbol: "$" },
  CAD: { name: "Canadian Dollar", symbol: "$" },
  JPY: { name: "Japanese Yen", symbol: "¥" },
  CNY: { name: "Chinese Yuan", symbol: "¥" },
  INR: { name: "Indian Rupee", symbol: "₹" },
  AED: { name: "United Arab Emirates Dirham", symbol: "د.إ" },
};

const ExchangeRates = () => {
  const { token } = useAuth();
  const [rates, setRates] = useState<RateData[]>([]);
  const [baseCurrency, setBaseCurrency] = useState("GBP");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [nextUpdate, setNextUpdate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Converter state
  const [convertAmount, setConvertAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState("GBP");
  const [toCurrency, setToCurrency] = useState("USD");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const fetchRates = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/currencies', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) throw new Error("Failed to fetch rates");
      
      const data = await response.json();
      
      const processedRates: RateData[] = data.all_rates.map((item: any) => ({
        code: item.code,
        rate: item.rate,
        name: currencyInfo[item.code]?.name || item.code,
        symbol: currencyInfo[item.code]?.symbol || "",
      }));

      // Sort: GBP first, then others by code
      processedRates.sort((a, b) => {
        if (a.code === baseCurrency) return -1;
        if (b.code === baseCurrency) return 1;
        return a.code.localeCompare(b.code);
      });

      setRates(processedRates);
      setLastUpdate(new Date(data.last_update).toLocaleString());
      setNextUpdate(new Date(data.next_update).toLocaleString());
      setBaseCurrency(data.base || "GBP");
    } catch (error) {
      console.error("Error fetching rates:", error);
      toast.error("Failed to update exchange rates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRates();
    }
  }, [token]);

  useEffect(() => {
    if (rates.length > 0) {
      handleConvert();
    }
  }, [convertAmount, fromCurrency, toCurrency, rates]);

  const handleConvert = () => {
    const amount = parseFloat(convertAmount);
    if (isNaN(amount) || amount <= 0) {
      setConvertedAmount(null);
      return;
    }

    const fromRate = rates.find(r => r.code === fromCurrency)?.rate || 1;
    const toRate = rates.find(r => r.code === toCurrency)?.rate || 1;

    // Logic: Convert fromCurrency to base (GBP) then to toCurrency
    // Since rates are 1 GBP = X fromCurrency, then 1 fromCurrency = 1/fromRate GBP
    const amountInBase = amount / fromRate;
    const result = amountInBase * toRate;
    setConvertedAmount(result);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const filteredRates = rates.filter(rate => 
    rate.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    rate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Exchange Rates</h2>
          <p className="text-muted-foreground">
            Real-time official rates from ExchangeRate-API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRates} 
            disabled={refreshing}
            className="h-9"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Currency Converter Section */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Quick Currency Converter
          </CardTitle>
          <CardDescription>
            Convert any amount between supported currencies using current market rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={convertAmount} 
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="pl-8 text-lg font-semibold h-12"
                  placeholder="0.00"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
                  {currencyInfo[fromCurrency]?.symbol || ""}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From</label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="h-12 w-full md:w-[140px] font-semibold">
                  <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                  {rates.map(rate => (
                    <SelectItem key={rate.code} value={rate.code}>
                      <span className="font-mono mr-2">{rate.code}</span>
                      <span className="text-muted-foreground text-xs">{rate.symbol}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center pb-2">
              <Button variant="ghost" size="icon" onClick={swapCurrencies} className="rounded-full h-10 w-10 hover:bg-primary/10">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To</label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="h-12 w-full md:w-[140px] font-semibold">
                  <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                  {rates.map(rate => (
                    <SelectItem key={rate.code} value={rate.code}>
                      <span className="font-mono mr-2">{rate.code}</span>
                      <span className="text-muted-foreground text-xs">{rate.symbol}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white rounded-lg border p-3 h-12 flex items-center justify-between shadow-inner">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">Result</span>
                <div className="text-xl font-bold text-primary flex items-center gap-1">
                  <span className="font-mono text-sm opacity-70">{currencyInfo[toCurrency]?.symbol}</span>
                  {convertedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] bg-slate-50">
                {toCurrency}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 text-[11px] text-center text-muted-foreground italic">
            1 {fromCurrency} = {( (rates.find(r => r.code === toCurrency)?.rate || 1) / (rates.find(r => r.code === fromCurrency)?.rate || 1) ).toFixed(4)} {toCurrency}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base Currency</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{baseCurrency}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currencyInfo[baseCurrency]?.name}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{lastUpdate || "---"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Official UTC Time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supported Pairs</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rates.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active currency pairs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Refresh</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{nextUpdate || "---"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled API update
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Market Rates</CardTitle>
              <CardDescription>
                Live conversion rates against 1 {baseCurrency}.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search currency or code..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[100px]">Code</TableHead>
                  <TableHead>Currency Name</TableHead>
                  <TableHead className="text-right">Rate (1 {baseCurrency})</TableHead>
                  <TableHead className="text-right">Example (£100)</TableHead>
                  <TableHead className="text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No currencies found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRates.map((rate) => (
                    <TableRow key={rate.code} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-slate-50">
                          {rate.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {rate.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {rate.symbol}{rate.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-600">
                        {rate.symbol}{(rate.rate * 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {rate.code === baseCurrency ? (
                          <Badge variant="secondary">Base</Badge>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-xs text-slate-400">
                             <TrendingUp className="h-3 w-3" />
                             Live
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <p>
              These rates are mid-market rates used for informational purposes. Sarafina uses these official rates to calculate prices and ensure consistency between GBP and international currencies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRates;
