"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, CheckCircle, Clock, DollarSign, Minus, Percent, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m2/ui/card"
import { overviewData } from "@/lib/mock-data"
import { Alert, AlertDescription, AlertTitle } from "@/components_m2/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components_m2/ui/table"
import { AreaChart, BarChart } from "@/components_m2/ui/chart"
import { 
  getTodaysTimeline, 
  getTodayRevenue, 
  getOccupancyRateToday,
  getActiveReservations,
  getRoomServiceOrders,
  getMonthlyRevenue,
  getMonthlyOccupancy,
  getSystemAlerts
} from "@/app/api/analytics_m2"

// Define the shape of the timeline item
interface TimelineItem {
  time: string
  event: string
  room: string
  guest: string
}

// Define the shape of the KPI data
interface KpiData {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'flat'
}

// Define the shape of chart data
interface ChartData {
  date: string
  [key: string]: string | number
}

// Define the shape of alerts
interface AlertData {
  type: 'success' | 'warning' | 'error'
  message: string
  time: string
}

export default function OverviewPage() {
  const { kpis: allKpis } = overviewData
  
  // Timeline states
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [timelineLoading, setTimelineLoading] = useState(true)
  const [timelineError, setTimelineError] = useState<string | null>(null)
  
  // KPI states
  const [todayRevenue, setTodayRevenue] = useState<KpiData | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [revenueError, setRevenueError] = useState<string | null>(null)
  
  const [occupancyRate, setOccupancyRate] = useState<KpiData | null>(null)
  const [occupancyLoading, setOccupancyLoading] = useState(true)
  const [occupancyError, setOccupancyError] = useState<string | null>(null)
  
  const [activeReservations, setActiveReservations] = useState<KpiData | null>(null)
  const [reservationsLoading, setReservationsLoading] = useState(true)
  const [reservationsError, setReservationsError] = useState<string | null>(null)
  
  const [roomServiceOrders, setRoomServiceOrders] = useState<KpiData | null>(null)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  
  // Chart states
  const [monthlyRevenue, setMonthlyRevenue] = useState<ChartData[]>([])
  const [monthlyRevenueLoading, setMonthlyRevenueLoading] = useState(true)
  const [monthlyRevenueError, setMonthlyRevenueError] = useState<string | null>(null)
  
  const [monthlyOccupancy, setMonthlyOccupancy] = useState<ChartData[]>([])
  const [monthlyOccupancyLoading, setMonthlyOccupancyLoading] = useState(true)
  const [monthlyOccupancyError, setMonthlyOccupancyError] = useState<string | null>(null)
  
  // Alerts state
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [alertsError, setAlertsError] = useState<string | null>(null)
  
  // Filter out the KPIs that will be fetched from API
  const kpis = allKpis.filter(kpi => 
    !kpi.title.includes("Revenue") && 
    !kpi.title.includes("Occupancy") && 
    !kpi.title.includes("Reservations") && 
    !kpi.title.includes("Service")
  )

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setTimelineLoading(true)
        const data = await getTodaysTimeline()
        setTimeline(data)
      } catch (err) {
        console.error("Error fetching timeline data:", err)
        setTimelineError("Failed to load timeline data")
      } finally {
        setTimelineLoading(false)
      }
    }

    const fetchTodayRevenue = async () => {
      try {
        setRevenueLoading(true)
        const data = await getTodayRevenue()
        setTodayRevenue(data)
      } catch (err) {
        console.error("Error fetching revenue data:", err)
        setRevenueError("Failed to load revenue data")
      } finally {
        setRevenueLoading(false)
      }
    }
    
    const fetchOccupancyRate = async () => {
      try {
        setOccupancyLoading(true)
        const data = await getOccupancyRateToday()
        setOccupancyRate(data)
      } catch (err) {
        console.error("Error fetching occupancy data:", err)
        setOccupancyError("Failed to load occupancy data")
      } finally {
        setOccupancyLoading(false)
      }
    }
    
    const fetchActiveReservations = async () => {
      try {
        setReservationsLoading(true)
        const data = await getActiveReservations()
        setActiveReservations(data)
      } catch (err) {
        console.error("Error fetching reservations data:", err)
        setReservationsError("Failed to load reservations data")
      } finally {
        setReservationsLoading(false)
      }
    }
    
    const fetchRoomServiceOrders = async () => {
      try {
        setOrdersLoading(true)
        const data = await getRoomServiceOrders()
        setRoomServiceOrders(data)
      } catch (err) {
        console.error("Error fetching room service orders:", err)
        setOrdersError("Failed to load room service orders")
      } finally {
        setOrdersLoading(false)
      }
    }
    
    const fetchMonthlyRevenue = async () => {
      try {
        setMonthlyRevenueLoading(true)
        const data = await getMonthlyRevenue()
        setMonthlyRevenue(data)
      } catch (err) {
        console.error("Error fetching monthly revenue:", err)
        setMonthlyRevenueError("Failed to load monthly revenue data")
      } finally {
        setMonthlyRevenueLoading(false)
      }
    }
    
    const fetchMonthlyOccupancy = async () => {
      try {
        setMonthlyOccupancyLoading(true)
        const data = await getMonthlyOccupancy()
        setMonthlyOccupancy(data)
      } catch (err) {
        console.error("Error fetching monthly occupancy:", err)
        setMonthlyOccupancyError("Failed to load monthly occupancy data")
      } finally {
        setMonthlyOccupancyLoading(false)
      }
    }
    
    const fetchAlerts = async () => {
      try {
        setAlertsLoading(true)
        const data = await getSystemAlerts()
        setAlerts(data)
      } catch (err) {
        console.error("Error fetching system alerts:", err)
        setAlertsError("Failed to load system alerts")
      } finally {
        setAlertsLoading(false)
      }
    }

    fetchTimeline()
    fetchTodayRevenue()
    fetchOccupancyRate()
    fetchActiveReservations()
    fetchRoomServiceOrders()
    fetchMonthlyRevenue()
    fetchMonthlyOccupancy()
    fetchAlerts()
  }, [])

  const renderTrendIcon = (trend: string) => {
    if (trend === "up") return <ArrowUp className="h-4 w-4 text-green-500" />
    if (trend === "down") return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const renderKpiIcon = (title: string) => {
    if (title.includes("Revenue")) return <DollarSign className="h-5 w-5 text-blue-500" />
    if (title.includes("Occupancy")) return <Percent className="h-5 w-5 text-green-500" />
    if (title.includes("Reservations")) return <Clock className="h-5 w-5 text-purple-500" />
    if (title.includes("Service")) return <ShoppingCart className="h-5 w-5 text-orange-500" />
    if (title.includes("Staff")) return <Users className="h-5 w-5 text-indigo-500" />
    return null
  }

  const renderAlertIcon = (type: string) => {
    if (type === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    if (type === "warning") return <Clock className="h-5 w-5 text-yellow-500" />
    if (type === "error") return <Clock className="h-5 w-5 text-red-500" />
    return null
  }

  const getAlertClass = (type: string) => {
    if (type === "success") return "border-green-200 bg-green-50"
    if (type === "warning") return "border-yellow-200 bg-yellow-50"
    if (type === "error") return "border-red-200 bg-red-50"
    return ""
  }
  
  // Function to render a KPI card with loading/error states
  const renderKpiCard = (
    data: KpiData | null, 
    loading: boolean, 
    error: string | null, 
    title: string
  ) => {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {renderKpiIcon(title)}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground text-sm">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : data ? (
            <>
              <div className="text-2xl font-bold">{data.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {renderTrendIcon(data.trend)}
                <span className={
                  data.trend === "up" ? "text-green-500" : 
                  data.trend === "down" ? "text-red-500" : ""
                }>
                  {data.change}
                </span>
                <span className="ml-1">from last week</span>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground text-sm">No data available</div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  // Function to render a chart with loading/error states
  const renderChart = (
    type: 'area' | 'bar',
    data: ChartData[],
    loading: boolean,
    error: string | null,
    title: string,
    description: string,
    categories: string[],
    valueFormatter: (value: number) => string
  ) => {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          ) : type === 'area' ? (
            <AreaChart
              data={data}
              index="date"
              categories={categories}
              colors={["blue"]}
              valueFormatter={valueFormatter}
              className="h-[300px]"
            />
          ) : (
            <BarChart
              data={data}
              index="date"
              categories={categories}
              colors={["blue"]}
              valueFormatter={valueFormatter}
              className="h-[300px]"
            />
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your hotel today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Revenue Today KPI from API */}
        {renderKpiCard(todayRevenue, revenueLoading, revenueError, "Revenue Today")}

        {/* Occupancy Rate KPI from API */}
        {renderKpiCard(occupancyRate, occupancyLoading, occupancyError, "Occupancy Rate")}
        
        {/* Active Reservations KPI from API */}
        {renderKpiCard(activeReservations, reservationsLoading, reservationsError, "Active Reservations")}
        
        {/* Room Service Orders KPI from API */}
        {renderKpiCard(roomServiceOrders, ordersLoading, ordersError, "Room Service Orders")}

        {/* Other KPIs from mock data */}
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {renderKpiIcon(kpi.title)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {renderTrendIcon(kpi.trend)}
                <span className={kpi.trend === "up" ? "text-green-500" : kpi.trend === "down" ? "text-red-500" : ""}>
                  {kpi.change}
                </span>
                <span className="ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend Chart */}
        {renderChart(
          'area',
          monthlyRevenue,
          monthlyRevenueLoading,
          monthlyRevenueError,
          'Revenue Trend',
          'Monthly revenue for the current year',
          ['revenue'],
          (value) => `$${value.toLocaleString()}`
        )}

        {/* Occupancy Rate Chart */}
        {renderChart(
          'bar',
          monthlyOccupancy,
          monthlyOccupancyLoading,
          monthlyOccupancyError,
          'Occupancy Rate',
          'Monthly occupancy percentage',
          ['occupancy'],
          (value) => `${value}%`
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Recent system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertsLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading alerts...</div>
            ) : alertsError ? (
              <div className="py-4 text-center text-red-500">{alertsError}</div>
            ) : alerts.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">No alerts to display</div>
            ) : (
              alerts.map((alert, index) => (
                <Alert key={index} className={getAlertClass(alert.type)}>
                  <div className="flex items-start gap-4">
                    {renderAlertIcon(alert.type)}
                    <div>
                      <AlertTitle>{alert.message}</AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground">{alert.time}</AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today's Timeline</CardTitle>
            <CardDescription>Check-ins and check-outs for today</CardDescription>
          </CardHeader>
          <CardContent>
            {timelineLoading ? (
              <div className="py-4 text-center text-muted-foreground">Loading timeline data...</div>
            ) : timelineError ? (
              <div className="py-4 text-center text-red-500">{timelineError}</div>
            ) : timeline.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground">No check-ins or check-outs scheduled for today</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Guest</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeline.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.time}</TableCell>
                      <TableCell>{item.event}</TableCell>
                      <TableCell>{item.room}</TableCell>
                      <TableCell>{item.guest}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
