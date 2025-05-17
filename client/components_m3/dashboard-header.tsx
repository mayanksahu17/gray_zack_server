"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react"

interface DashboardHeaderProps {
  user?: { name: string; email: string } | null
  onLogout?: () => void
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'JD'
  const displayName = user?.name || 'Jane Doe'
  const displayEmail = user?.email || 'jane.doe@hotelexample.com'
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">Hotel Management</h1>
        </div>

        <div className="flex items-center space-x-6">
          <button className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Bell className="h-7 w-7" />
            <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
          </button>

          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="flex items-center space-x-3 focus:outline-none p-2 hover:bg-blue-50 rounded-lg transition-colors">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
                {initials}
              </div>
              <div className="hidden md:block text-lg font-medium">{displayName}</div>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-72 animate-in fade-in-80 zoom-in-95 p-1">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-xl font-bold">{displayName}</p>
                <p className="text-base text-gray-500">{displayEmail}</p>
              </div>

              <DropdownMenuItem className="cursor-pointer text-base py-3 px-6 hover:bg-blue-50">
                <User className="mr-3 h-5 w-5" />
                <span>Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer text-base py-3 px-6 hover:bg-blue-50">
                <Settings className="mr-3 h-5 w-5" />
                <span>Change Password</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                className="cursor-pointer text-base py-3 px-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
