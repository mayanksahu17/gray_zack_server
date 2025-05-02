"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ArrowLeft, Printer, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OrderSuccessProps {
  orderId: string
  onBackToOrders?: () => void
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  subtotal: number
  notes?: string
  modifiers?: string[]
  size?: string
  addons?: string[]
  cookingPreference?: string
  specialInstructions?: string
}

interface OrderDetails {
  id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  tax: number
  tip?: number
  specialInstructions?: string
  customer: {
    name: string
    phone?: string
    email?: string
    address?: string
  }
  room?: {
    number: string
    guest: string
    checkIn: string
  }
  table?: {
    number: string
    location: string
  }
  status: string
  createdAt: string
}

export default function OrderSuccess({ orderId, onBackToOrders }: OrderSuccessProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
<<<<<<< HEAD
        const restaurantId = "67e8f522404a64803d0cea8d"; // Added missing restaurantId
        const response = await fetch(`http://localhost:8000/api/v1/admin/hotel/restaurant/${restaurantId}/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
=======
        const response = await fetch(
          `http://localhost:8000/api/v1/admin/hotel/restaurant/67e8f522404a64803d0cea8d/orders/67ef81567420feb65107a50c`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
        const data = await response.json()
>>>>>>> d0e37ebdb043190be077f21263f4e9fadf38c5cc
        
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch order details")
        }
        
        setOrder(data.data)
      } catch (error) {
        console.error("Error fetching order details:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch order details")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

<<<<<<< HEAD
  // Function to handle saving an order
  // const saveOrder = async (orderData: any) => {
  //   try {
  //     const response = await fetch('http://localhost:8000/api/orders', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(orderData),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to save order');
  //     }
      
  //     const data = await response.json();
  //     return data;
  //   } catch (error) {
  //     console.error("Error saving order:", error);
  //     throw error;
  //   }
  // };

  const handlePrintReceipt = () => {
    // Implement receipt printing logic
    window.print();
  };

  const handleEmailReceipt = () => {
    if (!order?.customer.email) {
      toast({
        title: "No email available",
        description: "Customer email is not provided for this order.",
        variant: "destructive",
      });
      return;
    }
    // Implement email receipt logic
    console.log("Emailing receipt for order:", order);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
=======
  if (loading) {
>>>>>>> d0e37ebdb043190be077f21263f4e9fadf38c5cc
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-xl text-muted-foreground">Loading order details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-20">
            <div className="flex flex-col items-center space-y-4 text-destructive">
              <p className="text-xl">Error: {error || "Order not found"}</p>
              {onBackToOrders && (
                <Button onClick={onBackToOrders} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 text-xl">
        {onBackToOrders && (
          <Button variant="ghost" size="sm" onClick={onBackToOrders} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-green-600">Order Successfully Placed!</h1>
                  <p className="text-muted-foreground mt-1">Order #{order.orderNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Order placed on {new Date(order.createdAt).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <div className="font-medium">
                            {item.quantity}x {item.name}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            {item.size && <span>Size: {item.size.charAt(0).toUpperCase() + item.size.slice(1)}</span>}
                            {item.addons && item.addons.length > 0 && <div>Add-ons: {item.addons.join(", ")}</div>}
                            {item.cookingPreference && <div>Cooking: {item.cookingPreference}</div>}
                            {item.specialInstructions && <div>Note: {item.specialInstructions}</div>}
                          </div>
                        </div>
                        <div className="font-medium">${item.subtotal.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(order.total - order.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  {order.tip && order.tip > 0 && (
                    <div className="flex justify-between">
                      <span>Tip</span>
                      <span>${order.tip.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Room & Table Info */}
            <div className="space-y-6">
              {/* Room Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.room ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Room {order.room.number}</h3>
                          <p className="text-sm text-muted-foreground">
                            Guest: {order.room.guest}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Check-in: {new Date(order.room.checkIn).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge>Room Service</Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No room information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Table Information */}
              {order.table && (
                <Card>
                  <CardHeader>
                    <CardTitle>Table Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Table {order.table.number}</h3>
                          <p className="text-sm text-muted-foreground">
                            Location: {order.table.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span>Current Status</span>
                    <Badge 
                      variant={order.status === "COMPLETED" ? "default" : "secondary"}
                      className="text-base px-4 py-1"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
