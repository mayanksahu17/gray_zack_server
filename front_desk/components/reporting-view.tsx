"use client"

import { useState, useEffect } from "react"
import reportsApi from "@/api/reports"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts"
import { format, subDays } from "date-fns"
import { CalendarIcon, Loader2, RefreshCw } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types
interface DateRange {
  from?: Date
  to?: Date
}

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  isLoading?: boolean
  icon?: React.ReactNode
}

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

// MetricCard Component
const MetricCard = ({ title, value, description, isLoading = false, icon }: MetricCardProps) => {
  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon && <div className="text-blue-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        ) : (
          <>
            <div className="text-2xl font-bold text-blue-600">{value}</div>
            {description && <p className="text-xs text-gray-500">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced DateRangePicker Component with presets
const DateRangePicker = ({
  dateRange,
  setDateRange,
}: {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
}) => {
  // Client-side only state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)

  // Only show the component after first render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePresetChange = (value: string) => {
    const today = new Date()
    
    switch (value) {
      case "7days":
        setDateRange({
          from: subDays(today, 7),
          to: today,
        })
        break
      case "30days":
        setDateRange({
          from: subDays(today, 30),
          to: today,
        })
        break
      case "90days":
        setDateRange({
          from: subDays(today, 90),
          to: today,
        })
        break
      case "thisMonth":
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        setDateRange({
          from: firstDayOfMonth,
          to: today,
        })
        break
      case "lastMonth":
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        setDateRange({
          from: firstDayLastMonth,
          to: lastDayLastMonth,
        })
        break
      case "clear":
        setDateRange({})
        break
    }
  }

  if (!mounted) {
    return <div className="w-[300px] h-10 bg-gray-100 animate-pulse rounded-md"></div>
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Select onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">Last 7 days</SelectItem>
          <SelectItem value="30days">Last 30 days</SelectItem>
          <SelectItem value="90days">Last 90 days</SelectItem>
          <SelectItem value="thisMonth">This month</SelectItem>
          <SelectItem value="lastMonth">Last month</SelectItem>
          <SelectItem value="clear">Clear selection</SelectItem>
        </SelectContent>
      </Select>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onSelect={setDateRange}
            numberOfMonths={2}
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Main ReportingView Component
export default function ReportingView() {
  // Client-side only state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [hotelId, setHotelId] = useState("646e2d72f3ad498c0a0b0b66") // Example hotel ID, should come from user context or route
  const [isLoading, setIsLoading] = useState(true)

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [occupancyData, setOccupancyData] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [guestData, setGuestData] = useState<any>(null)

  // Only show the component after first render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch data based on active tab
  useEffect(() => {
    if (!mounted) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const params = {
          hotelId,
          startDate: dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
          endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        }

        switch (activeTab) {
          case "dashboard":
            const dashboardResponse = await reportsApi.getDashboardMetrics(
              params.hotelId,
              params.startDate,
              params.endDate,
            )
            setDashboardData(dashboardResponse.data)
            break
          case "occupancy":
            const occupancyResponse = await reportsApi.getOccupancyMetrics(
              params.hotelId,
              params.startDate,
              params.endDate,
            )
            setOccupancyData(occupancyResponse.data)
            break
          case "revenue":
            const revenueResponse = await reportsApi.getRevenueMetrics(params.hotelId, params.startDate, params.endDate)
            setRevenueData(revenueResponse.data)
            break
          case "guests":
            const guestResponse = await reportsApi.getGuestMetrics(params.hotelId, params.startDate, params.endDate)
            setGuestData(guestResponse.data)
            break
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [activeTab, dateRange, hotelId, mounted])

  // Prevent hydration errors by not rendering anything on the server
  if (!mounted) {
    return (
      <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">View and analyze your hotel performance metrics</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        <Button
          onClick={() => {
            const currentTab = activeTab
            setActiveTab("dashboard")
            setTimeout(() => setActiveTab(currentTab), 10)
          }}
          variant="outline"
          className="border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-blue-50 border border-blue-100">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="occupancy" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="revenue" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="guests" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Guests
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={dashboardData ? `$${dashboardData.totalRevenue.toFixed(2)}` : "$0.00"}
              isLoading={isLoading}
            />
            <MetricCard title="Active Bookings" value={dashboardData?.activeBookings || 0} isLoading={isLoading} />
            <MetricCard
              title="Room Service Orders"
              value={dashboardData?.roomServiceOrders || 0}
              isLoading={isLoading}
            />
            <MetricCard title="Total Guests" value={dashboardData?.totalGuests || 0} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Occupancy Overview</CardTitle>
                <CardDescription>Current occupancy rate and trends</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={
                        occupancyData?.dailyOccupancy?.map((item: any) => ({
                          date: item._id,
                          value: item.count,
                        })) || []
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#0088FE" activeDot={{ r: 8 }} name="Occupancy" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Revenue by payment method</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          revenueData?.revenueByPaymentMethod?.map((item: any, index: number) => ({
                            name:
                              item._id === "credit_card"
                                ? "Credit Card"
                                : item._id === "cash"
                                  ? "Cash"
                                  : item._id === "corporate"
                                    ? "Corporate"
                                    : item._id,
                            value: item.revenue,
                          })) || []
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueData?.revenueByPaymentMethod?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        )) || []}
                      </Pie>
                      <Tooltip formatter={(value) => (typeof value === "number" ? `$${value.toFixed(2)}` : value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Occupancy Tab */}
        <TabsContent value="occupancy" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Occupancy Rate"
              value={occupancyData ? `${occupancyData.occupancyRate.toFixed(1)}%` : "0%"}
              description="Current hotel occupancy"
              isLoading={isLoading}
            />
            <MetricCard title="Total Rooms" value={occupancyData?.totalRooms || 0} isLoading={isLoading} />
            <MetricCard title="Occupied Rooms" value={occupancyData?.occupiedRooms || 0} isLoading={isLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Daily Occupancy</CardTitle>
                <CardDescription>Room occupancy by day</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={
                        occupancyData?.dailyOccupancy?.map((item: any) => ({
                          date: item._id,
                          occupancy: item.count,
                        })) || []
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="occupancy"
                        stroke="#0088FE"
                        activeDot={{ r: 8 }}
                        name="Occupancy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Room Type Distribution</CardTitle>
                <CardDescription>Distribution of bookings by room type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        occupancyData?.roomTypeDistribution?.map((item: any) => ({
                          name: item._id,
                          value: item.count,
                        })) || []
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Revenue"
              value={revenueData ? `$${revenueData.totalRevenue.toFixed(2)}` : "$0.00"}
              isLoading={isLoading}
            />
            <MetricCard
              title="ADR (Average Daily Rate)"
              value={revenueData ? `$${revenueData.adr.toFixed(2)}` : "$0.00"}
              description="Revenue per occupied room"
              isLoading={isLoading}
            />
            <MetricCard
              title="RevPAR"
              value={
                revenueData && typeof revenueData.revpar === "number"
                  ? `$${revenueData.revpar.toFixed(2)}`
                  : "$0.00"
              }
              description="Revenue per available room"
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue trends over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={
                        revenueData?.dailyRevenue?.map((item: any) => ({
                          date: item._id,
                          revenue: item.revenue,
                        })) || []
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => (typeof value === "number" ? `$${value.toFixed(2)}` : value)} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#0088FE" activeDot={{ r: 8 }} name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Breakdown of revenue by payment type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          revenueData?.revenueByPaymentMethod?.map((item: any, index: number) => ({
                            name:
                              item._id === "credit_card"
                                ? "Credit Card"
                                : item._id === "cash"
                                  ? "Cash"
                                  : item._id === "corporate"
                                    ? "Corporate"
                                    : item._id,
                            value: item.revenue,
                          })) || []
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueData?.revenueByPaymentMethod?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        )) || []}
                      </Pie>
                      <Tooltip formatter={(value) => (typeof value === "number" ? `$${value.toFixed(2)}` : value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Revenue by Line Item</CardTitle>
                <CardDescription>Revenue breakdown by charge type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Room Charges", value: 3500 },
                        { name: "Room Service", value: 850 },
                        { name: "Add-ons", value: 1200 },
                        { name: "Other", value: 450 },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                      <Bar dataKey="value" name="Revenue" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Total Guests" value={guestData?.totalGuests || 0} isLoading={isLoading} />
            <MetricCard
              title="New Guests"
              value={guestData?.newVsRepeatGuests?.find((item: any) => item._id === false)?.count || 0}
              isLoading={isLoading}
            />
            <MetricCard
              title="Repeat Guests"
              value={guestData?.newVsRepeatGuests?.find((item: any) => item._id === true)?.count || 0}
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Guest Type Distribution</CardTitle>
                <CardDescription>Corporate vs Individual Guests</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          guestData?.guestTypeDistribution?.map((item: any) => ({
                            name: item._id ? "Corporate" : "Individual",
                            value: item.count,
                          })) || []
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#0088FE" />
                        <Cell fill="#00C49F" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Top Nationalities</CardTitle>
                <CardDescription>Guest distribution by nationality</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        guestData?.nationalityDistribution?.map((item: any) => ({
                          name: item._id,
                          value: item.count,
                        })) || []
                      }
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Guests" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
