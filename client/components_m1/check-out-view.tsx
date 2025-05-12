"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, CreditCard, DollarSign, Mail, Phone, Printer, Star, User, X } from "lucide-react"

import { Button } from "@/components_m1/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components_m1/ui/card"
import { Input } from "@/components_m1/ui/input"
import { Label } from "@/components_m1/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components_m1/ui/radio-group"
import { Separator } from "@/components_m1/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m1/ui/tabs"
import { Textarea } from "@/components_m1/ui/textarea"
import { Alert, AlertDescription } from "@/components_m1/ui/alert"
import { Spinner } from "@/components_m1/ui/spinner"
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
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [checkoutDetails, setCheckoutDetails] = useState<any>(null)
  const [error, setError] = useState("")
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [recentBookings, setRecentBookings] = useState<any[]>([])

  // Search handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setShowSearchResults(true)
    setError("")
    setSearchResults([])
    setSelectedGuest(null)
    setCheckoutDetails(null)
    setCheckoutSuccess(false)
    try {
      const res = await fetch(`http://16.171.47.60:8000/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      // Flatten and group results for selection
      const results: any[] = []
      if (data.guests && data.guests.length > 0) {
        data.guests.forEach((g: any) => results.push({
          type: 'Guest',
          id: g._id,
          name: `${g.personalInfo?.firstName || g.firstName || ''} ${g.personalInfo?.lastName || g.lastName || ''}`.trim() || g.email || g.phone || g.idNumber,
          email: g.personalInfo?.email || g.email,
          phone: g.personalInfo?.phone || g.phone
        }))
      }
      if (data.reservations && data.reservations.length > 0) {
        data.reservations.forEach((r: any) => results.push({
          type: 'Reservation',
          id: r._id,
          name: `Reservation #${r._id}`,
          guest: r.guestId,
          room: r.roomId,
          status: r.status
        }))
      }
      setSearchResults(results)
    } catch (err) {
      setError("Failed to search. Please try again.")
    } finally {
      setSearchLoading(false)
    }
  }

  // Select guest or reservation
  const handleSelect = async (result: any) => {
    setShowSearchResults(false)
    setSelectedGuest(result)
    setCheckoutDetails(null)
    setError("")
    setCheckoutSuccess(false)
    setRecentBookings([])
    try {
      let userId = result.type === 'Guest' ? result.id : result.guest?._id || result.guest
      if (!userId) throw new Error('No guest ID found')

      // If selecting a reservation directly, validate its status first
      if (result.type === 'Reservation') {
        if (result.status === 'checked_out') {
          setError('This reservation has already been checked out.')
          return
        }
      }

      // Always fetch all bookings for this guest
      const bookingsRes = await fetch(`http://16.171.47.60:8000/api/v1/booking/guest/${userId}`)
      const bookingsData = await bookingsRes.json()
      if (Array.isArray(bookingsData)) {
        // Find checked-in booking
        const checkedInBooking = bookingsData.find((b: any) => b.status === 'checked_in')
        if (checkedInBooking) {
          // Fetch checkout details by booking ID
          const res = await fetch(`http://16.171.47.60:8000/api/v1/checkout/details/booking/${checkedInBooking._id}`)
          const data = await res.json()
          if (!data.success) throw new Error(data.error || 'No active reservation found')
          setCheckoutDetails(data.data)
          return
        } else {
          // Check if there are any checked-out bookings
          const hasCheckedOutBookings = bookingsData.some((b: any) => b.status === 'checked_out')
          if (hasCheckedOutBookings) {
            setRecentBookings(bookingsData.filter((b: any) => b.status === 'checked_out'))
            setError('This guest has already checked out. Below are their recent bookings.')
          } else {
            setRecentBookings(bookingsData)
            setError('No active (checked-in) booking found for this guest. See recent bookings below.')
          }
          return
        }
      } else {
        setError('No active or recent bookings found for this guest.')
        return
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch checkout details')
    }
  }

  // Checkout handler
  const handleCheckout = async () => {
    if (!checkoutDetails?.guest?._id || !checkoutDetails?.booking?._id) return
    setCheckoutLoading(true)
    setError("")
    try {
      const res = await fetch('http://16.171.47.60:8000/api/v1/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: checkoutDetails.guest._id,
          bookingId: checkoutDetails.booking._id,
          paymentMethod: 'cash', // or 'credit_card' if you want to add payment
          roomServices: [] // add room service IDs if needed
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Checkout failed')
      setCheckoutSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  // UI rendering
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Guest Check-out</h1>
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Find Guest or Reservation</CardTitle>
          <CardDescription>Search by name, reservation ID, phone, or email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter name, reservation ID, phone, or email"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
              disabled={searchLoading}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />
            <Button type="submit" disabled={searchLoading}>
              {searchLoading ? "Searching..." : "Search"}
            </Button>
          </form>
          {showSearchResults && searchResults.length > 0 && (
            <div className="relative">
              <div className="absolute left-0 right-0 mt-2 bg-white border rounded shadow-lg z-10 max-h-60 overflow-auto">
                {searchResults.map((result, idx) => {
                  // Skip showing checked out reservations
                  if (result.type === 'Reservation' && result.status === 'checked_out') {
                    return null;
                  }
                  
                  return (
                    <div
                      key={result.id}
                      className="p-3 hover:bg-blue-100 cursor-pointer flex items-center justify-between"
                      onClick={() => handleSelect(result)}
                    >
                      <div className="flex flex-col">
                        <span>{result.type === 'Guest' ? result.name : result.name}</span>
                        {result.type === 'Reservation' && (
                          <span className="text-sm text-muted-foreground capitalize">Status: {result.status}</span>
                        )}
                      </div>
                      <X className="h-4 w-4 text-muted-foreground" onClick={e => { e.stopPropagation(); setShowSearchResults(false); }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Details & Checkout */}
      {checkoutDetails && !checkoutSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>Reservation & Room Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{checkoutDetails.guest?.personalInfo?.firstName} {checkoutDetails.guest?.personalInfo?.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{checkoutDetails.guest?.personalInfo?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{checkoutDetails.guest?.personalInfo?.phone}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm">Room:</span>
                <span className="font-medium">{checkoutDetails.room?.roomNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Check-in:</span>
                <span className="font-medium">{new Date(checkoutDetails.booking?.checkIn).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Expected Check-out:</span>
                <span className="font-medium">{new Date(checkoutDetails.booking?.expectedCheckOut).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reservation Status:</span>
                <span className="font-medium capitalize">{checkoutDetails.booking?.status}</span>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Due:</span>
                <span className="font-bold">${checkoutDetails.summary?.remainingBalance?.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={handleCheckout} disabled={checkoutLoading}>
              {checkoutLoading ? "Processing..." : "Checkout"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Recent Bookings if no active booking */}
      {recentBookings.length > 0 && !checkoutDetails && !checkoutSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>No active (checked-in) booking found. Select a booking below to view details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentBookings.map((booking: any) => (
                <div key={booking._id} className="border rounded p-3 flex flex-col gap-1 mb-2">
                  <div className="flex justify-between">
                    <span>Reservation ID:</span>
                    <span>{booking._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize">{booking.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <span>{booking.roomId?.roomNumber || booking.roomId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-in:</span>
                    <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out:</span>
                    <span>{new Date(booking.expectedCheckOut).toLocaleDateString()}</span>
                  </div>
                  <Button
                    size="sm"
                    className="mt-2"
                    disabled={booking.status !== 'checked_in'}
                    onClick={async () => {
                      // Try to fetch checkout details for this booking
                      try {
                        const res = await fetch(`http://16.171.47.60:8000/api/v1/checkout/details/booking/${booking._id}`)
                        const data = await res.json()
                        if (!data.success) throw new Error(data.error || 'No active reservation found')
                        setCheckoutDetails(data.data)
                        setError("")
                      } catch (err: any) {
                        setError(err.message || 'Failed to fetch checkout details')
                      }
                    }}
                  >
                    {booking.status === 'checked_in' ? 'Proceed to Checkout' : 'Not Checked In'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {checkoutSuccess && (
        <Card className="mx-auto max-w-md text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Checkout Complete</CardTitle>
            <CardDescription>The guest has been successfully checked out</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 text-left">
              <div className="mb-2 font-medium">Checkout Summary</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Guest:</span>
                  <span>{checkoutDetails.guest?.personalInfo?.firstName} {checkoutDetails.guest?.personalInfo?.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>{checkoutDetails.room?.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in Date:</span>
                  <span>{new Date(checkoutDetails.booking?.checkIn).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span>${checkoutDetails.summary?.grandTotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="font-medium capitalize">Paid</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

