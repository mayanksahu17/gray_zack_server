"use client"

import { useState, useEffect } from "react"
import { Bell, Calendar, CheckSquare, CreditCard, Home, LogOut, Search, Settings, Users, X } from "lucide-react"

import { CheckInView } from "@/components_m1/check-in-view"
import { CheckOutView } from "@/components_m1/check-out-view"
import { GuestHistoryView } from "@/components_m1/guest-history-view"
import { ReportingView } from "@/components_m1/reporting-view"
import { RoomManagementView } from "@/components_m1/room-management-view"
import { Button } from "@/components_m1/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m1/ui/card"
import { Input } from "@/components_m1/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components_m1/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m1/ui/tabs"
import img from '../public/is_logo1 (1).webp'

interface Guest {
  id: string
  name: string
  time?: string
  room?: string
}

interface RoomStatus {
  available: number
  occupied: number
  cleaning: number
  maintenance: number
}

interface Reservation {
  id: string
  name: string
  roomType: string
  nights: number
  time: string
  status: string
}

interface UpcomingReservations {
  tomorrow: Reservation[]
  day2: Reservation[]
  day3: Reservation[]
}

interface DashboardData {
  todayCheckIns: Guest[]
  todayCheckOuts: Guest[]
  roomStatus: RoomStatus
  upcomingReservations: UpcomingReservations
}

