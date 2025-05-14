"use client"

import { Home, User, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  const navItems = [
    { id: "rooms", label: "Rooms", icon: Home },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-80 md:w-80 bg-gray-50 border-r border-gray-200 flex flex-col shadow-md">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-center md:justify-start">
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-md">
            H
          </div>
          <h2 className="ml-3 text-2xl font-bold hidden md:block">Housekeeper</h2>
        </div>
      </div>

      <nav className="flex-1 pt-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center w-full px-4 py-4 text-left transition-colors rounded-xl",
                  "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                  activeTab === item.id ? "text-blue-600 bg-blue-100 font-bold shadow-sm" : "text-gray-700",
                )}
              >
                <item.icon
                  className={cn(
                    "h-7 w-7 mx-auto md:mx-0 md:mr-4",
                    activeTab === item.id ? "text-blue-600" : "text-gray-500",
                  )}
                />
                <span className="hidden md:inline text-lg">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-gray-200 hidden md:block bg-white">
        <div className="text-sm text-gray-500">
          <p>Hotel Management System</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
