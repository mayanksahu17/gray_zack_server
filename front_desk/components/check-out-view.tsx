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

// Card details interface
interface CardDetails {
  number: string
  expiry: string
  cvv: string
  zipCode: string
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
  selectedPaymentMethod: 'credit_card' | 'cash'
  cardDetails: CardDetails
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
    cardDetails: {
      number: '',
      expiry: '',
      cvv: '',
      zipCode: ''
    },
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
      selectedPaymentMethod: value as 'credit_card' | 'cash'
    })
  }

  const handleCardDetailsChange = (field: keyof CardDetails, value: string) => {
    updateState({
      cardDetails: {
        ...state.cardDetails,
        [field]: value
      }
    })
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and format with spaces every 4 chars
    const value = e.target.value.replace(/[^0-9]/g, '')
    const formatted = value.replace(/(.{4})/g, '$1 ').trim()
    handleCardDetailsChange('number', formatted)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format as MM/YY
    let value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4)
    }
    handleCardDetailsChange('expiry', value)
  }

  const validateCardDetails = (): boolean => {
    const { cardDetails, selectedPaymentMethod } = state
    
    if (selectedPaymentMethod !== 'credit_card') {
      return true
    }
    
    // Basic validation
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
      updateState({ error: 'Please enter a valid card number' })
      return false
    }
    
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      updateState({ error: 'Please enter a valid expiry date (MM/YY)' })
      return false
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      updateState({ error: 'Please enter a valid CVV' })
      return false
    }
    
    if (!cardDetails.zipCode) {
      updateState({ error: 'Please enter a valid ZIP code' })
      return false
    }
    
    return true
  }

  const handleCheckout = async () => {
    // Reset any previous errors
    updateState({ error: null })
    
    // Validate card details if credit card is selected
    if (!validateCardDetails()) {
      return
    }
    
    updateState({ isLoading: true })
    
    try {
      // Prepare the room service IDs
      const roomServiceIds = state.roomServices.map(service => service._id)
      
      // Format card data for PaidYET
      const cardData = state.selectedPaymentMethod === 'credit_card' ? {
        number: state.cardDetails.number.replace(/\s/g, ''),
        expMonth: state.cardDetails.expiry.split('/')[0].padStart(2, '0'),
        expYear: state.cardDetails.expiry.includes('/') ? 
          `20${state.cardDetails.expiry.split('/')[1]}` : 
          new Date().getFullYear().toString(),
        cvv: state.cardDetails.cvv,
        zipCode: state.cardDetails.zipCode
      } : undefined;
      
      // Process the checkout
      const checkoutData = {
        userId: state.guest._id,
        bookingId: state.booking._id,
        paymentMethod: state.selectedPaymentMethod,
        roomServices: roomServiceIds,
        paymentDetails: state.selectedPaymentMethod === 'credit_card' ? { card: cardData } : undefined
      }
      
      const result = await checkoutService.processCheckout(checkoutData)
      
      setCheckoutResult(result.data)
      setCheckoutComplete(true)
      updateState({ isLoading: false })
      
    } catch (error: any) {
      console.error('Checkout error:', error)
      
      let errorMessage = "Failed to process checkout"
      
      // Try to extract a more specific error message
      if (error.message) {
        if (error.message.includes('401')) {
          errorMessage = "Payment authorization failed. Please check your card details or try a different payment method."
        } else if (error.message.includes('400')) {
          errorMessage = "Invalid payment details. Please check your information and try again."
        } else if (error.message.includes('500')) {
          errorMessage = "Server error. Our team has been notified. Please try again later."
        } else if (error.message.includes('Network Error')) {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else {
          errorMessage = error.message
        }
      }
      
      updateState({ 
        isLoading: false, 
        error: errorMessage
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
    
    // Card details form component
    const renderCardDetailsForm = () => {
      if (state.selectedPaymentMethod !== 'credit_card') return null
      
      // Check if we're in development mode
      const isDevelopmentMode = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
      
      return (
        <div className="mt-4 space-y-4 p-4 border rounded-md">
          <h3 className="font-medium">Enter Card Details</h3>
          
          {isDevelopmentMode && (
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <AlertDescription className="text-xs">
                Running in development mode. Card payments will be simulated and always succeed.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="card-number">Card Number</Label>
              <Input 
                id="card-number" 
                placeholder="1234 5678 9012 3456" 
                value={state.cardDetails.number}
                onChange={handleCardNumberChange}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY" 
                  value={state.cardDetails.expiry}
                  onChange={handleExpiryChange}
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input 
                  id="cvv" 
                  type="text" 
                  placeholder="123" 
                  value={state.cardDetails.cvv}
                  onChange={(e) => handleCardDetailsChange('cvv', e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zip-code">Billing ZIP Code</Label>
              <Input 
                id="zip-code" 
                placeholder="10001" 
                value={state.cardDetails.zipCode}
                onChange={(e) => handleCardDetailsChange('zipCode', e.target.value)}
              />
            </div>
          </div>
        </div>
      )
    }

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
                    <span>Credit/Debit Card</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="cash" id="checkout-cash" />
                  <Label htmlFor="checkout-cash" className="flex flex-1 items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Cash</span>
                  </Label>
                </div>
              </RadioGroup>

              {state.selectedPaymentMethod === 'credit_card' && renderCardDetailsForm()}
              
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
              {state.isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Processing Payment...
                </span>
              ) : (
                "Complete Checkout"
              )}
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

