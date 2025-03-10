"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Filter, MoreHorizontal, Plus, RefreshCw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RoomManagementView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterFloor, setFilterFloor] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState("grid")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would filter the rooms
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-500"
      case "Occupied":
        return "bg-red-500"
      case "Cleaning":
        return "bg-yellow-500"
      case "Maintenance":
        return "bg-blue-500"
      case "Out of Order":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const renderGridView = () => {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden">
            <div className={`h-2 w-full ${getStatusColor(room.status)}`} />
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold">Room {room.number}</div>
                  <div className="text-sm text-muted-foreground">{room.type}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Room Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Cleaning</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Maintenance</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Available</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">Mark as Out of Order</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Floor:</span>
                  <span>{room.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">{room.status}</span>
                </div>
                {room.status === "Occupied" && (
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <span>{room.guest}</span>
                  </div>
                )}
                {room.status === "Occupied" && (
                  <div className="flex justify-between">
                    <span>Checkout:</span>
                    <span>{room.checkout}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1">
                  {room.status === "Available" ? "Assign" : "Details"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  {room.status === "Occupied" ? "Checkout" : "Update"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderListView = () => {
    return (
      <div className="rounded-md border">
        <div className="grid grid-cols-7 border-b bg-muted p-3 text-sm font-medium">
          <div>Room</div>
          <div>Type</div>
          <div>Floor</div>
          <div>Status</div>
          <div>Guest</div>
          <div>Checkout</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y">
          {rooms.map((room) => (
            <div key={room.id} className="grid grid-cols-7 items-center p-3 text-sm">
              <div className="font-medium">Room {room.number}</div>
              <div>{room.type}</div>
              <div>{room.floor}</div>
              <div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(room.status)}`} />
                  <span>{room.status}</span>
                </div>
              </div>
              <div>{room.guest || "-"}</div>
              <div>{room.checkout || "-"}</div>
              <div className="flex justify-end gap-2">
                <Button size="sm">{room.status === "Available" ? "Assign" : "Details"}</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Room Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Cleaning</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Maintenance</DropdownMenuItem>
                    <DropdownMenuItem>Mark as Available</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">Mark as Out of Order</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar View</span>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Room</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Room Status Overview</CardTitle>
          <CardDescription>Current room availability and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="rounded-lg bg-green-100 p-4 text-center dark:bg-green-900">
              <div className="text-sm font-medium text-green-800 dark:text-green-100">Available</div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-100">24</div>
            </div>
            <div className="rounded-lg bg-red-100 p-4 text-center dark:bg-red-900">
              <div className="text-sm font-medium text-red-800 dark:text-red-100">Occupied</div>
              <div className="text-2xl font-bold text-red-800 dark:text-red-100">42</div>
            </div>
            <div className="rounded-lg bg-yellow-100 p-4 text-center dark:bg-yellow-900">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-100">Cleaning</div>
              <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-100">8</div>
            </div>
            <div className="rounded-lg bg-blue-100 p-4 text-center dark:bg-blue-900">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-100">Maintenance</div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-100">2</div>
            </div>
            <div className="rounded-lg bg-gray-100 p-4 text-center dark:bg-gray-800">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Out of Order</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">1</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            <div>
              <Label htmlFor="floor-filter" className="sr-only">
                Floor
              </Label>
              <Select value={filterFloor} onValueChange={setFilterFloor}>
                <SelectTrigger id="floor-filter" className="w-[120px]">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  <SelectItem value="1">1st Floor</SelectItem>
                  <SelectItem value="2">2nd Floor</SelectItem>
                  <SelectItem value="3">3rd Floor</SelectItem>
                  <SelectItem value="4">4th Floor</SelectItem>
                  <SelectItem value="5">5th Floor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter" className="sr-only">
                Room Type
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="type-filter" className="w-[150px]">
                  <SelectValue placeholder="Room Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter" className="sr-only">
                Status
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status-filter" className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out-of-order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="occupied">Occupied</TabsTrigger>
            <TabsTrigger value="cleaning">Cleaning</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="out-of-order">Out of Order</TabsTrigger>
          </TabsList>
          <div className="mt-4 flex justify-end">
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>
          <TabsContent value="all" className="mt-2">
            {viewMode === "grid" ? renderGridView() : renderListView()}
          </TabsContent>
          {/* Other tabs would have similar content filtered by status */}
        </Tabs>
      </div>
    </div>
  )
}

// Sample data
const rooms = [
  {
    id: "room1",
    number: "101",
    type: "Standard Queen",
    floor: "1st",
    status: "Occupied",
    guest: "John Smith",
    checkout: "Mar 12",
  },
  {
    id: "room2",
    number: "102",
    type: "Standard Twin",
    floor: "1st",
    status: "Available",
    guest: null,
    checkout: null,
  },
  {
    id: "room3",
    number: "103",
    type: "Standard King",
    floor: "1st",
    status: "Cleaning",
    guest: null,
    checkout: null,
  },
  {
    id: "room4",
    number: "201",
    type: "Deluxe Queen",
    floor: "2nd",
    status: "Occupied",
    guest: "Sarah Williams",
    checkout: "Mar 11",
  },
  {
    id: "room5",
    number: "202",
    type: "Deluxe King",
    floor: "2nd",
    status: "Available",
    guest: null,
    checkout: null,
  },
  {
    id: "room6",
    number: "203",
    type: "Deluxe Twin",
    floor: "2nd",
    status: "Maintenance",
    guest: null,
    checkout: null,
  },
  {
    id: "room7",
    number: "301",
    type: "Junior Suite",
    floor: "3rd",
    status: "Occupied",
    guest: "Michael Johnson",
    checkout: "Mar 13",
  },
  {
    id: "room8",
    number: "302",
    type: "Executive Suite",
    floor: "3rd",
    status: "Occupied",
    guest: "Emily Davis",
    checkout: "Mar 10",
  },
  {
    id: "room9",
    number: "303",
    type: "Deluxe King",
    floor: "3rd",
    status: "Available",
    guest: null,
    checkout: null,
  },
  {
    id: "room10",
    number: "401",
    type: "Presidential Suite",
    floor: "4th",
    status: "Out of Order",
    guest: null,
    checkout: null,
  },
  {
    id: "room11",
    number: "402",
    type: "Executive Suite",
    floor: "4th",
    status: "Available",
    guest: null,
    checkout: null,
  },
  {
    id: "room12",
    number: "403",
    type: "Junior Suite",
    floor: "4th",
    status: "Cleaning",
    guest: null,
    checkout: null,
  },
]

