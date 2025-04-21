"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardHeader from "@/components/dashboard-header"
import OverviewPage from "@/components/pages/overview"
import BookingsPage from "@/components/pages/bookings"
import RoomsPage from "@/components/pages/rooms"
import RestaurantPage from "@/components/pages/restaurant"
import PaymentsPage from "@/components/pages/payments"
import HousekeepingPage from "@/components/pages/housekeeping"
import StaffPage from "@/components/pages/staff"
import ReportsPage from "@/components/pages/reports"
import MarketingPage from "@/components/pages/marketing"
import SettingsPage from "@/components/pages/settings"

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
    <SidebarProvider>
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
