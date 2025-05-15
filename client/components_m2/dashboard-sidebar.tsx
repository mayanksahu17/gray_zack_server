"use client"

import {
  BarChart3,
  BedDouble,
  Calendar,
  CreditCard,
  Home,
  Hotel,
  LineChart,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AuthUtils from "@/utills/authUtills"

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "rooms", label: "Rooms", icon: BedDouble },
    { id: "restaurant", label: "Restaurant", icon: ShoppingBag },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "housekeeping", label: "Housekeeping", icon: Hotel },
    { id: "staff", label: "Staff", icon: Users },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "marketing", label: "Marketing", icon: LineChart },
    { id: "settings", label: "Settings", icon: Settings },
  ]
  const user = AuthUtils.getUserData();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD';
  const displayName = user?.name || 'Staff';
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Hotel className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-bold">Lodgezify</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton isActive={activeTab === item.id} onClick={() => setActiveTab(item.id)}>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={AuthUtils.logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
