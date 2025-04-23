# Checkout API Documentation

This document outlines the API endpoints for the checkout process in the hotel management system.

## Base URL

All endpoints are prefixed with `/api/v1/checkout`

## Endpoints

### 1. Get Checkout Details

Retrieves all checkout-related information for a guest based on their user ID.

- **URL**: `/guest/:userId`
- **Method**: `GET`
- **URL Parameters**:
  - `userId`: The ID of the guest

#### Success Response

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "guest": {
      // Guest information
    },
    "booking": {
      // Booking details
    },
    "room": {
      // Room details
    },
    "roomServices": [
      // Array of room services used
    ],
    "summary": {
      "nightsStayed": 3,
      "roomRate": 150,
      "roomChargeTotal": 450,
      "roomServiceTotal": 125,
      "addOnTotal": 50,
      "subtotal": 625,
      "taxAmount": 62.5,
      "grandTotal": 687.5,
      "alreadyPaid": 200,
      "remainingBalance": 487.5
    }
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid user ID format" }`

- **Code**: 404 Not Found
  - **Content**: `{ "error": "Guest not found" }` or `{ "error": "No active booking found for this guest" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Error message" }`

### 2. Process Checkout

Processes the checkout, creates an invoice, updates room status, and collects payment.

- **URL**: `/process`
- **Method**: `POST`
- **Body**:

```json
{
  "userId": "guest-id-here",
  "bookingId": "booking-id-here",
  "paymentMethod": "credit_card", // Options: credit_card, cash, corporate
  "paymentDetails": {
    // Additional payment details if needed
  },
  "roomServices": [
    // Array of room service IDs to be included in checkout
  ]
}
```

#### Success Response

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "message": "Checkout completed successfully",
  "data": {
    "invoice": {
      // Invoice details
    },
    "paymentStatus": "paid",
    "checkoutDate": "2023-09-10T14:30:45.123Z",
    "nightsStayed": 3,
    "roomRevenue": 450,
    "additionalRevenue": 175,
    "totalRevenue": 687.5
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid ID format" }`

- **Code**: 404 Not Found
  - **Content**: `{ "error": "Active booking not found" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Error message" }`

### 3. Get Checkout History

Retrieves checkout history for a guest.

- **URL**: `/history/:userId`
- **Method**: `GET`
- **URL Parameters**:
  - `userId`: The ID of the guest

#### Success Response

- **Code**: 200 OK
- **Content Example**:

```json
{
  "success": true,
  "data": {
    "bookings": [
      // Array of previous bookings
    ],
    "invoices": [
      // Array of associated invoices
    ]
  }
}
```

#### Error Responses

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid user ID format" }`

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Error message" }` 