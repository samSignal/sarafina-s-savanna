import { useState } from "react";
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Home", href: "#" },
  { label: "Shop All", href: "#", highlight: true },
  { 
    label: "Categories", 
    href: "#",
    dropdown: ["Fresh Meat", "Spices", "Drinks", "Pantry", "Snacks", "Produce"]
  },
  { label: "Fresh Produce", href: "#" },
  { label: "Spices & Seasonings", href: "#" },
  { label: "Drinks", href: "#" },
  { label: "Clearance", href: "#", highlight: true },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background shadow-soft">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="container text-center text-sm font-medium">
          🚚 Free Delivery on Orders Over £50 | Fresh African Foods Delivered to Your Door
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent-gradient rounded-full flex items-center justify-center">
              <span className="text-accent-foreground font-display font-bold text-xl">S</span>
            </div>
            <span className="font-display text-2xl font-bold text-primary">
              Sarafina<span className="text-secondary">Foods</span>
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <User className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {searchOpen && (
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
              <li key={item.label} className="group relative">
                <a
                  href={item.href}
                  className={`flex items-center gap-1 px-4 py-3 text-sm font-medium transition-colors ${
                    item.highlight
                      ? "text-secondary hover:text-brand-gold"
                      : "text-primary-foreground hover:text-secondary"
                  }`}
                >
                  {item.label}
                  {item.dropdown && <ChevronDown className="w-4 h-4" />}
                </a>
                {item.dropdown && (
                  <div className="absolute top-full left-0 w-48 bg-background shadow-medium rounded-b-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem}
                        href="#"
                        className="block px-4 py-3 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                      >
                        {subItem}
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
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-t overflow-hidden"
          >
            <nav className="container py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
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
