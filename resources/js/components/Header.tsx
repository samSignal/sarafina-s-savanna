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
  const [navItems, setNavItems] = useState([
    { label: "Home", href: "/" },
    { label: "Shop All", href: "/shop", highlight: true },
    { label: "Gift Cards", href: "/gift-cards", highlight: true },
  ]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const [deptResponse, categoryResponse] = await Promise.all([
          fetch("/api/public/departments"),
          fetch("/api/public/categories"),
        ]);

        if (!deptResponse.ok) {
          return;
        }

        const departments = await deptResponse.json();
        const categories = categoryResponse.ok ? await categoryResponse.json() : [];

        const departmentNavItems = departments.map((dept: any) => {
          const deptCategories = categories.filter(
            (cat: any) => cat.department_id === dept.id
          );

          return {
            label: dept.name,
            href: `/category/${dept.id}`,
            dropdown: deptCategories.map((cat: any) => ({
              label: cat.name,
              href: `/category/${dept.id}?category=${cat.id}`,
            })),
            highlight: dept.name === "Clearance",
          };
        });

        setNavItems([
          { label: "Home", href: "/" },
          { label: "Shop All", href: "/shop", highlight: true },
          ...departmentNavItems,
          { label: "Gift Cards", href: "/gift-cards", highlight: true },
        ]);
      } catch (error) {
        console.error("Failed to load departments for header", error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background shadow-soft">
      {/* Top bar */}
      <div className="bg-brand-gradient text-primary-foreground py-2">
        <div className="container text-center text-sm font-medium tracking-wide">
          Connecting the Global Diaspora to Home • Premium Grocery Delivery in Zimbabwe
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-accent-gradient flex items-center justify-center shadow-medium">
              <img
                src="/images/department%20logo/sarafina%20logo.jpeg"
                alt="Sarafina Market logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-3xl md:text-4xl font-bold text-primary">
              Sarafina<span className="text-secondary">Market</span>
            </span>
          </a>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for African foods, spices, drinks..."
                className="pl-10 pr-4 py-6 bg-muted border-0 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
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
              onClick={() => {
                if (isAuthenticated) {
                  logout();
                } else {
                  navigate("/login");
                }
              }}
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
              <div className="pt-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for African foods..."
                    className="pl-10 pr-4 py-3 bg-muted border-0"
                  />
                </div>
              </div>
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
                  className={`flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${
                    item.highlight
                      ? "text-secondary hover:text-brand-gold"
                      : "text-primary-foreground hover:text-secondary"
                  }`}
                >
                  {item.label}
                  {item.dropdown && item.dropdown.length > 0 && <ChevronDown className="w-4 h-4" />}
                </a>
                {item.dropdown && item.dropdown.length > 0 && (
                  <div className="absolute top-full left-0 w-48 bg-background shadow-medium rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem.href}
                        href={subItem.href}
                        className="block px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                      >
                        {subItem.label}
                      </a>
                    ))}
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
            <nav className="container py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        item.highlight
                          ? "text-secondary bg-primary/5"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
