"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import axios from "axios"

interface Room {
  room: string
  type: string
  status: string
  guest: string | null
  checkOut: string | null
}

interface InventoryItem {
  item: string
  stock: number
  reorderLevel: number
  status: string
}

interface RoomsData {
  roomStatus: Room[]
  inventory: InventoryItem[]
}

export default function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roomsData, setRoomsData] = useState<RoomsData>({
    roomStatus: [],
    inventory: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/room/status')
        setRoomsData(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch rooms data')
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const { roomStatus, inventory } = roomsData

  const filteredRooms = roomStatus.filter((room) => {
    return (
      room.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.guest && room.guest.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  const filteredInventory = inventory.filter((item) => {
    return item.item.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>
      case "occupied":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Occupied</Badge>
      case "maintenance":
        return <Badge className="bg-red-500 hover:bg-red-600">Maintenance</Badge>
      case "cleaning":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Cleaning</Badge>
      case "out of order":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Out of Order</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getInventoryStatusBadge = (status: string) => {
    switch (status) {
      case "Adequate":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "Low":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      case "Critical":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const lowInventoryItems = inventory.filter((item) => item.status !== "Adequate")

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Room & Inventory Management</h1>
        <p className="text-muted-foreground">Manage your hotel rooms and inventory in one place.</p>
      </div>

      {lowInventoryItems.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">Low Inventory Alert</AlertTitle>
          <AlertDescription>
            {lowInventoryItems.length} items are running low and need to be restocked.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search rooms or inventory..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="rooms">
        <TabsList>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Status</CardTitle>
              <CardDescription>Current status of all hotel rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filteredRooms.map((room) => (
                  <Card key={room.room} className="overflow-hidden">
                    <div
                      className={`h-2 w-full ${
                        room.status === "occupied"
                          ? "bg-blue-500"
                          : room.status === "available"
                            ? "bg-green-500"
                            : room.status === "cleaning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                      }`}
                    />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-bold">Room {room.room}</div>
                        {getStatusBadge(room.status)}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{room.type}</div>
                      {room.guest && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground">Guest</div>
                          <div className="text-sm">{room.guest}</div>
                        </div>
                      )}
                      {room.checkOut && (
                        <div className="mt-1">
                          <div className="text-xs text-muted-foreground">Check-out</div>
                          <div className="text-sm">{room.checkOut}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>Current inventory levels and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Reorder Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.item}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                        <TableCell>{item.reorderLevel}</TableCell>
                        <TableCell>{getInventoryStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" disabled={item.status === "Adequate"}>
                            Reorder
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
