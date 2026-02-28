import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Category from "./pages/Category";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import GiftCardPurchase from "./pages/GiftCardPurchase";
import MyOrders from "./pages/MyOrders";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import InfoPage from "./pages/InfoPage";
import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Settings from "./pages/admin/Settings";
import Roles from "./pages/admin/Roles";
import Customers from "./pages/admin/Customers";
import CustomerProfile from "./pages/admin/CustomerProfile";
import Departments from "./pages/admin/Departments";
import Categories from "./pages/admin/Categories";
import Loyalty from "./pages/admin/Loyalty";
import Refunds from "./pages/admin/Refunds";
import GiftCards from "./pages/admin/GiftCards";
import Promotions from "./pages/admin/Promotions";
import Delivery from "./pages/admin/Delivery";
import Inventory from "./pages/admin/Inventory";
import Sales from "./pages/admin/Sales";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/gift-cards" element={<GiftCardPurchase />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/account" element={<Account />} />
          
          <Route path="/contact" element={<InfoPage />} />
          <Route path="/faq" element={<InfoPage />} />
          <Route path="/delivery-policy" element={<InfoPage />} />
          <Route path="/returns-policy" element={<InfoPage />} />
          <Route path="/terms" element={<InfoPage />} />
          <Route path="/privacy" element={<InfoPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="departments" element={<Departments />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="delivery" element={<Delivery />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="gift-cards" element={<GiftCards />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="loyalty" element={<Loyalty />} />
            <Route path="roles" element={<Roles />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
