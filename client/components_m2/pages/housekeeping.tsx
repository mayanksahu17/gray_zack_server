"use client"

import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components_m2/ui/card"
import { Input } from "@/components_m2/ui/input"
import { Badge } from "@/components_m2/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components_m2/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m2/ui/tabs"
import { housekeepingData } from "@/lib/mock-data"
import { Progress } from "@/components_m2/ui/progress"

export default function HousekeepingPage() {
  const { tasks, maintenanceTickets, cleaningProgress } = housekeepingData

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "In Progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case "Pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge className="bg-red-500 hover:bg-red-600">{priority}</Badge>
      case "Medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{priority}</Badge>
      case "Low":
        return <Badge className="bg-green-500 hover:bg-green-600">{priority}</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const cleaningPercentage = Math.round((cleaningProgress.cleaned / cleaningProgress.total) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Housekeeping & Maintenance</h1>
        <p className="text-muted-foreground">Manage housekeeping tasks and maintenance tickets.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search tasks or tickets..." className="pl-8" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="col-span-4 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cleaning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{cleaningPercentage}%</div>
              <div className="text-sm text-muted-foreground">
                {cleaningProgress.cleaned} of {cleaningProgress.total} rooms cleaned
              </div>
            </div>
            <Progress className="mt-2" value={cleaningPercentage} />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <div>Cleaned: {cleaningProgress.cleaned}</div>
              <div>In Progress: {cleaningProgress.inProgress}</div>
              <div>Pending: {cleaningProgress.pending}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Housekeeping Tasks</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Tickets</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Housekeeping Tasks</CardTitle>
              <CardDescription>All assigned housekeeping tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task ID</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.id}</TableCell>
                        <TableCell>{task.room}</TableCell>
                        <TableCell>{task.type}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>{task.time}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Tickets</CardTitle>
              <CardDescription>All maintenance issues and tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.room}</TableCell>
                        <TableCell>{ticket.issue}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{ticket.reported}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
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
