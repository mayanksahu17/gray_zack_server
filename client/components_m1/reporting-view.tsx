"use client"

import { useEffect, useState } from "react"
import { Download, Filter, Printer, RefreshCw } from "lucide-react"

import { Button } from "@/components_m1/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m1/ui/card"
import { ChartContainer } from "@/components_m1/ui/chart"
import { DatePickerWithRange } from "@/components_m1/ui/date-picker-with-range"
import { Label } from "@/components_m1/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components_m1/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m1/ui/tabs"
import { DateRange as DayPickerDateRange } from "react-day-picker"
import { 
  getDashboardSummary, 
  getOccupancyByRoomType,
  getRevenueByRoomType,
  getDailyOccupancyAndRevenue,
  getBookingSources,
  type DashboardSummary,
  type RoomTypeOccupancy,
  type RoomTypeRevenue,
  type DailyMetrics,
  type DateRange as ApiDateRange
} from "../app/api/analytics"

export function ReportingView() {
  // Current hotel ID - in a real app, this would come from context or URL params
  const hotelId = "65f3c3dddad15237f36f22d9" // Example hotel ID
  
  // Date range state
  const [dateRange, setDateRange] = useState<DayPickerDateRange>({
    from: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Last 10 days
    to: new Date()
  })

  // Report type state
  const [reportType, setReportType] = useState("occupancy")
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Data states
  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null)
  const [occupancyByRoomType, setOccupancyByRoomType] = useState<RoomTypeOccupancy[]>([])
  const [revenueByRoomType, setRevenueByRoomType] = useState<RoomTypeRevenue[]>([])
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([])
  
  // Convert to API date range format
  const getApiDateRange = (): ApiDateRange | undefined => {
    if (!dateRange.from || !dateRange.to) return undefined;
    return {
      from: dateRange.from,
      to: dateRange.to
    };
  };
  
  // Fetch dashboard data when component mounts or date range changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!dateRange.from || !dateRange.to) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch all required data
        const apiDateRange = getApiDateRange();
        const [summary, occupancyData, revenueData, dailyData] = await Promise.all([
          getDashboardSummary(hotelId, apiDateRange).catch(() => getFallbackSummary()),
          getOccupancyByRoomType(hotelId).catch(() => getFallbackOccupancy()),
          getRevenueByRoomType(hotelId, apiDateRange).catch(() => getFallbackRevenue()),
          getDailyOccupancyAndRevenue(hotelId, apiDateRange).catch(() => getFallbackDailyMetrics())
        ])
        
        setSummaryData(summary)
        setOccupancyByRoomType(occupancyData)
        setRevenueByRoomType(revenueData)
        setDailyMetrics(dailyData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load analytics data. Using fallback data for demonstration purposes.")
        
        // Set fallback data
        setSummaryData(getFallbackSummary())
        setOccupancyByRoomType(getFallbackOccupancy())
        setRevenueByRoomType(getFallbackRevenue())
        setDailyMetrics(getFallbackDailyMetrics())
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [hotelId, dateRange])
  
  // Function to refresh data
  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch all required data
      const apiDateRange = getApiDateRange();
      const [summary, occupancyData, revenueData, dailyData] = await Promise.all([
        getDashboardSummary(hotelId, apiDateRange).catch(() => getFallbackSummary()),
        getOccupancyByRoomType(hotelId).catch(() => getFallbackOccupancy()),
        getRevenueByRoomType(hotelId, apiDateRange).catch(() => getFallbackRevenue()),
        getDailyOccupancyAndRevenue(hotelId, apiDateRange).catch(() => getFallbackDailyMetrics())
      ])
      
      setSummaryData(summary)
      setOccupancyByRoomType(occupancyData)
      setRevenueByRoomType(revenueData)
      setDailyMetrics(dailyData)
    } catch (err) {
      console.error("Error refreshing dashboard data:", err)
      setError("Failed to refresh analytics data. Using fallback data for demonstration purposes.")
      
      // Set fallback data
      setSummaryData(getFallbackSummary())
      setOccupancyByRoomType(getFallbackOccupancy())
      setRevenueByRoomType(getFallbackRevenue())
      setDailyMetrics(getFallbackDailyMetrics())
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fallback data functions for demonstration
  const getFallbackSummary = (): DashboardSummary => ({
    occupancyRate: 76.4,
    totalRooms: 100,
    occupiedRooms: 76,
    adr: 189.5,
    revpar: 144.78,
    totalRevenue: 42856,
    todayRevenue: 4320
  })
  
  const getFallbackOccupancy = (): RoomTypeOccupancy[] => [
    { roomType: 'standard', totalRooms: 50, occupiedRooms: 42, occupancyRate: 84 },
    { roomType: 'deluxe', totalRooms: 30, occupiedRooms: 22, occupancyRate: 73.3 },
    { roomType: 'suite', totalRooms: 15, occupiedRooms: 10, occupancyRate: 66.7 },
    { roomType: 'Accessible', totalRooms: 5, occupiedRooms: 2, occupancyRate: 40 }
  ]
  
  const getFallbackRevenue = (): RoomTypeRevenue[] => [
    { roomType: 'standard', roomRevenue: 15000, fbRevenue: 5500, otherRevenue: 2200, totalRevenue: 22700, count: 42 },
    { roomType: 'deluxe', roomRevenue: 12500, fbRevenue: 4200, otherRevenue: 1800, totalRevenue: 18500, count: 22 },
    { roomType: 'suite', roomRevenue: 9500, fbRevenue: 3500, otherRevenue: 1500, totalRevenue: 14500, count: 10 },
    { roomType: 'Accessible', roomRevenue: 1500, fbRevenue: 800, otherRevenue: 400, totalRevenue: 2700, count: 2 }
  ]
  
  const getFallbackDailyMetrics = (): DailyMetrics[] => {
    const today = new Date()
    return Array.from({ length: 10 }).map((_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (9 - i))
      return {
        date: date.toISOString().split('T')[0],
        occupancyRate: 65 + Math.floor(Math.random() * 20),
        adr: 180 + Math.floor(Math.random() * 20),
        revenue: 4500 + Math.floor(Math.random() * 1500)
      }
    })
  }
  
  // Handler for report generation
  const handleGenerateReport = () => {
    // This would trigger a more detailed report based on the selected type
    console.log(`Generating ${reportType} report for date range:`, dateRange)
  }

  // Format date for display
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return ""
    
    const fromDate = dateRange.from.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
    
    const toDate = dateRange.to.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
    
    return `${fromDate} - ${toDate}`
  }
  
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount)
  }
  
  // Helper to format percentage
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <Label>Date Range</Label>
          <DatePickerWithRange 
            className="w-full max-w-sm" 
            date={dateRange}
            onSelect={(range) => range && setDateRange(range)}
          />
        </div>
        <div className="flex gap-2">
          <div>
            <Label htmlFor="report-type" className="sr-only">
              Report Type
            </Label>
            <Select 
              value={reportType} 
              onValueChange={setReportType}
            >
              <SelectTrigger id="report-type" className="w-[180px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="occupancy">Occupancy</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="adr">ADR</SelectItem>
                <SelectItem value="revpar">RevPAR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-4 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : (
                    summaryData ? formatPercentage(summaryData.occupancyRate) : '0%'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryData?.occupiedRooms || 0} of {summaryData?.totalRooms || 0} rooms occupied
                </p>
                <div className="mt-4 h-[80px]">
                  <ChartContainer
                    className="h-full w-full"
                    config={{
                      grid: {
                        x: {
                          show: false,
                        },
                        y: {
                          show: false,
                        },
                      },
                      xAxis: {
                        type: "category",
                        show: false,
                      },
                      yAxis: {
                        show: false,
                        min: 0,
                        max: 100,
                      },
                      tooltip: {
                        show: false,
                      },
                    }}
                    series={[
                      {
                        type: "line",
                        data: dailyMetrics.map(day => day.occupancyRate),
                        smooth: true,
                        lineStyle: {
                          color: "hsl(var(--primary))",
                          width: 2,
                        },
                        itemStyle: {
                          color: "hsl(var(--primary))",
                        },
                      },
                    ]}
                  >
                    <div className="h-full w-full" />
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : (
                    summaryData ? formatCurrency(summaryData.adr) : '$0.00'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per occupied room
                </p>
                <div className="mt-4 h-[80px]">
                  <ChartContainer
                    className="h-full w-full"
                    config={{
                      grid: {
                        x: {
                          show: false,
                        },
                        y: {
                          show: false,
                        },
                      },
                      xAxis: {
                        type: "category",
                        show: false,
                      },
                      yAxis: {
                        show: false,
                      },
                      tooltip: {
                        show: false,
                      },
                    }}
                    series={[
                      {
                        type: "line",
                        data: dailyMetrics.map(day => day.adr),
                        smooth: true,
                        lineStyle: {
                          color: "hsl(var(--primary))",
                          width: 2,
                        },
                        itemStyle: {
                          color: "hsl(var(--primary))",
                        },
                      },
                    ]}
                  >
                    <div className="h-full w-full" />
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : (
                    summaryData ? formatCurrency(summaryData.revpar) : '$0.00'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue Per Available Room
                </p>
                <div className="mt-4 h-[80px]">
                  <ChartContainer
                    className="h-full w-full"
                    config={{
                      grid: {
                        x: {
                          show: false,
                        },
                        y: {
                          show: false,
                        },
                      },
                      xAxis: {
                        type: "category",
                        show: false,
                      },
                      yAxis: {
                        show: false,
                      },
                      tooltip: {
                        show: false,
                      },
                    }}
                    series={[
                      {
                        type: "line",
                        data: dailyMetrics.map(day => 
                          (day.revenue / (summaryData?.totalRooms || 1))
                        ),
                        smooth: true,
                        lineStyle: {
                          color: "hsl(var(--primary))",
                          width: 2,
                        },
                        itemStyle: {
                          color: "hsl(var(--primary))",
                        },
                      },
                    ]}
                  >
                    <div className="h-full w-full" />
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? 'Loading...' : (
                    summaryData ? formatCurrency(summaryData.totalRevenue) : '$0.00'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryData?.todayRevenue ? `+${formatCurrency(summaryData.todayRevenue)} today` : 'No revenue today'}
                </p>
                <div className="mt-4 h-[80px]">
                  <ChartContainer
                    className="h-full w-full"
                    config={{
                      grid: {
                        x: {
                          show: false,
                        },
                        y: {
                          show: false,
                        },
                      },
                      xAxis: {
                        type: "category",
                        show: false,
                      },
                      yAxis: {
                        show: false,
                      },
                      tooltip: {
                        show: false,
                      },
                    }}
                    series={[
                      {
                        type: "line",
                        data: dailyMetrics.map(day => day.revenue),
                        smooth: true,
                        lineStyle: {
                          color: "hsl(var(--primary))",
                          width: 2,
                        },
                        itemStyle: {
                          color: "hsl(var(--primary))",
                        },
                      },
                    ]}
                  >
                    <div className="h-full w-full" />
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Occupancy by Room Type</CardTitle>
                <CardDescription>{formatDateRange()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  ) : occupancyByRoomType.length > 0 ? (
                  <ChartContainer
                    className="h-full w-full"
                    config={{
                      tooltip: {
                        trigger: "item",
                          formatter: "{b}: {c} rooms ({d}%)"
                      },
                      legend: {
                        orient: "vertical",
                        right: 10,
                        top: "center",
                          formatter: "{name}"
                        },
                      }}
                    >
                      {/* Chart requires children */}
                      <div className="h-full">
                        {/* Pie chart data would be processed here */}
                        {JSON.stringify(occupancyByRoomType.map(item => ({
                          value: item.occupiedRooms,
                          name: item.roomType.charAt(0).toUpperCase() + item.roomType.slice(1)
                        })))}
                      </div>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No occupancy data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>{formatDateRange()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                  ) : revenueByRoomType.length > 0 ? (
                  <ChartContainer
                    className="h-full w-full"
                    config={{
                      tooltip: {
                        trigger: "axis",
                        axisPointer: {
                            type: "shadow"
                          },
                          formatter: function(params: any) {
                            let total = 0;
                            let result = `${params[0].name}<br/>`;
                            
                            params.forEach((param: any) => {
                              total += param.value;
                              result += `${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
                            });
                            
                            result += `<strong>Total: ${formatCurrency(total)}</strong>`;
                            return result;
                          }
                      },
                      legend: {
                          data: ["Room Revenue", "F&B Revenue", "Other Revenue"]
                      },
                      grid: {
                        left: "3%",
                        right: "4%",
                        bottom: "3%",
                          containLabel: true
                      },
                      xAxis: {
                        type: "value",
                          axisLabel: {
                            formatter: (value: number) => formatCurrency(value)
                          }
                      },
                      yAxis: {
                        type: "category",
                          data: revenueByRoomType.map(item => 
                            item.roomType.charAt(0).toUpperCase() + item.roomType.slice(1)
                          )
                        },
                      }}
                    >
                      {/* Chart requires children */}
                      <div className="h-full">
                        {/* Stack bar chart data would be processed here */}
                        {JSON.stringify({
                          roomRevenue: revenueByRoomType.map(item => item.roomRevenue),
                          fbRevenue: revenueByRoomType.map(item => item.fbRevenue),
                          otherRevenue: revenueByRoomType.map(item => item.otherRevenue)
                        })}
                      </div>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No revenue data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Occupancy & Revenue</CardTitle>
              <CardDescription>{formatDateRange()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                ) : dailyMetrics.length > 0 ? (
                <ChartContainer
                  className="h-full w-full"
                  config={{
                    tooltip: {
                      trigger: "axis",
                      axisPointer: {
                        type: "cross",
                        crossStyle: {
                          color: "#999"
                        }
                      },
                      formatter: function(params: any) {
                        let result = `${params[0].name}<br/>`;
                        
                        params.forEach((param: any) => {
                          if (param.seriesName === "Occupancy Rate") {
                            result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`;
                          } else if (param.seriesName === "ADR") {
                            result += `${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
                          } else if (param.seriesName === "Room Revenue") {
                            result += `${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
                          } else if (param.seriesName === "Additional Revenue") {
                            result += `${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
                          } else if (param.seriesName === "Total Revenue") {
                            result += `<strong>${param.seriesName}: ${formatCurrency(param.value)}</strong><br/>`;
                          }
                        });
                        
                        return result;
                      }
                    },
                    legend: {
                      data: ["Occupancy Rate", "ADR", "Room Revenue", "Additional Revenue", "Total Revenue"]
                    },
                    xAxis: [
                      {
                        type: "category",
                        data: dailyMetrics.map(day => {
                          const date = new Date(day.date);
                          return date.toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric" 
                          });
                        }),
                        axisPointer: {
                          type: "shadow"
                        }
                      }
                    ],
                    yAxis: [
                      {
                        type: "value",
                        name: "Occupancy",
                        min: 0,
                        max: 100,
                        interval: 20,
                        axisLabel: {
                          formatter: "{value}%"
                        }
                      },
                      {
                        type: "value",
                        name: "Revenue",
                        min: 0,
                        axisLabel: {
                          formatter: "${value}"
                        }
                      }
                    ],
                    series: [
                    {
                      name: "Occupancy Rate",
                        type: "line",
                        yAxisIndex: 0,
                        data: dailyMetrics.map(day => day.occupancyRate),
                        itemStyle: {
                          color: "#3B82F6"
                        }
                    },
                    {
                      name: "ADR",
                      type: "line",
                      yAxisIndex: 1,
                        data: dailyMetrics.map(day => day.adr),
                        itemStyle: {
                          color: "#10B981"
                        }
                      },
                      {
                        name: "Room Revenue",
                        type: "bar",
                        yAxisIndex: 1,
                        stack: "revenue",
                        data: dailyMetrics.map(day => day.roomRevenue || (day.revenue * 0.75)), // Estimate if not available
                        itemStyle: {
                          color: "#7C3AED"
                        }
                      },
                      {
                        name: "Additional Revenue",
                        type: "bar",
                        yAxisIndex: 1,
                        stack: "revenue",
                        data: dailyMetrics.map(day => day.additionalRevenue || (day.revenue * 0.25)), // Estimate if not available
                        itemStyle: {
                          color: "#EC4899"
                        }
                      },
                      {
                        name: "Total Revenue",
                      type: "line",
                      yAxisIndex: 1,
                        data: dailyMetrics.map(day => day.revenue),
                        lineStyle: {
                          type: "dashed",
                          color: "#F59E0B"
                        },
                        itemStyle: {
                          color: "#F59E0B"
                        }
                      }
                    ]
                  }}
                >
                  <div className="h-full">
                    {/* Data is now directly in the config */}
                  </div>
                </ChartContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No daily metrics available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="occupancy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Reports</CardTitle>
              <CardDescription>Detailed occupancy analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Select specific occupancy reports from the filters above.</p>
              
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-muted-foreground">Loading occupancy data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-4 text-left">Room Type</th>
                        <th className="py-2 px-4 text-left">Total Rooms</th>
                        <th className="py-2 px-4 text-left">Occupied</th>
                        <th className="py-2 px-4 text-left">Occupancy Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {occupancyByRoomType.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{item.roomType.charAt(0).toUpperCase() + item.roomType.slice(1)}</td>
                          <td className="py-2 px-4">{item.totalRooms}</td>
                          <td className="py-2 px-4">{item.occupiedRooms}</td>
                          <td className="py-2 px-4">{formatPercentage(item.occupancyRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Reports</CardTitle>
              <CardDescription>Detailed revenue analytics for {formatDateRange()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Revenue breakdown by room type and service category.</p>
              
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-muted-foreground">Loading revenue data...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">Room Type</th>
                          <th className="py-2 px-4 text-left">Room Revenue</th>
                          <th className="py-2 px-4 text-left">F&B Revenue</th>
                          <th className="py-2 px-4 text-left">Other Revenue</th>
                          <th className="py-2 px-4 text-left">Total</th>
                          <th className="py-2 px-4 text-left">Room Nights</th>
                          <th className="py-2 px-4 text-left">ADR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueByRoomType.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4">{item.roomType.charAt(0).toUpperCase() + item.roomType.slice(1)}</td>
                            <td className="py-2 px-4">{formatCurrency(item.roomRevenue)}</td>
                            <td className="py-2 px-4">{formatCurrency(item.fbRevenue)}</td>
                            <td className="py-2 px-4">{formatCurrency(item.otherRevenue)}</td>
                            <td className="py-2 px-4 font-medium">{formatCurrency(item.totalRevenue)}</td>
                            <td className="py-2 px-4">{item.count}</td>
                            <td className="py-2 px-4">{formatCurrency(item.count > 0 ? item.roomRevenue / item.count : 0)}</td>
                          </tr>
                        ))}
                        {revenueByRoomType.length > 0 && (
                          <tr className="bg-gray-50">
                            <td className="py-2 px-4 font-medium">Total</td>
                            <td className="py-2 px-4 font-medium">
                              {formatCurrency(revenueByRoomType.reduce((sum, item) => sum + item.roomRevenue, 0))}
                            </td>
                            <td className="py-2 px-4 font-medium">
                              {formatCurrency(revenueByRoomType.reduce((sum, item) => sum + item.fbRevenue, 0))}
                            </td>
                            <td className="py-2 px-4 font-medium">
                              {formatCurrency(revenueByRoomType.reduce((sum, item) => sum + item.otherRevenue, 0))}
                            </td>
                            <td className="py-2 px-4 font-medium">
                              {formatCurrency(revenueByRoomType.reduce((sum, item) => sum + item.totalRevenue, 0))}
                            </td>
                            <td className="py-2 px-4 font-medium">
                              {revenueByRoomType.reduce((sum, item) => sum + item.count, 0)}
                            </td>
                            <td className="py-2 px-4 font-medium">
                              {formatCurrency(
                                revenueByRoomType.reduce((sum, item) => sum + item.count, 0) > 0 
                                  ? revenueByRoomType.reduce((sum, item) => sum + item.roomRevenue, 0) / 
                                    revenueByRoomType.reduce((sum, item) => sum + item.count, 0)
                                  : 0
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Daily Revenue Breakdown</h3>
                    <div className="h-[400px]">
                      <ChartContainer
                        className="h-full w-full"
                        config={{
                          tooltip: {
                            trigger: "axis",
                            axisPointer: {
                              type: "shadow"
                            },
                            formatter: function(params: any) {
                              const date = params[0].name;
                              let total = 0;
                              let result = `${date}<br/>`;
                              
                              params.forEach((param: any) => {
                                if (param.seriesName !== "Total") {
                                  total += param.value;
                                  result += `${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
                                }
                              });
                              
                              result += `<strong>Total: ${formatCurrency(total)}</strong>`;
                              return result;
                            }
                          },
                          legend: {
                            data: ["Room Revenue", "F&B Revenue", "Other Revenue"]
                          },
                          xAxis: {
                            type: "category",
                            data: dailyMetrics.map(day => {
                              const date = new Date(day.date);
                              return date.toLocaleDateString("en-US", { 
                                month: "short", 
                                day: "numeric" 
                              });
                            })
                          },
                          yAxis: {
                            type: "value",
                            name: "Revenue",
                            axisLabel: {
                              formatter: "${value}"
                            }
                          },
                          series: [
                            {
                              name: "Room Revenue",
                              type: "bar",
                              stack: "revenue",
                              emphasis: {
                                focus: "series"
                              },
                              data: dailyMetrics.map(day => day.roomRevenue || (day.revenue * 0.7)),
                              itemStyle: {
                                color: "#7C3AED"
                              }
                            },
                            {
                              name: "F&B Revenue",
                              type: "bar",
                              stack: "revenue",
                              emphasis: {
                                focus: "series"
                              },
                              data: dailyMetrics.map(day => 
                                day.additionalRevenue 
                                  ? day.additionalRevenue * 0.6 
                                  : day.revenue * 0.2
                              ),
                              itemStyle: {
                                color: "#EC4899"
                              }
                            },
                            {
                              name: "Other Revenue",
                              type: "bar",
                              stack: "revenue",
                              emphasis: {
                                focus: "series"
                              },
                              data: dailyMetrics.map(day => 
                                day.additionalRevenue 
                                  ? day.additionalRevenue * 0.4 
                                  : day.revenue * 0.1
                              ),
                              itemStyle: {
                                color: "#F59E0B"
                              }
                            }
                          ]
                        }}
                      >
                        <div className="h-full" />
                      </ChartContainer>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Reports</CardTitle>
              <CardDescription>Detailed guest analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Guest analytics features are coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


