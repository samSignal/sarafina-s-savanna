import { useState, useEffect } from "react";
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { currencies, selected, setCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [navItems, setNavItems] = useState([
    { label: "Home", href: "/", isPrimaryNav: true },
    { label: "Shop All", href: "/shop", highlight: true, isPrimaryNav: true },
    { label: "Promotions", href: "/promotions", highlight: true, isPrimaryNav: true },
    { label: "Gift Cards", href: "/gift-cards", highlight: true, isPrimaryNav: true },
  ]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        let departments: any[] = [];
        let categories: any[] = [];

        const [deptResponse, categoryResponse] = await Promise.all([
          fetch("/api/public/departments"),
          fetch("/api/public/categories"),
        ]);

        if (deptResponse.ok) {
          departments = await deptResponse.json();
        } 
        
        if (categoryResponse.ok) {
          categories = await categoryResponse.json();
        }

        if (!departments || departments.length === 0) {
          const [fallbackDeptRes, fallbackCatRes] = await Promise.all([
            fetch("/api/departments"),
            fetch("/api/categories"),
          ]);
          if (fallbackDeptRes.ok) {
            const allDepts = await fallbackDeptRes.json();
            departments = Array.isArray(allDepts) ? allDepts.filter((d: any) => (d.status || '').toLowerCase() === 'active') : [];
          }
          if (fallbackCatRes.ok) {
            const allCats = await fallbackCatRes.json();
            categories = Array.isArray(allCats) ? allCats.filter((c: any) => (c.status || '').toLowerCase() === 'active') : [];
          }
        }

        if (!departments || departments.length === 0) return;

        const activeDepartments = departments.filter((d: any) => (d.status || "").toLowerCase() === "active");

        const deptItems = activeDepartments.map((dept: any) => {
          const deptCategories = categories.filter((cat: any) => cat.department_id === dept.id);
          return {
            label: dept.name,
            href: `/category/${dept.id}`,
            dropdown: deptCategories.map((cat: any) => ({
              label: cat.name,
              href: `/category/${dept.id}?category=${cat.id}`,
            })),
            highlight: dept.name === "Clearance",
            isDeptItem: true,
          };
        });

        const PRIMARY_COUNT = 7;
        const primaryDept = deptItems.slice(0, PRIMARY_COUNT);
        const overflowDept = deptItems.slice(PRIMARY_COUNT);

        setNavItems([
          { label: "Home", href: "/", isPrimaryNav: true },
          { label: "Shop All", href: "/shop", highlight: true, isPrimaryNav: true },
          { label: "Promotions", href: "/promotions", highlight: true, isPrimaryNav: true },
          { label: "Gift Cards", href: "/gift-cards", highlight: true, isPrimaryNav: true },
          ...primaryDept,
          ...(overflowDept.length > 0
            ? [
                {
                  label: "More",
                  href: "#",
                  dropdown: overflowDept.map((d) => ({ label: d.label, href: d.href })),
                  isMore: true,
                } as any,
              ]
            : []),
        ]);
      } catch (error) {
        setNavItems([
          { label: "Home", href: "/", isPrimaryNav: true },
          { label: "Shop All", href: "/shop", highlight: true, isPrimaryNav: true },
          { label: "Promotions", href: "/promotions", highlight: true, isPrimaryNav: true },
          { label: "Gift Cards", href: "/gift-cards", highlight: true, isPrimaryNav: true },
        ]);
      }

    };

    fetchDepartments();
  }, []);

  const handleLogout = async () => {
    if (isAuthenticated) {
      await logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background shadow-soft">
      {/* Top bar */}
      <div className="bg-brand-gradient text-primary-foreground py-2">
        <div className="container text-center text-xs md:text-sm font-medium tracking-wide">
          Connecting the Global Diaspora to Home • Premium Grocery Delivery in Zimbabwe
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4 px-2 md:px-4">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-accent-gradient flex items-center justify-center shadow-medium">
              <img
                src="/images/department%20logo/sarafina%20logo.jpeg"
                alt="Sarafina logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-primary">
              Sarafina
            </span>
          </a>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for African foods, spices, drinks..."
                className="pl-10 pr-4 py-6 bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1">
              <select
                className="text-xs border rounded-md px-2 py-1 bg-white"
                value={selected.code}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>
            {isAuthenticated && user && (
              <>
                <a
                  href="/my-orders"
                  className="hidden md:inline text-sm font-medium text-primary hover:underline"
                >
                  My orders
                </a>
                <a
                  href="/account"
                  className="hidden md:inline text-sm font-medium text-primary hover:underline"
                >
                  My account
                </a>
                <span className="hidden md:inline text-xs text-muted-foreground">
                  {user.name}
                </span>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={handleLogout}
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <form onSubmit={handleSearch} className="pt-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for African foods..."
                    className="pl-10 pr-4 py-3 bg-muted border-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="bg-primary hidden md:block">
        <div className="container">
          <ul className="flex items-center justify-center gap-1">
            {navItems.map((item) => (
              <li key={item.href} className="group relative">
                <a
                  href={item.href}
                  className={`flex items-center gap-1 px-4 py-3 transition-colors ${
                    item.highlight
                      ? "text-secondary hover:text-brand-gold"
                      : "text-primary-foreground hover:text-secondary"
                  } ${item.isDeptItem || item.isPrimaryNav ? "text-base font-semibold" : "text-sm font-medium"}`}
                >
                  {item.label}
                  {item.dropdown && item.dropdown.length > 0 && <ChevronDown className="w-4 h-4" />}
                </a>
                {item.dropdown && item.dropdown.length > 0 && (
                  <div
                    className={`absolute top-full left-0 bg-background shadow-medium rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 ${
                      item.isMore ? "w-64" : "w-48"
                    }`}
                  >
                    <div className={`${item.isMore ? "max-h-96 overflow-y-auto p-2 grid grid-cols-1 gap-1" : ""}`}>
                      {item.dropdown.map((subItem) => (
                        <a
                          key={subItem.href}
                          href={subItem.href}
                          className={`block rounded px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors`}
                        >
                          {subItem.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-t overflow-hidden"
          >
            <nav className="container py-4 max-h-[75vh] overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`block px-4 py-4 text-base font-medium rounded-lg transition-colors ${
                        item.highlight
                          ? "text-secondary bg-primary/5"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </a>
                    {item.dropdown && item.dropdown.length > 0 && (
                      <div className="pl-4">
                        <ul className="space-y-1">
                          {item.dropdown.map((sub) => (
                            <li key={sub.href}>
                              <a
                                href={sub.href}
                                className="block px-4 py-3 text-sm rounded-md text-muted-foreground hover:text-primary hover:bg-muted"
                              >
                                {sub.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
                {isAuthenticated && user ? (
                  <>
                    <li className="my-2 border-t border-border/50" />
                    <li className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </li>
                    <li>
                      <a href="/my-orders" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>
                        My Orders
                      </a>
                    </li>
                    <li>
                      <a href="/account" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>
                        My Account
                      </a>
                    </li>
                    <li>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="my-2 border-t border-border/50" />
                    <li>
                      <a href="/login" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </a>
                    </li>
                    <li>
                      <a href="/register" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg" onClick={() => setIsMenuOpen(false)}>
                        Register
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
