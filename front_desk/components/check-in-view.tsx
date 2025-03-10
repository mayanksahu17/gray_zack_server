"use client"

import { useState } from "react"
import { ArrowLeft, CreditCard, DollarSign, Info, Mail, Phone, User, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export function CheckInView() {
  const [step, setStep] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId)
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const renderStepOne = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="email@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <Label htmlFor="idNumber">ID/Passport Number</Label>
              <Input id="idNumber" placeholder="Enter ID or passport number" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Enter address" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reservationNumber">Reservation Number (Optional)</Label>
              <div className="flex gap-2">
                <Input id="reservationNumber" placeholder="Enter reservation number" />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input id="checkInDate" type="date" defaultValue="2025-03-10" />
            </div>
            <div>
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input id="checkOutDate" type="date" defaultValue="2025-03-13" />
            </div>
            <div>
              <Label htmlFor="adults">Number of Adults</Label>
              <Select defaultValue="2">
                <SelectTrigger id="adults">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="children">Number of Children</Label>
              <Select defaultValue="0">
                <SelectTrigger id="children">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea id="specialRequests" placeholder="Enter any special requests or notes" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={nextStep}>Continue to Room Selection</Button>
        </div>
      </div>
    )
  }

  const renderStepTwo = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">Select a Room</h2>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="deluxe">Deluxe</TabsTrigger>
            <TabsTrigger value="suite">Suite</TabsTrigger>
            <TabsTrigger value="accessible">Accessible</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableRooms.map((room) => (
                <Card
                  key={room.id}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedRoom === room.id ? "border-2 border-primary" : ""
                  }`}
                  onClick={() => handleRoomSelect(room.id)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Room {room.number}</CardTitle>
                    <CardDescription>{room.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Floor:</span>
                        <span className="font-medium">{room.floor}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Beds:</span>
                        <span className="font-medium">{room.beds}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Max Guests:</span>
                        <span className="font-medium">{room.maxGuests}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rate:</span>
                        <span className="font-medium text-primary">${room.rate}/night</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-muted/50 p-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Info className="h-3 w-3" />
                      <span>{room.amenities}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Other tabs would have similar content filtered by room type */}
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={nextStep} disabled={!selectedRoom}>
            Continue to Payment
          </Button>
        </div>
      </div>
    )
  }

  const renderStepThree = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">Payment & Confirmation</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Billing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Room 304 (Deluxe King)</span>
                    <span>$179.00 x 3 nights</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taxes (12%)</span>
                    <span>$64.44</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Resort Fee</span>
                    <span>$45.00</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span>$646.44</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="credit-card" className="space-y-3">
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex flex-1 items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex flex-1 items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Cash</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="corporate" id="corporate" />
                    <Label htmlFor="corporate" className="flex flex-1 items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      <span>Corporate Account</span>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input id="nameOnCard" placeholder="Enter name as shown on card" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Michael Johnson</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>michael.johnson@example.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stay Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Check-in:</span>
                    <span className="font-medium">March 10, 2025 (Today)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Check-out:</span>
                    <span className="font-medium">March 13, 2025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Length of Stay:</span>
                    <span className="font-medium">3 Nights</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Room:</span>
                    <span className="font-medium">304 (Deluxe King)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Guests:</span>
                    <span className="font-medium">2 Adults, 0 Children</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="welcome-package" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="welcome-package">Welcome Package ($25)</Label>
                      <p className="text-sm text-muted-foreground">Includes a fruit basket, wine, and local treats</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="late-checkout" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="late-checkout">Late Checkout ($30)</Label>
                      <p className="text-sm text-muted-foreground">Extend your checkout time until 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="breakfast" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="breakfast">Breakfast Package ($15/person/day)</Label>
                      <p className="text-sm text-muted-foreground">Daily breakfast buffet at our restaurant</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button>Complete Check-in</Button>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStepOne()
      case 2:
        return renderStepTwo()
      case 3:
        return renderStepThree()
      default:
        return renderStepOne()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Guest Check-in</h1>
        <div className="flex items-center gap-1">
          <div className={`h-2.5 w-2.5 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2.5 w-2.5 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2.5 w-2.5 rounded-full ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
        </div>
      </div>
      {renderStepContent()}
    </div>
  )
}

// Sample data
const availableRooms = [
  {
    id: "room1",
    number: "304",
    type: "Deluxe King",
    floor: "3rd",
    beds: "1 King",
    maxGuests: 2,
    rate: 179,
    amenities: "City View, Mini Bar",
  },
  {
    id: "room2",
    number: "315",
    type: "Deluxe Twin",
    floor: "3rd",
    beds: "2 Twin",
    maxGuests: 2,
    rate: 169,
    amenities: "Garden View",
  },
  {
    id: "room3",
    number: "402",
    type: "Executive Suite",
    floor: "4th",
    beds: "1 King",
    maxGuests: 3,
    rate: 259,
    amenities: "City View, Lounge Area",
  },
  {
    id: "room4",
    number: "207",
    type: "Standard Queen",
    floor: "2nd",
    beds: "1 Queen",
    maxGuests: 2,
    rate: 139,
    amenities: "Garden View",
  },
  {
    id: "room5",
    number: "210",
    type: "Standard Twin",
    floor: "2nd",
    beds: "2 Twin",
    maxGuests: 2,
    rate: 129,
    amenities: "Garden View",
  },
  {
    id: "room6",
    number: "501",
    type: "Junior Suite",
    floor: "5th",
    beds: "1 King",
    maxGuests: 2,
    rate: 219,
    amenities: "City View, Lounge Area",
  },
  {
    id: "room7",
    number: "308",
    type: "Deluxe King",
    floor: "3rd",
    beds: "1 King",
    maxGuests: 2,
    rate: 179,
    amenities: "City View, Mini Bar",
  },
  {
    id: "room8",
    number: "215",
    type: "Standard Queen",
    floor: "2nd",
    beds: "1 Queen",
    maxGuests: 2,
    rate: 139,
    amenities: "Garden View",
  },
]

function Search(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

