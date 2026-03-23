import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Category from "./pages/Category";
import Shop from "./pages/Shop";
import PublicDepartments from "./pages/Departments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import GiftCardPurchase from "./pages/GiftCardPurchase";
import PromotionsPage from "./pages/Promotions";
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
import Users from "./pages/admin/Users";
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
import Banners from "./pages/admin/Banners";

import RequirePermission from "./components/RequirePermission";

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
          <Route path="/departments" element={<PublicDepartments />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/promotions" element={<PromotionsPage />} />
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
            <Route index element={<RequirePermission permission="view_dashboard"><Dashboard /></RequirePermission>} />
            <Route path="products" element={<RequirePermission permission="view_products"><Products /></RequirePermission>} />
            <Route path="sales" element={<RequirePermission permission="view_orders"><Sales /></RequirePermission>} />
            <Route path="inventory" element={<RequirePermission permission="view_products"><Inventory /></RequirePermission>} />
            <Route path="departments" element={<RequirePermission permission="manage_categories"><Departments /></RequirePermission>} />
            <Route path="categories" element={<RequirePermission permission="manage_categories"><Categories /></RequirePermission>} />
            <Route path="orders" element={<RequirePermission permission="view_orders"><Orders /></RequirePermission>} />
            <Route path="delivery" element={<RequirePermission permission="manage_orders"><Delivery /></RequirePermission>} />
            <Route path="promotions" element={<RequirePermission permission="manage_promotions"><Promotions /></RequirePermission>} />
            <Route path="banners" element={<RequirePermission permission="manage_settings"><Banners /></RequirePermission>} />
            <Route path="refunds" element={<RequirePermission permission="manage_refunds"><Refunds /></RequirePermission>} />
            <Route path="gift-cards" element={<RequirePermission permission="manage_gift_cards"><GiftCards /></RequirePermission>} />
            <Route path="customers" element={<RequirePermission permission="view_customers"><Customers /></RequirePermission>} />
            <Route path="customers/:id" element={<RequirePermission permission="view_customers"><CustomerProfile /></RequirePermission>} />
            <Route path="loyalty" element={<RequirePermission permission="manage_loyalty"><Loyalty /></RequirePermission>} />
            <Route path="roles" element={<RequirePermission permission="manage_roles"><Roles /></RequirePermission>} />
            <Route path="users" element={<RequirePermission permission="view_users"><Users /></RequirePermission>} />
            <Route path="settings" element={<RequirePermission permission="manage_settings"><Settings /></RequirePermission>} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
