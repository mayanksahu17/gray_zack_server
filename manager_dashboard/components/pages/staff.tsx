"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { staffData } from "@/lib/mock-data"
import { BarChart, PieChart } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"

export default function StaffPage() {
  const { staff, performanceByRole, staffByShift } = staffData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "On Duty":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "Off Duty":
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPerformanceBadge = (performance: number) => {
    if (performance >= 90) {
      return <Badge className="bg-green-500 hover:bg-green-600">Excellent</Badge>
    } else if (performance >= 80) {
      return <Badge className="bg-blue-500 hover:bg-blue-600">Good</Badge>
    } else if (performance >= 70) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Average</Badge>
    } else {
      return <Badge className="bg-red-500 hover:bg-red-600">Needs Improvement</Badge>
    }
  }

  const shiftData = [
    { shift: "Morning", count: staffByShift.morning },
    { shift: "Evening", count: staffByShift.evening },
    { shift: "Night", count: staffByShift.night },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Performance</h1>
        <p className="text-muted-foreground">Manage and monitor staff performance and schedules.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search staff..." className="pl-8" />
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff List</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="shifts">Shift Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="staff" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>All staff members and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.id}</TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>{member.shift}</TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={member.performance} className="h-2 w-20" />
                            <span className="text-sm">{member.performance}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Role</CardTitle>
              <CardDescription>Average performance metrics by staff role</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <BarChart
                data={performanceByRole}
                index="role"
                categories={["performance"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value}%`}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shifts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff by Shift</CardTitle>
              <CardDescription>Distribution of staff across different shifts</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <PieChart
                data={shiftData}
                index="shift"
                categories={["count"]}
                colors={["blue", "indigo", "violet"]}
                valueFormatter={(value) => `${value} staff`}
                className="h-[400px]"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
