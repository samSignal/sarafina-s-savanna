import { useEffect } from "react"
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, User, Bell, Shield, Users, FolderTree, Award, RefreshCcw, Gift, Tag, Truck, Layers, ClipboardList, TrendingUp, Megaphone } from "lucide-react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
    permission: "view_dashboard",
  },
  {
    title: "Sales",
    url: "/admin/sales",
    icon: TrendingUp,
    permission: "view_orders",
  },
  {
    title: "Exchange Rates",
    url: "/admin/exchange-rates",
    icon: RefreshCcw,
    permission: "view_dashboard",
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
    permission: "view_products",
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: ClipboardList,
    permission: "view_products",
  },
  {
    title: "Departments",
    url: "/admin/departments",
    icon: FolderTree,
    permission: "manage_categories",
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Layers,
    permission: "manage_categories",
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
    permission: "view_orders",
  },
  {
    title: "Delivery",
    url: "/admin/delivery",
    icon: Truck,
    permission: "manage_orders",
  },
  {
    title: "Promotions",
    url: "/admin/promotions",
    icon: Tag,
    permission: "manage_promotions",
  },
  {
    title: "Banners",
    url: "/admin/banners",
    icon: Megaphone,
    permission: "manage_settings",
  },
  {
    title: "Refunds & Policy",
    url: "/admin/refunds",
    icon: RefreshCcw,
    permission: "manage_refunds",
  },
  {
    title: "Gift Cards",
    url: "/admin/gift-cards",
    icon: Gift,
    permission: "manage_gift_cards",
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
    permission: "view_customers",
  },
  {
    title: "Loyalty & Rewards",
    url: "/admin/loyalty",
    icon: Award,
    permission: "manage_loyalty",
  },
  {
    title: "Roles & Permissions",
    url: "/admin/roles",
    icon: Shield,
    permission: "manage_roles",
  },
  {
    title: "Staff Management",
    url: "/admin/users",
    icon: User,
    permission: "view_users",
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    permission: "manage_settings",
  },
]

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect}`, { replace: true });
      return;
    }

    // Check for admin/staff role
    // Allow if role is admin/super_admin OR if they have a role_name that isn't Customer
    // Robust check for legacy role column AND new role system
    const role = (user?.role || "").toLowerCase();
    const roleName = (user?.role_name || "").toLowerCase();

    const isStaff = 
        role === 'admin' || 
        role === 'super_admin' ||
        (roleName && !['customer', 'client'].includes(roleName)) ||
        (role && !['customer', 'client'].includes(role));

    if (user && !isStaff) {
      navigate('/account', { replace: true });
    }
  }, [loading, isAuthenticated, user, location.pathname, location.search, navigate]);

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50 bg-sidebar-background">
             <Link to="/" className="flex items-center gap-2 font-playfair text-xl font-bold text-primary">
                Sarafina
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.filter(item => {
                    // If no user or no permissions loaded yet, hide everything except maybe dashboard if we want to be nice (but safer to hide)
                    if (!user) return false;
                    
                    // Admin/Super Admin bypass
                    const role = (user.role || "").toLowerCase();
                    const roleName = (user.role_name || "").toLowerCase();
                    if (role === 'admin' || role === 'super_admin' || roleName === 'administrator') return true;

                    // Check permission
                    if (!item.permission) return true; // Public item
                    
                    return user.permissions?.includes(item.permission) || user.permissions?.includes('*');
                  }).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                        className="hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-border/50 p-4">
            <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/10 text-secondary-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium">System Online</span>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 w-full flex flex-col">
            <header className="flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <h2 className="text-lg font-semibold text-foreground/80 capitalize">
                        {location.pathname.split('/').pop() || 'Dashboard'}
                    </h2>
                </div>
                
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
                    </Button>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src="/images/department%20logo/sarafina%20logo.jpeg"
                                      alt="Sarafina logo"
                                    />
                                    <AvatarFallback className="bg-primary/10 text-primary">SA</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.email || 'admin@sarafina.africa'}</p>
                                    {user?.role_name && (
                                        <p className="text-[10px] uppercase tracking-wider text-primary font-bold">{user.role_name}</p>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <div className="flex-1 p-8 overflow-auto bg-slate-50/50">
                 <Outlet />
            </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
