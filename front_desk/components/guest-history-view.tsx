"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Calendar, CreditCard, Filter, Mail, Phone, User, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function GuestHistoryView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<any>(null)
  const [stayHistory, setStayHistory] = useState<any[]>([])
  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [guestNotes, setGuestNotes] = useState<any[]>([])
  const [error, setError] = useState("")

  // Handle search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    
    setSearchLoading(true)
    setShowSearchResults(true)
    setError("")
    setSearchResults([])
    setSelectedGuest(null)

    try {
      const res = await fetch(`http://16.171.47.60:8000/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      
      // Flatten and format search results
      const results: any[] = []
      if (data.guests && data.guests.length > 0) {
        data.guests.forEach((g: any) => results.push({
          type: 'Guest',
          id: g._id,
          name: `${g.personalInfo?.firstName || g.firstName || ''} ${g.personalInfo?.lastName || g.lastName || ''}`.trim(),
          email: g.personalInfo?.email || g.email,
          phone: g.personalInfo?.phone || g.phone,
          guest: g
        }))
      }
      setSearchResults(results)
    } catch (err) {
      setError("Failed to search. Please try again.")
    } finally {
      setSearchLoading(false)
    }
  }

  // Handle guest selection
  const handleSelect = async (result: any) => {
    setShowSearchResults(false)
    setSelectedGuest(result.guest)
    setError("")

    // Fetch booking history for selected guest
    try {
      const bookingRes = await fetch(`http://16.171.47.60:8000/api/v1/booking/guest/${result.id}`)
      const bookingData = await bookingRes.json()
      
      if (Array.isArray(bookingData)) {
        // Transform booking data to match the stay history format
        const transformedStayHistory = bookingData.map((booking: any) => ({
          id: booking._id,
          checkIn: new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          checkOut: new Date(booking.expectedCheckOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          nights: Math.ceil((new Date(booking.expectedCheckOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
          room: booking.roomDetails?.roomNumber || 'N/A',
          roomType: booking.roomDetails?.type || 'N/A',
          totalSpent: booking.payment.totalAmount,
          tags: [
            booking.status === 'checked_in' ? 'Current Stay' : '',
            ...booking.addOns.map((addon: any) => addon.name)
          ].filter(Boolean)
        }));
        
        setStayHistory(transformedStayHistory);

        // Transform billing history
        const transformedBillingHistory = bookingData.flatMap((booking: any) => {
          const entries = [];
          
          // Add room charge
          entries.push({
            id: `room_${booking._id}`,
            description: `Room Charge - ${booking.roomDetails?.type || 'Room'}`,
            category: `Room #${booking.roomDetails?.roomNumber || 'N/A'}`,
            date: new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            paymentMethod: booking.payment.method === 'credit_card' ? 
                         `Card ending in ${booking.payment.last4Digits || '****'}` : 
                         booking.payment.method,
            amount: booking.payment.totalAmount - (booking.addOns?.reduce((sum: number, addon: any) => sum + addon.cost, 0) || 0)
          });

          // Add add-ons as separate entries
          booking.addOns?.forEach((addon: any, index: number) => {
            entries.push({
              id: `addon_${booking._id}_${index}`,
              description: addon.name,
              category: 'Additional Services',
              date: new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              paymentMethod: 'Room Charge',
              amount: addon.cost
            });
          });

          return entries;
        });

        setBillingHistory(transformedBillingHistory);
      }
    } catch (err) {
      setError("Failed to fetch guest history")
    }
  }

  const renderSearchForm = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Find Guest</CardTitle>
          <CardDescription>Search by name, email, phone, or ID</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter name, email, phone, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 hover:bg-blue-100 cursor-pointer flex items-center justify-between"
                    onClick={() => handleSelect(result)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{result.name}</span>
                      <span className="text-sm text-muted-foreground">{result.email}</span>
                    </div>
                    <X 
                      className="h-4 w-4 text-muted-foreground" 
                      onClick={e => { 
                        e.stopPropagation(); 
                        setShowSearchResults(false); 
                      }} 
                    />
                  </div>
                ))}
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
    )
  }

  const renderGuestDetails = () => {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                    {selectedGuest?.personalInfo?.firstName} {selectedGuest?.personalInfo?.lastName}
                  </span> 
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedGuest?.personalInfo?.email}</span>
                    </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedGuest?.personalInfo?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>NA</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Since:</span>
                    <span className="font-medium">NA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Loyalty Status:</span>
                    <span className="font-medium text-primary">NA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Loyalty Points:</span>
                    <span className="font-medium">NA</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-sm font-medium">Guest Preferences</div>
                  <div className="rounded-md bg-muted p-3 text-sm">
                  <ul className="space-y-1">
                    {selectedGuest?.preferences?.length ? (
                      selectedGuest.preferences.map((pref: string, idx: number) => (
                        <li key={idx}>{pref}</li>
                      ))
                    ) : (
                      <li>NA</li>
                    )}
                  </ul>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    Edit Information
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="stays">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stays">Stay History</TabsTrigger>
              <TabsTrigger value="billing">Billing History</TabsTrigger>
              <TabsTrigger value="notes">Notes & Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="stays" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Showing {stayHistory.length} previous stays</div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </div>
              <div className="space-y-4">
                {stayHistory.map((stay) => (
                  <Card key={stay.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col justify-between gap-4 md:flex-row">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {stay.checkIn} - {stay.checkOut}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {stay.nights} nights · Room {stay.room} · {stay.roomType}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {stay.tags.map((tag : any, index : any) => (
                              <span
                                key={index}
                                className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${stay.totalSpent.toFixed(2)}</div>
                          <div className="mt-1 text-sm text-muted-foreground">Total Spent</div>
                          <Button variant="outline" size="sm" className="mt-3">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="billing" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Showing billing history for all stays</div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Transactions</SelectItem>
                      <SelectItem value="room">Room Charges</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="services">Additional Services</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b bg-muted p-3 text-sm font-medium">
                  <div className="col-span-2">Description</div>
                  <div>Date</div>
                  <div>Payment Method</div>
                  <div className="text-right">Amount</div>
                </div>
                <div className="divide-y">
                  {billingHistory.map((item) => (
                    <div key={item.id} className="grid grid-cols-5 p-3 text-sm">
                      <div className="col-span-2">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-xs text-muted-foreground">{item.category}</div>
                      </div>
                      <div className="flex items-center">{item.date}</div>
                      <div className="flex items-center">{item.paymentMethod}</div>
                      <div className="flex items-center justify-end font-medium">${item.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Special Requests & Notes</CardTitle>
                  <CardDescription>History of special requests and staff notes for this guest</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {guestNotes.map((note) => (
                      <div key={note.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{note.title}</div>
                          <div className="text-sm text-muted-foreground">{note.date}</div>
                        </div>
                        <div className="mt-1 text-sm">{note.content}</div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="font-medium">Added by:</span> {note.staff}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button>Add New Note</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Guest History</h1>

      {!selectedGuest && renderSearchForm()}
      {selectedGuest && renderGuestDetails()}
    </div>
  )
}

