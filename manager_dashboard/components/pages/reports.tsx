"use client"

import { Download, FileText, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { reportsData } from "@/lib/mock-data"
import { AreaChart, BarChart } from "@/components/ui/chart"

export default function ReportsPage() {
  const { occupancyTrend, revenueByRoomType, guestFeedback, availableReports } = reportsData

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h1>
        <p className="text-muted-foreground">View and download reports and analytics for your hotel.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search reports..." className="pl-8" />
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
              <AreaChart
                data={occupancyTrend}
                index="month"
                categories={["occupancy"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value}%`}
                className="h-[400px]"
              />
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
              <BarChart
                data={revenueByRoomType}
                index="type"
                categories={["revenue"]}
                colors={["blue"]}
                valueFormatter={(value) => `$${value.toLocaleString()}`}
                className="h-[400px]"
              />
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
              <BarChart
                data={guestFeedback}
                index="category"
                categories={["rating"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value.toFixed(1)}/5`}
                className="h-[400px]"
              />
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
                    {availableReports.map((report, index) => (
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
