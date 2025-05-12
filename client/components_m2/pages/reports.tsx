"use client"

import { useState, useEffect } from "react"
import { Download, FileText, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m2/ui/card"
import { Input } from "@/components_m2/ui/input"
import { Button } from "@/components_m2/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components_m2/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m2/ui/tabs"
import { AreaChart, BarChart } from "@/components_m2/ui/chart"
import { 
  getOccupancyTrend,
  getRevenueByRoomType,
  getGuestFeedback,
  getAvailableReports
} from "@/app/api/report"

// Define types for our data
interface OccupancyData {
  month: string
  occupancy: number
}

interface RevenueData {
  type: string
  revenue: number
}

interface FeedbackData {
  category: string
  rating: number
}

interface ReportData {
  name: string
  format: string
  lastGenerated: string
}

export default function ReportsPage() {
  // State for storing data from API
  const [occupancyTrend, setOccupancyTrend] = useState<OccupancyData[]>([])
  const [occupancyLoading, setOccupancyLoading] = useState(true)
  const [occupancyError, setOccupancyError] = useState<string | null>(null)
  
  const [revenueByRoomType, setRevenueByRoomType] = useState<RevenueData[]>([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [revenueError, setRevenueError] = useState<string | null>(null)
  
  const [guestFeedback, setGuestFeedback] = useState<FeedbackData[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  
  const [availableReports, setAvailableReports] = useState<ReportData[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState<string | null>(null)
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchOccupancyTrend = async () => {
      try {
        setOccupancyLoading(true)
        const data = await getOccupancyTrend()
        setOccupancyTrend(data)
      } catch (err) {
        console.error("Error fetching occupancy trend:", err)
        setOccupancyError("Failed to load occupancy trend data")
      } finally {
        setOccupancyLoading(false)
      }
    }
    
    const fetchRevenueByRoomType = async () => {
      try {
        setRevenueLoading(true)
        const data = await getRevenueByRoomType()
        setRevenueByRoomType(data)
      } catch (err) {
        console.error("Error fetching revenue by room type:", err)
        setRevenueError("Failed to load revenue data")
      } finally {
        setRevenueLoading(false)
      }
    }
    
    const fetchGuestFeedback = async () => {
      try {
        setFeedbackLoading(true)
        const data = await getGuestFeedback()
        setGuestFeedback(data)
      } catch (err) {
        console.error("Error fetching guest feedback:", err)
        setFeedbackError("Failed to load guest feedback data")
      } finally {
        setFeedbackLoading(false)
      }
    }
    
    const fetchAvailableReports = async () => {
      try {
        setReportsLoading(true)
        const data = await getAvailableReports()
        setAvailableReports(data)
      } catch (err) {
        console.error("Error fetching available reports:", err)
        setReportsError("Failed to load available reports")
      } finally {
        setReportsLoading(false)
      }
    }
    
    fetchOccupancyTrend()
    fetchRevenueByRoomType()
    fetchGuestFeedback()
    fetchAvailableReports()
  }, [])
  
  // Filter reports based on search query
  const filteredReports = availableReports.filter(report => 
    report.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const renderChartContent = (
    data: any[], 
    loading: boolean, 
    error: string | null, 
    emptyMessage: string
  ) => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      )
    }
    
    if (!data || data.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )
    }
    
    return null // Return null to render the actual chart
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h1>
        <p className="text-muted-foreground">View and download reports and analytics for your hotel.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search reports..." 
          className="pl-8" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="occupancy">
        <TabsList>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="feedback">Guest Feedback</TabsTrigger>
          <TabsTrigger value="reports">Available Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="occupancy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Trend</CardTitle>
              <CardDescription>Monthly occupancy rate for the current year</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {renderChartContent(
                occupancyTrend, 
                occupancyLoading, 
                occupancyError, 
                "No occupancy data available"
              ) || (
                <AreaChart
                  data={occupancyTrend}
                  index="month"
                  categories={["occupancy"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value}%`}
                  className="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Room Type</CardTitle>
              <CardDescription>Revenue breakdown by room category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {renderChartContent(
                revenueByRoomType, 
                revenueLoading, 
                revenueError, 
                "No revenue data available"
              ) || (
                <BarChart
                  data={revenueByRoomType}
                  index="type"
                  categories={["revenue"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Feedback</CardTitle>
              <CardDescription>Average ratings across different categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {renderChartContent(
                guestFeedback, 
                feedbackLoading, 
                feedbackError, 
                "No feedback data available"
              ) || (
                <BarChart
                  data={guestFeedback}
                  index="category"
                  categories={["rating"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `${value.toFixed(1)}/5`}
                  className="h-[400px]"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Download generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="py-4 text-center text-muted-foreground">Loading reports...</div>
              ) : reportsError ? (
                <div className="py-4 text-center text-red-500">{reportsError}</div>
              ) : filteredReports.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  {searchQuery ? "No reports match your search" : "No reports available"}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Last Generated</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.map((report, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {report.name}
                            </div>
                          </TableCell>
                          <TableCell>{report.format}</TableCell>
                          <TableCell>{report.lastGenerated}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
