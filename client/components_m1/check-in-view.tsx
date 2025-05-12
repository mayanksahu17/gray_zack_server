"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, CreditCard, DollarSign, Info, Mail, Phone, User, Wallet } from "lucide-react"
import axios from "axios"

import { Button } from "@/components_m1/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components_m1/ui/card"
import { Checkbox } from "@/components_m1/ui/checkbox"
import { Input } from "@/components_m1/ui/input"
import { Label } from "@/components_m1/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components_m1/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components_m1/ui/select"
import { Separator } from "@/components_m1/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components_m1/ui/tabs"
import { Textarea } from "@/components_m1/ui/textarea"
import { useToast } from "./ui/use-toast"
import { useRouter } from "next/navigation"
// import { BASE_URL as API_BASE_URL } from "@/lib/constants"
// API endpoints
const API_BASE_URL = "http://16.171.47.60:8000/api/v1";
const ROOM_API = `${API_BASE_URL}/room`;
const GUEST_API = `${API_BASE_URL}/guest`;
const BOOKING_API = `${API_BASE_URL}/reservation`;
const ADDON_API = `${API_BASE_URL}/addon`;
const INVOICE_API = `${API_BASE_URL}/invoice`;

const DEFAULT_HOTEL_ID = "60d21b4667d0d8992e610c85";

// import { toast } from 'react-toastify';

// Tax rate for calculations
const TAX_RATE = 0.12;

