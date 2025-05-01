"use client"

import { useState } from "react"
import { ArrowLeft, Home, X, CheckCircle, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
// import { BASE_URL as API_BASE_URL } from "@/lib/constants"

interface Booking {
  _id: string
  roomId: {
    _id: string
    roomNumber: string
    floor: string
  }
  guestId: {
    _id: string
    firstName: string
    lastName: string
    personalInfo: {
      firstName: string
      lastName: string
      phone?: string
      email?: string
    }
  }
  checkIn: string
  expectedCheckOut: string
  status: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
  modifiers?: string[]
  subtotal: number
  size?: string
  addons?: string[]
  cookingPreference?: string
  specialInstructions?: string
}

interface OrderDetails {
  orderId?: string
  items: OrderItem[]
  total: number
  tax: number
  tip?: number
  specialInstructions?: string
  paymentMethod: string
}

interface FormEvent extends React.FormEvent {
  preventDefault(): void
}

interface Table {
  _id: string
  tableNumber: string
  status: string
  location: string
  capacity: number
  features: string[]
}

export default function Checkout({ order, onComplete, onBack } : any) {
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [activeBookings, setActiveBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false)
  const { toast } = useToast()

  // Function to fetch tables data
  const fetchTables = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/admin/hotel/restaurant/67e8f522404a64803d0cea8d/tables",
      )
      const data = await response.json()
      if (data.success) {
        setTables(data.data)
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast({
        title: "Error",
        description: "Failed to fetch available tables. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Function to fetch active bookings
  const fetchActiveBookings = async (hotelId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/room-service/active-bookings/60d21b4667d0d8992e610c85`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      const data = await response.json()
      if (data.success) {
        setActiveBookings(data.data)
      }
    } catch (error) {
      console.error("Error fetching active bookings:", error)
      toast({
        title: "Error",
        description: "Failed to fetch active bookings. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle opening the table selection dialog
  const handleOpenTableDialog = () => {
    fetchTables()
    setIsTableDialogOpen(true)
  }

  // Handle table selection
  const handleSelectTable = async (table: Table) => {
    try {
      // Update table status to occupied
      const response = await fetch(`http://localhost:8000/api/v1/admin/hotel/restaurant/67e8f522404a64803d0cea8d/tables/${table.tableNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'occupied' })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update table status');
      }

      setSelectedTable(table);
      setIsTableDialogOpen(false);
    } catch (error) {
      console.error('Error updating table status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update table status",
        variant: "destructive",
      });
    }
  }

  // Handle opening the booking selection dialog
  const handleOpenBookingDialog = () => {
    fetchActiveBookings("67e8f522404a64803d0cea8d")
    setIsBookingDialogOpen(true)
  }

  // Handle booking selection
  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setCustomerInfo({
      name: `${booking.guestId.personalInfo.firstName} ${booking.guestId.personalInfo.lastName}`,
      phone: booking.guestId.personalInfo.phone || "",
      email: booking.guestId.personalInfo.email || "",
      address: `Room ${booking.roomId.roomNumber}`
    })
    setIsBookingDialogOpen(false)
  }

  // Process order
  const processOrder = async (orderDetails: OrderDetails) => {
    setIsProcessing(true)
    try {
      const orderResponse = await fetch(`http://localhost:8000/api/restaurants/67e8f522404a64803d0cea8d/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customer: {
            name: customerInfo.name,
            phone: customerInfo.phone,
            email: customerInfo.email,
            address: customerInfo.address
          },
          items: orderDetails.items.map((item: any) => ({
            itemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            notes: item.notes,
            modifiers: item.modifiers,
            subtotal: item.price * item.quantity
          })),
          tableNumber: selectedTable?.tableNumber,
          type: "ROOM",
          paymentMethod: "ROOM",
          specialInstructions: orderDetails.specialInstructions,
          payment: {
            method: "room",
            status: "PENDING",
            amount: orderDetails.total,
            tax: orderDetails.tax,
            tip: orderDetails.tip || 0
          }
        }),
      })
      
      const orderData = await orderResponse.json()
      
      if (!orderData.success) {
        throw new Error(orderData.message || "Order creation failed")
      }
      
      // Create room service charge
      if (selectedBooking) {
        const roomServiceResponse = await fetch("http://localhost:8000/api/v1/room-service/charge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            bookingId: selectedBooking._id,
            roomId: selectedBooking.roomId._id,
            orderId: orderData.data._id,
            hotelId: "67e8f522404a64803d0cea8d",
            amount: orderDetails.total
          })
        })

        const roomServiceData = await roomServiceResponse.json()
        if (!roomServiceData.success) {
          throw new Error(roomServiceData.message || "Room service charge creation failed")
        }
      }
      
      setIsPaymentSuccessful(true)
      
      setTimeout(() => {
        onComplete({
          ...orderDetails,
          orderId: orderData.data._id,
          orderNumber: orderData.data.orderNumber
        })
      }, 1500)
      
    } catch (error) {
      console.error("Error processing order:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!selectedBooking) {
      toast({
        title: "Room Required",
        description: "Please select a room to charge the order to",
        variant: "destructive",
      })
      return
    }

    const orderDetails: OrderDetails = {
      ...order,
      paymentMethod: "room",
      orderNumber: Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString(),
    }

    await processOrder(orderDetails)
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 text-xl">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-6" disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {order.items.map((item: OrderItem, index: number) => (
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
                        <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${order.discount.toFixed(2)}</span>
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
          </div>

          {/* Right Column - Room Selection and Table Selection */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>Select room and table information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Room Selection */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Room Information</h3>
                      {selectedBooking && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedBooking(null)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {selectedBooking ? (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">Room {selectedBooking.roomId.roomNumber}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Guest: {selectedBooking.guestId.personalInfo.firstName} {selectedBooking.guestId.personalInfo.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Check-in: {new Date(selectedBooking.checkIn).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {selectedBooking.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button 
                        onClick={handleOpenBookingDialog} 
                        variant="outline"
                        className="w-full py-8"
                        disabled={isProcessing}
                      >
                        <Home className="mr-2 h-5 w-5" />
                        Select Room
                      </Button>
                    )}
                  </div>

                  {/* Table Selection */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Table Information</h3>
                      {selectedTable && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedTable(null)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {selectedTable ? (
                      <Card>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">Table {selectedTable.tableNumber}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Location: {selectedTable.location}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Capacity: {selectedTable.capacity} people
                                </p>
                              </div>
                              <Badge variant="outline">
                                {selectedTable.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedTable.features.map((feature, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button 
                        onClick={handleOpenTableDialog} 
                        variant="outline"
                        className="w-full py-8"
                        disabled={isProcessing}
                      >
                        <Users className="mr-2 h-5 w-5" />
                        Select Table
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full p-10 bg-blue-600 hover:bg-blue-700 text-white text-xl"
                    disabled={isProcessing || isPaymentSuccessful || !selectedBooking}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isPaymentSuccessful ? "Order Confirmed" : "Processing Order..."}
                      </>
                    ) : isPaymentSuccessful ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Order Confirmed
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </div>

      {/* Room Selection Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select a Room</DialogTitle>
            <DialogDescription>Choose from active bookings</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {activeBookings.map((booking) => (
              <div
                key={booking._id}
                onClick={() => handleSelectBooking(booking)}
                className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Room {booking.roomId.roomNumber}</h3>
                    <Badge variant={booking.status === "checked_in" ? "outline" : "secondary"}>
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Guest: {booking.guestId.personalInfo.firstName} {booking.guestId.personalInfo.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Table Selection Dialog */}
      <Dialog open={isTableDialogOpen} onOpenChange={setIsTableDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select a Table</DialogTitle>
            <DialogDescription>Choose an available table from the floor plan</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-4">
            {tables.map((table) => (
              <div
                key={table._id}
                onClick={() => table.status === "available" && handleSelectTable(table)}
                className={`
                  relative p-4 border-2 rounded-lg transition-all
                  ${table.status === "available" 
                    ? "border-green-500 hover:bg-green-50 cursor-pointer" 
                    : "border-red-300 bg-red-50 cursor-not-allowed"}
                `}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">Table {table.tableNumber}</h3>
                    <p className="text-sm text-muted-foreground">{table.location}</p>
                  </div>
                  <Badge variant={table.status === "available" ? "outline" : "destructive"}>
                    {table.status}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm">Capacity: {table.capacity} people</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {table.features.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  )
}