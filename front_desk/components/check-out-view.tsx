"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, CreditCard, DollarSign, Mail, Phone, Printer, Star, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { guestService, checkoutService, roomServiceAPI } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"

// Define types for our data structures
interface AddOn {
  name: string
  description?: string
  cost: number
}

interface RoomService {
  _id: string
  bookingId: string
  roomId: string
  orderId: string
  amount: number
  status: string
  chargedToRoom: boolean
  addedToInvoice: boolean
  createdAt: string
  updatedAt: string
}

interface CheckoutState {
  isLoading: boolean
  isSearching: boolean
  error: string | null
  guest: any
  booking: any
  room: any
  roomServices: RoomService[]
  summary: {
    nightsStayed: number
    roomRate: number
    roomChargeTotal: number
    roomServiceTotal: number
    addOnTotal: number
    subtotal: number
    taxAmount: number
    grandTotal: number
    alreadyPaid: number
    remainingBalance: number
  }
  selectedPaymentMethod: 'credit_card' | 'cash' | 'corporate'
  housekeepingNotes: string
  guestFeedback: string
  guestRating: number
}

export function CheckOutView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState<any>(null)
  
  const initialCheckoutState: CheckoutState = {
    isLoading: false,
    isSearching: false,
    error: null,
    guest: null,
    booking: null,
    room: null,
    roomServices: [],
    summary: {
      nightsStayed: 0,
      roomRate: 0,
      roomChargeTotal: 0,
      roomServiceTotal: 0,
      addOnTotal: 0,
      subtotal: 0,
      taxAmount: 0,
      grandTotal: 0,
      alreadyPaid: 0,
      remainingBalance: 0
    },
    selectedPaymentMethod: 'credit_card',
    housekeepingNotes: '',
    guestFeedback: '',
    guestRating: 0
  }
  
  const [state, setState] = useState<CheckoutState>(initialCheckoutState)
  
  const updateState = (updates: Partial<CheckoutState>) => {
    setState(prevState => ({ ...prevState, ...updates }))
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      updateState({ error: "Please enter a search term" })
      return
    }
    
    updateState({ isSearching: true, error: null })
    
    try {
      // Try to parse the query as different types (email, phone, ID)
      let searchParams = {}
      
      // Check if it might be an email
      if (searchQuery.includes('@')) {
        searchParams = { email: searchQuery }
      }
      // Check if it might be a phone number
      else if (/^[+\d\s\-()]+$/.test(searchQuery)) {
        searchParams = { phone: searchQuery }
      }
      // Otherwise try as ID number
      else {
        searchParams = { idNumber: searchQuery }
      }
      
      const results = await guestService.searchGuests(searchParams as any)
      
      if (results.length === 0) {
        updateState({ 
          isSearching: false,
          error: "No guests found matching your search criteria" 
        })
        return
      }
      
      // If we found a guest, get their checkout details
      await fetchCheckoutDetails(results[0]._id)
      
    } catch (error) {
      console.error('Search error:', error)
      updateState({ 
        isSearching: false, 
        error: error instanceof Error ? error.message : "Failed to search for guests" 
      })
    }
  }

  const fetchCheckoutDetails = async (userId: string) => {
    updateState({ isLoading: true, error: null })
    
    try {
      const checkoutDetails = await checkoutService.getCheckoutDetails(userId)
      
      updateState({
        isLoading: false,
        isSearching: false,
        guest: checkoutDetails.data.guest,
        booking: checkoutDetails.data.booking,
        room: checkoutDetails.data.room,
        roomServices: checkoutDetails.data.roomServices,
        summary: checkoutDetails.data.summary
      })
      
    } catch (error) {
      console.error('Checkout details error:', error)
      updateState({ 
        isLoading: false,
        isSearching: false,
        error: error instanceof Error ? error.message : "Failed to get checkout details" 
      })
    }
  }

  const handlePaymentMethodChange = (value: string) => {
    updateState({ 
      selectedPaymentMethod: value as 'credit_card' | 'cash' | 'corporate' 
    })
  }

  const handleCheckout = async () => {
    updateState({ isLoading: true, error: null })
    
    try {
      // Prepare the room service IDs
      const roomServiceIds = state.roomServices.map(service => service._id)
      
      // Process the checkout
      const checkoutData = {
        userId: state.guest._id,
        bookingId: state.booking._id,
        paymentMethod: state.selectedPaymentMethod,
        roomServices: roomServiceIds,
        // You can add additional payment details if needed
        paymentDetails: {}
      }
      
      const result = await checkoutService.processCheckout(checkoutData)
      
      setCheckoutResult(result.data)
      setCheckoutComplete(true)
      updateState({ isLoading: false })
      
    } catch (error) {
      console.error('Checkout error:', error)
      updateState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : "Failed to process checkout" 
      })
    }
  }

  const resetCheckout = () => {
    setSearchQuery("")
    setCheckoutComplete(false)
    setCheckoutResult(null)
    setState(initialCheckoutState)
  }

  const renderSearchForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Find Guest</CardTitle>
          <CardDescription>Search by email, phone number, or ID number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter email, phone, or ID number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              disabled={state.isSearching}
            />
            <Button type="submit" disabled={state.isSearching}>
              {state.isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
          
          {state.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderCheckoutComplete = () => {
    if (!checkoutResult) return null
    
    const { invoice, nightsStayed, totalRevenue, checkoutDate, paymentStatus } = checkoutResult
    
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Checkout Complete</CardTitle>
          <CardDescription>The guest has been successfully checked out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-left">
            <div className="mb-2 font-medium">Checkout Summary</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{state.guest?.personalInfo?.firstName} {state.guest?.personalInfo?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span>Room:</span>
                <span>{state.room?.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-in Date:</span>
                <span>{formatDate(state.booking?.checkIn)}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out Date:</span>
                <span>{formatDate(checkoutDate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span>{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-medium capitalize">{paymentStatus}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              <span>Email Receipt</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={resetCheckout}>New Checkout</Button>
        </CardFooter>
      </Card>
    )
  }

  const renderGuestCheckout = () => {
    if (!state.guest || !state.booking || !state.room) return null
    
    const { guest, booking, room, roomServices, summary } = state
    
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{guest.personalInfo.firstName} {guest.personalInfo.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{guest.personalInfo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{guest.personalInfo.phone}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Room:</span>
                  <span className="font-medium">{room.roomNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Check-in:</span>
                  <span className="font-medium">{formatDate(booking.checkIn)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Expected Check-out:</span>
                  <span className="font-medium">{formatDate(booking.expectedCheckOut)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Length of Stay:</span>
                  <span className="font-medium">{summary.nightsStayed} Nights</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Minibar Consumption</span>
                  <span className="font-medium text-amber-600">Needs Verification</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Room Condition</span>
                  <span className="font-medium text-green-600">Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lost Items</span>
                  <span className="font-medium text-green-600">None Reported</span>
                </div>
                <Separator />
                <div>
                  <Label htmlFor="roomNotes">Notes for Housekeeping</Label>
                  <Textarea 
                    id="roomNotes" 
                    placeholder="Add any notes for housekeeping..." 
                    value={state.housekeepingNotes}
                    onChange={(e) => updateState({ housekeepingNotes: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guest Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Overall Experience</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button 
                        key={rating} 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateState({ guestRating: rating })}
                      >
                        <Star className={`h-4 w-4 ${rating <= state.guestRating ? "fill-primary text-primary" : ""}`} />
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="feedback">Additional Comments</Label>
                  <Textarea 
                    id="feedback" 
                    placeholder="Enter guest feedback..." 
                    value={state.guestFeedback}
                    onChange={(e) => updateState({ guestFeedback: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="itemized">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="itemized">Itemized</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
                <TabsContent value="itemized" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-medium">
                      <span>Room Charges</span>
                      <span></span>
                    </div>
                    <div className="ml-4 space-y-1 text-sm">
                      {Array.from({ length: summary.nightsStayed }).map((_, index) => {
                        const date = new Date(booking.checkIn);
                        date.setDate(date.getDate() + index);
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <span>{room.type} - {formatDate(date)}</span>
                            <span>{formatCurrency(summary.roomRate)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {roomServices.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-medium">
                        <span>Room Services</span>
                        <span></span>
                      </div>
                      <div className="ml-4 space-y-1 text-sm">
                        {roomServices.map((service, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>Room Service - {formatDate(service.createdAt)}</span>
                            <span>{formatCurrency(service.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.addOns && booking.addOns.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-medium">
                        <span>Add-On Services</span>
                        <span></span>
                      </div>
                      <div className="ml-4 space-y-1 text-sm">
                        {booking.addOns.map((addon: AddOn, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{addon.name}</span>
                            <span>{formatCurrency(addon.cost)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(summary.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taxes (10%)</span>
                      <span>{formatCurrency(summary.taxAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prepaid Amount</span>
                      <span className="text-red-500">-{formatCurrency(summary.alreadyPaid)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-bold">
                      <span>Balance Due</span>
                      <span>{formatCurrency(summary.remainingBalance)}</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="summary" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Room Charges</span>
                      <span>{formatCurrency(summary.roomChargeTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Room Services</span>
                      <span>{formatCurrency(summary.roomServiceTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Add-On Services</span>
                      <span>{formatCurrency(summary.addOnTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taxes</span>
                      <span>{formatCurrency(summary.taxAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Prepaid Amount</span>
                      <span className="text-red-500">-{formatCurrency(summary.alreadyPaid)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-bold">
                      <span>Balance Due</span>
                      <span>{formatCurrency(summary.remainingBalance)}</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={state.selectedPaymentMethod} 
                onValueChange={handlePaymentMethodChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="credit_card" id="checkout-credit-card" />
                  <Label htmlFor="checkout-credit-card" className="flex flex-1 items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Credit Card on File</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="cash" id="checkout-cash" />
                  <Label htmlFor="checkout-cash" className="flex flex-1 items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Cash</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="corporate" id="checkout-corporate" />
                  <Label htmlFor="checkout-corporate" className="flex flex-1 items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Corporate Account</span>
                  </Label>
                </div>
              </RadioGroup>

              {state.selectedPaymentMethod === 'credit_card' && booking.payment?.last4Digits && (
                <div className="mt-4 rounded-lg border border-dashed p-4">
                  <div className="text-sm text-muted-foreground">
                    Payment will be processed using the credit card on file:
                  </div>
                  <div className="mt-2 font-medium">**** **** **** {booking.payment.last4Digits}</div>
                </div>
              )}
              
              {state.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={resetCheckout}
              disabled={state.isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCheckout}
              disabled={state.isLoading}
            >
              {state.isLoading ? "Processing..." : "Complete Checkout"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Guest Check-out</h1>

      {state.isLoading && !checkoutComplete && (
        <div className="flex justify-center items-center p-8">
          <div className="text-center">
            <div className="mb-4">Loading checkout information...</div>
            <Spinner size="lg" className="mx-auto text-primary" />
          </div>
        </div>
      )}

      {!state.guest && !checkoutComplete && !state.isLoading && renderSearchForm()}
      {state.guest && !checkoutComplete && !state.isLoading && renderGuestCheckout()}
      {checkoutComplete && renderCheckoutComplete()}
    </div>
  )
}

