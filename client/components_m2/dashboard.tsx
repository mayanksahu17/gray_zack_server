"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components_m2/dashboard-sidebar"
import DashboardHeader from "@/components_m2/dashboard-header"
import OverviewPage from "@/components_m2/pages/overview"
import BookingsPage from "@/components_m2/pages/bookings"
import RoomsPage from "@/components_m2/pages/rooms"
import RestaurantPage from "@/components_m2/pages/restaurant"
import PaymentsPage from "@/components_m2/pages/payments"
import HousekeepingPage from "@/components_m2/pages/housekeeping"
import StaffPage from "@/components_m2/pages/staff"
import ReportsPage from "@/components_m2/pages/reports"
import MarketingPage from "@/components_m2/pages/marketing"
import SettingsPage from "@/components_m2/pages/settings"

export type TabType =
  | "overview"
  | "bookings"
  | "rooms"
  | "restaurant"
  | "payments"
  | "housekeeping"
  | "staff"
  | "reports"
  | "marketing"
  | "settings"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPage />
      case "bookings":
        return <BookingsPage />
      case "rooms":
        return <RoomsPage />
      case "restaurant":
        return <RestaurantPage />
      case "payments":
        return <PaymentsPage />
      case "housekeeping":
        return <HousekeepingPage />
      case "staff":
        return <StaffPage />
      case "reports":
        return <ReportsPage />
      case "marketing":
        return <MarketingPage />
      case "settings":
        return <SettingsPage />
      default:
        return <OverviewPage />
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{renderContent()}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