export function CheckInView() {
  const router = useRouter
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [securityDepositPaid, setSecurityDepositPaid] = useState(false);
  // Room selection state
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Guest information state
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
    // new
    reservationNumber : "",
    nationality : "",
    idType : "passport",

  });
  
  // Stay details state
  const [stayDetails, setStayDetails] = useState({
    checkInDate: new Date().toISOString().split('T')[0], // today's date
    checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days later
    adults: "2",
    children: "0",
    specialRequests: "",
    reservationNumber: ""
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    amount: "",
    zipCode: ""
  });
  
  // Add-ons state
  const [availableAddOns, setAvailableAddOns] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState({});
  
  // Billing state
  const [billing, setBilling] = useState({
    roomTotal: 0,
    taxes: 0,
    resortFee: 45,
    addOnsTotal: 0,
    total: 0
  });

  // Load available rooms
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("hotelId", DEFAULT_HOTEL_ID);
      queryParams.append("status", "available");
      
      if (stayDetails.checkInDate) {
        queryParams.append("checkIn", stayDetails.checkInDate);
      }
      
      if (stayDetails.checkOutDate) {
        queryParams.append("checkOut", stayDetails.checkOutDate);
      }
      
      const response = await axios.get(`${ROOM_API}?${queryParams.toString()}`);
      setAvailableRooms(response.data.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to fetch available rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load available add-ons
  const fetchAddOns = async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("hotelId", DEFAULT_HOTEL_ID);
      
      const response = await axios.get(`${ADDON_API}?${queryParams.toString()}`);
      setAvailableAddOns(response.data.data);
    } catch (error) {
      console.error("Error fetching add-ons:", error);
      toast({
        title: "Error",
        description: "Failed to fetch add-ons. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get room details when a room is selected
  const getRoomDetails = async (roomId : string) => {
    try {
      const response = await axios.get(`${ROOM_API}/${roomId}`);
      setRoomDetails(response.data.data);
      
      // Calculate room total
      const checkInDate = new Date(stayDetails.checkInDate);
      const checkOutDate = new Date(stayDetails.checkOutDate);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      const roomTotal = response.data.data.pricePerNight * nights;
      const taxes = roomTotal * TAX_RATE;
      
      setBilling(prev => ({
        ...prev,
        roomTotal,
        taxes,
        total: roomTotal + taxes + prev.resortFee + prev.addOnsTotal
      }));
      
    } catch (error) {
      console.error("Error fetching room details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch room details. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter rooms by type
  const filterRoomsByType = (type) => {
    setActiveTab(type);
  };

  // Handle room selection
  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
    getRoomDetails(roomId);
  };

  // Handle guest info change
  const handleGuestInfoChange = (e) => {
    const { id, value } = e.target;
    setGuestInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle stay details change
  const handleStayDetailsChange = (e) => {
    const { id, value } = e.target;
    setStayDetails(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle card info change
  const handleCardInfoChange = (e) => {
    const { id, value } = e.target;
    setCardInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };

  
  const handleMakePayment = async () => {
    try {
      setIsLoading(true);
      // Format the card expiry data
      const formattedExpiry = cardInfo.expiryDate.includes('/') ? 
        cardInfo.expiryDate : 
        cardInfo.expiryDate.replace(/(\d{2})(\d{2})/, '$1/$2');
      
      const res = await fetch("http://16.171.47.60:8000/api/v1/payment/make-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: cardInfo.cardNumber,
          expiry: formattedExpiry,
          cvv: cardInfo.cvv,
          amount: parseFloat(cardInfo.amount),
          currency: "USD",
          userId: guestInfo.email,
          zipCode: cardInfo.zipCode
        }),
      });
  
      const data = await res.json();
      if (data.success) {
        setSecurityDepositPaid(true);
        toast({
          title: "Payment Successful",
          description: `Security deposit of $${cardInfo.amount} has been processed. Transaction ID: ${data.transactionId}`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: data.message || "Unable to process payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error processing payment. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add-on selection
  const handleAddOnChange = (id, isChecked) => {
    setSelectedAddOns(prev => ({
      ...prev,
      [id]: isChecked
    }));
    
    // Recalculate add-ons total
    let addOnsTotal = 0;
    for (const addonId in selectedAddOns) {
      if (selectedAddOns[addonId] || (id === addonId && isChecked)) {
        const addon = availableAddOns.find(a => a._id === addonId);
        if (addon) {
          if (addon.perPerson && addon.perPerson === true) {
            // If per person, multiply by number of adults
            addOnsTotal += addon.cost * parseInt(stayDetails.adults);
          } else {
            addOnsTotal += addon.cost;
          }
        }
      }
    }
    
    setBilling(prev => ({
      ...prev,
      addOnsTotal,
      total: prev.roomTotal + prev.taxes + prev.resortFee + addOnsTotal
    }));
  };

  
  // Check for existing guest by email
  const checkExistingGuest = async () => {
    if (!guestInfo.email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to search for existing guests.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${GUEST_API}?email=${guestInfo.email}`);
      
      if (response.data.data.length > 0) {
        const guest = response.data.data[0];
        setGuestInfo({
          firstName: guest.personalInfo?.firstName || "",
          lastName: guest.personalInfo?.lastName || "",
          email: guest.email || guest.personalInfo?.email || "",
          phone: guest.phone || guest.personalInfo?.phone || "",
          idNumber: guest.idNumber || guest.personalInfo?.idNumber || "",
          address: guest.address || guest.personalInfo?.address || "",
          nationality: guest.nationality || guest.personalInfo?.nationality || "",
          idType: guest.idType || guest.personalInfo?.idType || "passport",
          reservationNumber: guestInfo.reservationNumber
        });
        
        toast({
          title: "Guest Found",
          description: "We found your information in our system.",
        });
      } else {
        toast({
          title: "Guest Not Found",
          description: "No guest found with this email address. Please enter guest details.",
        });
      }
    } catch (error) {
      console.error("Error checking existing guest:", error);
      toast({
        title: "Error",
        description: "Failed to check for existing guest.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing reservation
  const checkReservation = async () => {
    if (!stayDetails.reservationNumber) {
      toast({
        title: "Reservation Number Required",
        description: "Please enter a reservation number to search.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${BOOKING_API}/${stayDetails.reservationNumber}`);
      
      if (response.data.success) {
        const booking = response.data.data;
        
        // Get guest details
        const guestResponse = await axios.get(`${GUEST_API}/${booking.guestId}`);
        const guest = guestResponse.data.data;
        
        // Get room details
        const roomResponse = await axios.get(`${ROOM_API}/${booking.roomId}`);
        const room = roomResponse.data.data;
        
        // Set all the information from the reservation
        setGuestInfo({
          firstName: guest.personalInfo?.firstName || "",
          lastName: guest.personalInfo?.lastName || "",
          email: guest.email || guest.personalInfo?.email || "",
          phone: guest.phone || guest.personalInfo?.phone || "",
          idNumber: guest.idNumber || guest.personalInfo?.idNumber || "",
          address: guest.address || guest.personalInfo?.address || "",
          nationality: guest.nationality || guest.personalInfo?.nationality || "",
          idType: guest.idType || guest.personalInfo?.idType || "passport",
          reservationNumber: stayDetails.reservationNumber
        });
        
        setStayDetails({
          checkInDate: new Date(booking.checkIn).toISOString().split('T')[0],
          checkOutDate: new Date(booking.expectedCheckOut).toISOString().split('T')[0],
          adults: booking.adults.toString(),
          children: booking.children.toString(),
          specialRequests: booking.specialRequests || "",
          reservationNumber: stayDetails.reservationNumber
        });
        
        setSelectedRoom(room._id);
        setRoomDetails(room);
        
        // Set add-ons if any
        if (booking.addOns && booking.addOns.length > 0) {
          const addOnsObj = {};
          booking.addOns.forEach(addon => {
            const foundAddon = availableAddOns.find(a => a.name === addon.name);
            if (foundAddon) {
              addOnsObj[foundAddon._id] = true;
            }
          });
          setSelectedAddOns(addOnsObj);
        }
        
        // Calculate billing
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.expectedCheckOut);
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        const roomTotal = room.pricePerNight * nights;
        const taxes = roomTotal * TAX_RATE;
        
        setBilling({
          roomTotal,
          taxes,
          resortFee: 45,
          addOnsTotal: booking.addOns?.reduce((total, addon) => total + addon.cost, 0) || 0,
          total: booking.payment.totalAmount
        });
        
        toast({
          title: "Reservation Found",
          description: "Reservation details loaded successfully.",
        });
      } else {
        toast({
          title: "Reservation Not Found",
          description: "No reservation found with this number. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking reservation:", error);
      toast({
        title: "Error",
        description: "Failed to check reservation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  // Create new guest
  const createGuest = async () => {
    try {
      const response = await axios.post(GUEST_API, {  hotelId : DEFAULT_HOTEL_ID  , personalInfo : guestInfo});
      console.log(response.data.guestId);
      
      return response.data?.guestId || null;
    } catch (error) {
      console.error("Error creating guest:", error);
      throw error;
    }
  };

  // Create new booking
  const createBooking = async (guestId: string) => {
    try {
      // Format add-ons for booking
      const addOns = [];
      for (const addonId in selectedAddOns) {
        if (selectedAddOns[addonId]) {
          const addon = availableAddOns.find(a => a._id === addonId);
          if (addon) {
            let cost = addon.cost;
            if (addon.perPerson && addon.perPerson === true) {
              // If per person, multiply by number of adults
              
              cost = addon.cost * parseInt(stayDetails.adults);
            }
            addOns.push({
              name: addon.name,
              description: addon.description,
              cost: cost
            });
          }
        }
      }
      
      // Format payment info
      const payment = {
        method: paymentMethod === "credit-card" ? "credit_card" : "cash",
        status: "authorized",
        securityDeposit: parseFloat(cardInfo.amount) || 0,
        totalAmount: billing.total,
        paidAmount: parseFloat(cardInfo.amount) || 0, // Only security deposit paid at check-in
        last4Digits: paymentMethod === "credit-card" ? cardInfo.cardNumber.slice(-4) : null,
        transactionId: `txn_${Date.now()}`
      };
      
      const bookingData = {
        hotelId: DEFAULT_HOTEL_ID,
        guestId: guestId,
        roomId: selectedRoom,
        checkIn: new Date(stayDetails.checkInDate).toISOString(),
        expectedCheckOut: new Date(stayDetails.checkOutDate).toISOString(),
        adults: parseInt(stayDetails.adults),
        children: parseInt(stayDetails.children),
        cardKey: `CK${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        addOns: addOns,
        payment: payment,
        status: "checked_in"
      };
      console.log(bookingData);
      
      const response = await axios.post(`${BOOKING_API}/create`, bookingData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  };

  // Create invoice
  const createInvoice = async (booking : any) => {
    try {
      // Calculate nights
      const checkInDate :Date = new Date(stayDetails.checkInDate);
      const checkOutDate : Date= new Date(stayDetails.checkOutDate);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      // Create line items
      const lineItems = [
        {
          type: "room_charge",
          description: `Room ${roomDetails.roomNumber} (${roomDetails.type}) - ${nights} nights`,
          amount: billing.roomTotal
        },
        {
          type: "tax",
          description: `Taxes (${TAX_RATE * 100}%)`,
          amount: billing.taxes
        },
        {
          type: "other",
          description: "Resort Fee",
          amount: billing.resortFee
        }
      ];
      
      // Add add-ons to line items
      for (const addonId in selectedAddOns) {
        if (selectedAddOns[addonId]) {
          const addon = availableAddOns.find(a => a._id === addonId);
          if (addon) {
            let cost = addon.cost;
            let description = addon.name;
            
            if (addon.perPerson && addon.perPerson === true) {
              // If per person, modify description and multiply cost
              description = `${addon.name} (${stayDetails.adults} people, ${nights} days)`;
              cost = addon.cost * parseInt(stayDetails.adults) * nights;
            }
            
            lineItems.push({
              type: "add_on",
              description: description,
              amount: cost
            });
          }
        }
      }
      
      const invoiceData = {
        bookingId: booking._id,
        guestId: booking.guestId,
        roomId: booking.roomId,
        lineItems: lineItems,
        subtotal: billing.roomTotal + billing.addOnsTotal + billing.resortFee,
        taxAmount: billing.taxes,
        totalAmount: billing.total,
        billing: {
          method: booking.payment.method,
          paidAmount: booking.payment.paidAmount,
          status: "partial",
          transactionId: booking.payment.transactionId,
          paidAt: new Date().toISOString()
        }
      };
      
      const response = await axios.post(`${INVOICE_API}/create`, invoiceData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating invoice:", error);
      throw error;
    }
  };


  function showMessage(message : string, duration = 3000) {
    const container = document.getElementById('checkindiv');
  
    if (!container) {
      console.warn('Container with id "checkindiv" not found.');
      return;
    }
  
    const msgDiv = document.createElement('div');
    msgDiv.textContent = message;
    msgDiv.className = 'bg-green-100 text-green-900 px-4 py-2 rounded shadow transition-opacity duration-500';
  
    container.appendChild(msgDiv);
  
    // Auto-remove after duration
    setTimeout(() => {
      msgDiv.style.opacity = '0';
      setTimeout(() => {
        msgDiv.remove();
      }, 500); // wait for fade-out transition
    }, duration);
  }
  

  // Handle check-in submission
  const handleCheckIn = async () => {
    // For credit card payment, we need security deposit to be paid
    if (paymentMethod === "credit-card" && !securityDepositPaid) {
      toast({
        title: "Payment Required",
        description: "Please complete the security deposit payment first.",
        variant: "destructive",
      });
      return;
    }

    // For cash payment, make sure an amount is entered
    if (paymentMethod === "cash" && (!cardInfo.amount || parseFloat(cardInfo.amount) <= 0)) {
      toast({
        title: "Amount Required",
        description: "Please enter a security deposit amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Create or get guest
      const guestId = await createGuest();
      
      // 2. Create booking
      const booking = await createBooking(guestId);
      
      // 3. Create invoice
      await createInvoice(booking);
      showMessage("Check-in Complete")
      // 4. Show success message
      toast({
        title: "Check-in Complete",
        description: `${guestInfo.firstName} ${guestInfo.lastName} has been checked in to Room ${roomDetails?.roomNumber}.`,
      });
      
      // 5. Reset form or redirect
      // resetForm() 
      window.location.replace('/sucessfull')
      
    } catch (error) {
      console.error("Error completing check-in:", error);
      toast({
        title: "Error",
        description: "Failed to complete check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchRooms();
    fetchAddOns();
  }, []);

  // Update room availability when stay dates change
  useEffect(() => {
    if (stayDetails.checkInDate && stayDetails.checkOutDate) {
      fetchRooms();
    }
  }, [stayDetails.checkInDate, stayDetails.checkOutDate]);

  // Calculate billing when roomDetails changes
  useEffect(() => {
    if (roomDetails) {
      const checkInDate = new Date(stayDetails.checkInDate);
      const checkOutDate = new Date(stayDetails.checkOutDate);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      const roomTotal = roomDetails.pricePerNight * nights;
      const taxes = roomTotal * TAX_RATE;
      
      setBilling(prev => ({
        ...prev,
        roomTotal,
        taxes,
        total: roomTotal + taxes + prev.resortFee + prev.addOnsTotal
      }));
    }
  }, [roomDetails, stayDetails.checkInDate, stayDetails.checkOutDate]);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStepOne = () => {
    return (  
     
     
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter first name" 
                  value={guestInfo.firstName} 
                  onChange={handleGuestInfoChange} 
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter last name" 
                  value={guestInfo.lastName}
                  onChange={handleGuestInfoChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                value={guestInfo.email}
                onChange={handleGuestInfoChange}
                onBlur={checkExistingGuest}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                placeholder="+1 (555) 000-0000" 
                value={guestInfo.phone}
                onChange={handleGuestInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="idNumber">ID/Passport Number</Label>
              <Input 
                id="idNumber" 
                placeholder="Enter ID or passport number" 
                value={guestInfo.idNumber}
                onChange={handleGuestInfoChange}
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                placeholder="Enter address" 
                value={guestInfo.address}
                onChange={handleGuestInfoChange}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reservationNumber">Reservation Number (Optional)</Label>
              <div className="flex gap-2">
                <Input 
                  id="reservationNumber" 
                  placeholder="Enter reservation number" 
                  value={stayDetails.reservationNumber}
                  onChange={handleStayDetailsChange}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <Input 
                id="checkInDate" 
                type="date" 
                value={stayDetails.checkInDate}
                onChange={handleStayDetailsChange}
              />
            </div>
            <div>
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <Input 
                id="checkOutDate" 
                type="date" 
                value={stayDetails.checkOutDate}
                onChange={handleStayDetailsChange}
              />
            </div>
            <div>
              <Label htmlFor="adults">Number of Adults</Label>
              <Select value={stayDetails.adults} onValueChange={(value) => setStayDetails(prev => ({...prev, adults: value}))}>
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
              <Select value={stayDetails.children} onValueChange={(value) => setStayDetails(prev => ({...prev, children: value}))}>
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
              <Textarea 
                id="specialRequests" 
                placeholder="Enter any special requests or notes"
                value={stayDetails.specialRequests}
                onChange={handleStayDetailsChange}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={nextStep} disabled={!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email || !guestInfo.phone}>
            Continue to Room Selection
          </Button>
        </div>
      </div>
     
    );
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

        <Tabs defaultValue="all" value={activeTab} onValueChange={filterRoomsByType}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="deluxe">Deluxe</TabsTrigger>
            <TabsTrigger value="suite">Suite</TabsTrigger>
            <TabsTrigger value="accessible">Accessible</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-8">Loading available rooms...</div>
              ) : availableRooms.length === 0 ? (
                <div className="col-span-full flex justify-center py-8">No rooms available for the selected dates.</div>
              ) : (
                availableRooms.map((room) => (
                  <Card
                    key={room._id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedRoom === room._id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleRoomSelect(room._id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
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
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate:</span>
                          <span className="font-medium text-primary">${room.pricePerNight}/night</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/50 p-2">
                      <div className="flex flex-wrap items-center gap-1 text-xs overflow-hidden">
                        <Info className="h-3 w-3" />
                        <div className="flex flex-wrap gap-1 max-w-[200px] truncate">
                          {room.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-muted px-1 py-0.5 rounded text-xs text-muted-foreground"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="standard" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableRooms
                .filter(room => room.type.toLowerCase() === 'standard')
                .map((room) => (
                  <Card
                    key={room._id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedRoom === room._id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleRoomSelect(room._id)}
                  >
                    {/* Same card content as in "all" tab */}
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
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
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate:</span>
                          <span className="font-medium text-primary">${room.pricePerNight}/night</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/50 p-2">
                      <div className="flex flex-wrap items-center gap-1 text-xs overflow-hidden">
                        <Info className="h-3 w-3" />
                        <div className="flex flex-wrap gap-1 max-w-[200px] truncate">
                          {room.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-muted px-1 py-0.5 rounded text-xs text-muted-foreground"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="deluxe" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableRooms
                .filter(room => room.type.toLowerCase() === 'deluxe')
                .map((room) => (
                  <Card
                    key={room._id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedRoom === room._id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleRoomSelect(room._id)}
                  >
                    {/* Same card content as in "all" tab */}
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
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
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate:</span>
                          <span className="font-medium text-primary">${room.pricePerNight}/night</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/50 p-2">
                      <div className="flex flex-wrap items-center gap-1 text-xs overflow-hidden">
                        <Info className="h-3 w-3" />
                        <div className="flex flex-wrap gap-1 max-w-[200px] truncate">
                          {room.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-muted px-1 py-0.5 rounded text-xs text-muted-foreground"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="suite" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableRooms
                .filter(room => room.type.toLowerCase() === 'suite')
                .map((room) => (
                  <Card
                    key={room._id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedRoom === room._id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleRoomSelect(room._id)}
                  >
                    {/* Same card content as in "all" tab */}
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
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
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate:</span>
                          <span className="font-medium text-primary">${room.pricePerNight}/night</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/50 p-2">
                      <div className="flex flex-wrap items-center gap-1 text-xs overflow-hidden">
                        <Info className="h-3 w-3" />
                        <div className="flex flex-wrap gap-1 max-w-[200px] truncate">
                          {room.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-muted px-1 py-0.5 rounded text-xs text-muted-foreground"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="accessible" className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {availableRooms
                .filter(room => room.type.toLowerCase() === 'accessible')
                .map((room) => (
                  <Card
                    key={room._id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedRoom === room._id ? "border-2 border-primary" : ""
                    }`}
                    onClick={() => handleRoomSelect(room._id)}
                  >
                    {/* Same card content as in "all" tab */}
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
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
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rate:</span>
                          <span className="font-medium text-primary">${room.pricePerNight}/night</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-muted/50 p-2">
                      <div className="flex flex-wrap items-center gap-1 text-xs overflow-hidden">
                        <Info className="h-3 w-3" />
                        <div className="flex flex-wrap gap-1 max-w-[200px] truncate">
                          {room.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-muted px-1 py-0.5 rounded text-xs text-muted-foreground"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-4 right-4 z-50">
          <Button onClick={nextStep} disabled={!selectedRoom} className="shadow-lg">
            Continue to Payment
          </Button>
        </div>

      </div>
    )
  }

  const renderStepThree = () => {
    // Calculate the number of nights
    const checkInDate = new Date(stayDetails.checkInDate);
    const checkOutDate = new Date(stayDetails.checkOutDate);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    return (
      <div className="space-y-6" id="checkindiv">
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
                    <span>
                      {roomDetails && `Room ${roomDetails.roomNumber} (${roomDetails.type})`}
                    </span>
                    <span>${billing.roomTotal.toFixed(2)} ({nights} nights)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taxes ({(TAX_RATE * 100).toFixed(0)}%)</span>
                    <span>${billing.taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Resort Fee</span>
                    <span>${billing.resortFee.toFixed(2)}</span>
                  </div>
                  {billing.addOnsTotal > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Add-ons</span>
                      <span>${billing.addOnsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span>${billing.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
            <CardHeader>
              <CardTitle>Payment Method (Security Deposit)</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
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
              </RadioGroup>

              {paymentMethod === "credit-card" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={cardInfo.cardNumber}
                      onChange={handleCardInfoChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={cardInfo.expiryDate}
                        onChange={handleCardInfoChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cardInfo.cvv}
                        onChange={handleCardInfoChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nameOnCard">Name on Card</Label>
                    <Input
                      id="nameOnCard"
                      placeholder="Enter name as shown on card"
                      value={cardInfo.nameOnCard}
                      onChange={handleCardInfoChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="Enter billing ZIP code"
                      value={cardInfo.zipCode}
                      onChange={handleCardInfoChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Security Deposit Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={cardInfo.amount}
                      onChange={handleCardInfoChange}
                    />
                  </div>
                  {/* Development mode indicator */}
                  <div className="text-xs p-2 bg-blue-50 text-blue-800 rounded-md border border-blue-200 mt-2">
                    Running in development mode. Card payments will be simulated and always succeed.
                  </div>
                  <Button 
                    className="mt-4 w-full" 
                    onClick={handleMakePayment}
                    disabled={!cardInfo.cardNumber || !cardInfo.expiryDate || !cardInfo.cvv || !cardInfo.nameOnCard || !cardInfo.amount}
                  >
                    {securityDepositPaid ? "Payment Complete ✓" : "Process Security Deposit"}
                  </Button>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="amount">Security Deposit Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={cardInfo.amount}
                      onChange={handleCardInfoChange}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please collect the cash amount from the guest before completing check-in.
                  </p>
                </div>
              )}

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
                    <span className="font-medium">{guestInfo.firstName} {guestInfo.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{guestInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{guestInfo.phone}</span>
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
                    <span className="font-medium">
                      {new Date(stayDetails.checkInDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Check-out:</span>
                    <span className="font-medium">
                      {new Date(stayDetails.checkOutDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Length of Stay:</span>
                    <span className="font-medium">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Room:</span>
                    <span className="font-medium">
                      {roomDetails && `${roomDetails.roomNumber} (${roomDetails.type})`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Guests:</span>
                    <span className="font-medium">
                      {stayDetails.adults} {parseInt(stayDetails.adults) === 1 ? 'Adult' : 'Adults'}, 
                      {stayDetails.children} {parseInt(stayDetails.children) === 1 ? 'Child' : 'Children'}
                    </span>
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
                  {availableAddOns.map((addon) => (
                    <div key={addon._id} className="flex items-start space-x-2">
                      <Checkbox 
                        id={addon._id} 
                        checked={selectedAddOns[addon._id] || false} 
                        onCheckedChange={(checked) => handleAddOnChange(addon._id, checked)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={addon._id}>
                          {addon.name} (${addon.cost}{addon.perPerson ? '/person/day' : ''})
                        </Label>
                        <p className="text-sm text-muted-foreground">{addon.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button 
                onClick={handleCheckIn} 
                disabled={
                  isLoading || 
                  (paymentMethod === "credit-card" && !securityDepositPaid)
                }
              >
                {isLoading ? "Processing..." : "Complete Check-in"}
              </Button>
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
  );
}

function Search(props: any) {
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

