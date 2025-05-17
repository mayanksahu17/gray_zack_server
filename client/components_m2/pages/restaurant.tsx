"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/ui/chart"
import axios from "axios"

interface Order {
  id: string
  type: string
  room?: string
  table?: string
  items: string
  time: string
  status: string
}

interface PopularItem {
  item: string
  orders: number
  revenue: string
}

interface SalesCategory {
  category: string
  sales: number
}

interface RestaurantData {
  activeOrders: Order[]
  popularItems: PopularItem[]
  salesByCategory: SalesCategory[]
}

interface ApiResponse {
  success: boolean
  data: {
    orders: Order[]
    popularItems?: PopularItem[]
    salesByCategory?: SalesCategory[]
  }
}

export default function RestaurantPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    activeOrders: [],
    popularItems: [],
    salesByCategory: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        console.log('Fetching restaurant data...')
        const response = await axios.get<ApiResponse>('http://localhost:8000/api/restaurants/67e8f522404a64803d0cea8d/orders')
        console.log('API Response:', response.data)

        if (response.data.success) {
          const newData = {
            activeOrders: response.data.data.orders || [],
            popularItems: response.data.data.popularItems || [],
            salesByCategory: response.data.data.salesByCategory || []
          }
          console.log('Processed Data:', newData)
          setRestaurantData(newData)
        } else {
          console.error('API returned unsuccessful response')
          setError('Failed to fetch restaurant data')
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch restaurant data')
        setLoading(false)
      }
    }

    fetchRestaurantData()
  }, [])

  const { activeOrders, popularItems, salesByCategory } = restaurantData

  console.log('Current State:', {
    activeOrders,
    popularItems,
    salesByCategory,
    loading,
    error
  })

  const filteredOrders = Array.isArray(activeOrders)
    ? activeOrders.filter((order) => {
        return (
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.room && order.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.table && order.table.toLowerCase().includes(searchTerm.toLowerCase())) ||
          order.items?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
      case "preparing":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Preparing</Badge>
      case "ready":
        return <Badge className="bg-green-500 hover:bg-green-600">Ready</Badge>
      case "served":
        return <Badge className="bg-green-500 hover:bg-green-600">Served</Badge>
      case "completed":
        return <Badge className="bg-gray-500 hover:bg-gray-600">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Restaurant & Room Service</h1>
        <p className="text-muted-foreground">Manage restaurant orders and room service requests.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          type="search" 
          placeholder="Search orders..." 
          className="pl-8" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Active Orders</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Orders</CardTitle>
              <CardDescription>Current restaurant and room service orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Room/Table</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.type}</TableCell>
                          <TableCell>{order.room || order.table}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>{order.time}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="popular" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Items</CardTitle>
              <CardDescription>Most ordered dishes and their revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(popularItems) && popularItems.length > 0 ? (
                      popularItems.map((item) => (
                        <TableRow key={item.item}>
                          <TableCell className="font-medium">{item.item}</TableCell>
                          <TableCell>{item.orders}</TableCell>
                          <TableCell>{item.revenue}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No popular items data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue breakdown by food category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {Array.isArray(salesByCategory) && salesByCategory.length > 0 ? (
                <BarChart
                  data={salesByCategory}
                  index="category"
                  categories={["sales"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  className="h-[400px]"
                />
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