export function DashboardView() {
  const [activeView, setActiveView] = useState("dashboard")
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todayCheckIns: [],
    todayCheckOuts: [],
    roomStatus: {
      available: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0
    },
    upcomingReservations: {
      tomorrow: [],
      day2: [],
      day3: []
    }
  })
  const [loading, setLoading] = useState(true)

  // Search bar state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // Handle search input change
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    if (e.target.value === "") {
      setShowSearchResults(false)
      setSearchResults([])
    }
  }

  // Handle search submit (Enter key or icon click)
  const handleSearchSubmit = async (e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setShowSearchResults(true)
    setSearchResults([])
    try {
      const res = await fetch(`http://16.171.47.60:8000/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      const results: any[] = []
      if (data.guests && data.guests.length > 0) {
        results.push({ group: 'Guests', items: data.guests.map((g: any) => ({
          type: 'Guest',
          id: g._id,
          name: `${g.personalInfo?.firstName || g.firstName || ''} ${g.personalInfo?.lastName || g.lastName || ''}`.trim() || g.email || g.phone || g.idNumber,
          email: g.personalInfo?.email || g.email,
          phone: g.personalInfo?.phone || g.phone
        })) })
      }
      if (data.rooms && data.rooms.length > 0) {
        results.push({ group: 'Rooms', items: data.rooms.map((r: any) => ({
          type: 'Room',
          id: r._id,
          name: `Room ${r.roomNumber}`,
          roomNumber: r.roomNumber,
          status: r.status
        })) })
      }
      if (data.reservations && data.reservations.length > 0) {
        results.push({ group: 'Reservations', items: data.reservations.map((res: any) => ({
          type: 'Reservation',
          id: res._id,
          name: `Reservation #${res._id}`,
          guest: res.guestId,
          room: res.roomId,
          status: res.status
        })) })
      }
      setSearchResults(results)
    } catch (err) {
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle result click (navigate or set view)
  const handleResultClick = (result: any) => {
    setShowSearchResults(false)
    setSearchQuery("")
    // Example: set view based on type
    if (result.type === "Guest") setActiveView("guest-history")
    else if (result.type === "Room") setActiveView("room-management")
    else if (result.type === "Reservation") setActiveView("check-in")
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://16.171.47.60:8000/api/dashboard')
        const data = await response.json()
        setDashboardData(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const renderActiveView = () => {
    switch (activeView) {
      case "check-in":
        return <CheckInView />
      case "check-out":
        return <CheckOutView />
      case "guest-history":
        return <GuestHistoryView />
      case "room-management":
        return <RoomManagementView />
      case "reporting":
        return <ReportingView />
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>
    }

    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-4 md:flex-row">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle>Today&apos;s Check-ins</CardTitle>
              <CardDescription>Guests arriving today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.todayCheckIns.length}</div>
              <div className="mt-4 space-y-2">
                {dashboardData.todayCheckIns.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div>
                      <div className="font-medium">{guest.name}</div>
                      <div className="text-sm text-muted-foreground">Arrival: {guest.time}</div>
                    </div>
                    <Button size="sm" onClick={() => setActiveView("check-in")}>
                      Check In
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setActiveView("check-in")}>
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle>Today&apos;s Check-outs</CardTitle>
              <CardDescription>Guests departing today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.todayCheckOuts.length}</div>
              <div className="mt-4 space-y-2">
                {dashboardData.todayCheckOuts.map((guest) => (
                  <div key={guest.id} className="flex items-center justify-between rounded-lg border p-2">
                    <div>
                      <div className="font-medium">{guest.name}</div>
                      <div className="text-sm text-muted-foreground">Room: {guest.room}</div>
                    </div>
                    <Button size="sm" onClick={() => setActiveView("check-out")}>
                      Check Out
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => setActiveView("check-out")}>
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle>Room Status</CardTitle>
              <CardDescription>Current occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-green-100 p-4 text-center dark:bg-green-900">
                  <div className="text-sm font-medium text-green-800 dark:text-green-100">Available</div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-100">{dashboardData.roomStatus.available}</div>
                </div>
                <div className="rounded-lg bg-red-100 p-4 text-center dark:bg-red-900">
                  <div className="text-sm font-medium text-red-800 dark:text-red-100">Occupied</div>
                  <div className="text-2xl font-bold text-red-800 dark:text-red-100">{dashboardData.roomStatus.occupied}</div>
                </div>
                <div className="rounded-lg bg-yellow-100 p-4 text-center dark:bg-yellow-900">
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-100">Cleaning</div>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-100">{dashboardData.roomStatus.cleaning}</div>
                </div>
                <div className="rounded-lg bg-blue-100 p-4 text-center dark:bg-blue-900">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-100">Maintenance</div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-100">{dashboardData.roomStatus.maintenance}</div>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full" onClick={() => setActiveView("room-management")}>
                Manage Rooms
              </Button>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle>Guest Notifications</CardTitle>
              <CardDescription>Recent requests and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Notifications will be implemented separately */}
                <div className="text-center text-muted-foreground">No notifications at this time</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reservations</CardTitle>
            <CardDescription>Next 3 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tomorrow">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                <TabsTrigger value="day2">In 2 Days</TabsTrigger>
                <TabsTrigger value="day3">In 3 Days</TabsTrigger>
              </TabsList>
              <TabsContent value="tomorrow" className="mt-4">
                <div className="space-y-2">
                  {dashboardData.upcomingReservations.tomorrow.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{reservation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.roomType} - {reservation.nights} nights
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{reservation.time}</div>
                        <div className="text-sm text-muted-foreground">{reservation.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="day2" className="mt-4">
                <div className="space-y-2">
                  {dashboardData.upcomingReservations.day2.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{reservation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.roomType} - {reservation.nights} nights
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{reservation.time}</div>
                        <div className="text-sm text-muted-foreground">{reservation.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="day3" className="mt-4">
                <div className="space-y-2">
                  {dashboardData.upcomingReservations.day3.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <div className="font-medium">{reservation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.roomType} - {reservation.nights} nights
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{reservation.time}</div>
                        <div className="text-sm text-muted-foreground">{reservation.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <img src="https://res.cloudinary.com/dwyyrm9xw/image/upload/v1744358318/wqc4hcdz0esi42jsijro.png" alt="" className="" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "dashboard"}
                  onClick={() => setActiveView("dashboard")}
                  className="gap-3"
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "check-in"}
                  onClick={() => setActiveView("check-in")}
                  className="gap-3"
                >
                  <CheckSquare className="h-5 w-5" />
                  <span>Check In</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "check-out"}
                  onClick={() => setActiveView("check-out")}
                  className="gap-3"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Check Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "guest-history"}
                  onClick={() => setActiveView("guest-history")}
                  className="gap-3"
                >
                  <Users className="h-5 w-5" />
                  <span>Guest History</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "room-management"}
                  onClick={() => setActiveView("room-management")}
                  className="gap-3"
                >
                  <Calendar className="h-5 w-5" />
                  <span>Room Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeView === "reporting"}
                  onClick={() => setActiveView("reporting")}
                  className="gap-3"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Reports & Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 p-1">
                  <Users className="h-full w-full text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">Front Desk</div>
                  <div className="text-xs text-muted-foreground">John Smith</div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 max-w-full">
          <header className="sticky top-0 z-10 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4 md:w-1/3 relative">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" onClick={handleSearchSubmit} />
                  <Input
                    type="search"
                    placeholder="Search guests, rooms, or reservations..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onKeyDown={handleSearchSubmit}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                  />
                  {showSearchResults && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border rounded shadow-lg z-50 max-h-60 overflow-auto">
                      {searchLoading ? (
                        <div className="p-4 text-center text-muted-foreground">Searching...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No results found</div>
                      ) : (
                        searchResults.map((group, gIdx) => (
                          <div key={gIdx}>
                            <div className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase">{group.group}</div>
                            {group.items.map((result: any, idx: number) => (
                              <div
                                key={result.id}
                                className="p-3 hover:bg-blue-100 cursor-pointer flex items-center justify-between"
                                onClick={() => handleResultClick(result)}
                              >
                                <span>{result.name}</span>
                                <X className="h-4 w-4 text-muted-foreground" onClick={e => { e.stopPropagation(); setShowSearchResults(false); }} />
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden md:inline">Notifications</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    0
                  </span>
                </Button>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">{new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
            <div className="flex border-t px-6 py-2">
              <div className="flex gap-2">
                <Button
                  size="lg"
                  className="h-auto gap-2 rounded-lg px-6 py-3"
                  onClick={() => setActiveView("check-in")}
                >
                  <CheckSquare className="h-5 w-5" />
                  <span>Check In</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto gap-2 rounded-lg px-6 py-3"
                  onClick={() => setActiveView("check-out")}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Check Out</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="p-6 min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 bg-no-repeat bg-cover">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

