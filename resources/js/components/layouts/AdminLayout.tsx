import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, User, Bell, Shield, Users, FolderTree, Award, RefreshCcw, Gift, Tag, Truck, Layers, ClipboardList, TrendingUp } from "lucide-react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Sales",
    url: "/admin/sales",
    icon: TrendingUp,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: ClipboardList,
  },
  {
    title: "Departments",
    url: "/admin/departments",
    icon: FolderTree,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Layers,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Delivery",
    url: "/admin/delivery",
    icon: Truck,
  },
  {
    title: "Promotions",
    url: "/admin/promotions",
    icon: Tag,
  },
  {
    title: "Refunds & Policy",
    url: "/admin/refunds",
    icon: RefreshCcw,
  },
  {
    title: "Gift Cards",
    url: "/admin/gift-cards",
    icon: Gift,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Loyalty & Rewards",
    url: "/admin/loyalty",
    icon: Award,
  },
  {
    title: "Roles & Permissions",
    url: "/admin/roles",
    icon: Shield,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="h-16 flex items-center px-4 border-b border-border/50 bg-sidebar-background">
             <Link to="/" className="flex items-center gap-2 font-playfair text-xl font-bold text-primary">
                Sarafina's
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
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
                                    <p className="text-sm font-medium leading-none">Admin User</p>
                                    <p className="text-xs leading-none text-muted-foreground">admin@sarafina.africa</p>
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
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
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
