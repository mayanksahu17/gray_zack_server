"use client"

import { ArrowDown, ArrowUp, CheckCircle, Clock, DollarSign, Minus, Percent, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { overviewData } from "@/lib/mock-data"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AreaChart, BarChart } from "@/components/ui/chart"

export default function OverviewPage() {
  const { kpis, revenueData, occupancyData, alerts, timeline } = overviewData

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your hotel today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AreaChart
              data={revenueData}
              index="date"
              categories={["revenue"]}
              colors={["blue"]}
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              className="h-[300px]"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
            <CardDescription>Monthly occupancy percentage</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChart
              data={occupancyData}
              index="date"
              categories={["occupancy"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value}%`}
              className="h-[300px]"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Recent system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <Alert key={index} className={getAlertClass(alert.type)}>
                <div className="flex items-start gap-4">
                  {renderAlertIcon(alert.type)}
                  <div>
                    <AlertTitle>{alert.message}</AlertTitle>
                    <AlertDescription className="text-xs text-muted-foreground">{alert.time}</AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Today's Timeline</CardTitle>
            <CardDescription>Check-ins and check-outs for today</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
