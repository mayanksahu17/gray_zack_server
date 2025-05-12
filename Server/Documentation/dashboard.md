# Dashboard API Documentation

## Payment API

### Backend API

#### Endpoint: `/api/v1/overview/payments/dashboard/payments-data`
- **Method**: GET
- **Description**: Retrieves payment data for the manager dashboard, including recent transactions, payment method distribution, and revenue by booking source.
- **Authentication**: Required (Manager/Admin level access)
- **Response Format**:
  ```json
  {
    "transactions": [
      {
        "id": "string",          // Transaction ID or Invoice ID
        "guest": "string",       // Guest's full name
        "amount": "string",      // Formatted amount (e.g., "$1,250")
        "date": "string",        // Formatted date (e.g., "Jul 10, 2023")
        "method": "string",      // Payment method (e.g., "Credit Card", "Cash")
        "status": "string"       // Payment status (e.g., "Paid", "Partial")
      }
    ],
    "paymentMethods": [
      {
        "method": "string",      // Payment method name
        "percentage": number     // Percentage of total payments (0-100)
      }
    ],
    "revenueBySource": [
      {
        "source": "string",      // Booking source name
        "amount": number         // Revenue amount in dollars
      }
    ]
  }
  ```
- **Controller**: `getPaymentsData` in `overview.payment.controller.ts`
- **Implementation Details**:
  - Retrieves completed and partial invoices from the database
  - Builds transaction list with guest information
  - Calculates payment method distribution percentages
  - Computes revenue breakdown by booking source

### Frontend API Client

#### Function: `getPaymentsData`
- **File**: `manager_dashboard/app/api/psyment.ts`
- **Description**: Fetches payment data from the backend API for display on the dashboard.
- **Parameters**: None
- **Returns**: Promise containing payment data for the dashboard
- **Usage Example**:
  ```typescript
  import { getPaymentsData } from "@/app/api/psyment"

  const fetchPayments = async () => {
    try {
      const data = await getPaymentsData()
      // Process payment data
    } catch (error) {
      console.error("Error fetching payment data:", error)
    }
  }
  ```
- **Request Path**: `http://localhost:8000/api/v1/overview/payments/dashboard/payments-data`
- **Implementation**:
  ```typescript
  import axios from 'axios'

  const API_BASE = 'http://localhost:8000/api/v1/overview/payments'

  export const getPaymentsData = async () => {
    const response = await axios.get(`${API_BASE}/dashboard/payments-data`)
    return response.data
  }
  ```

## Component Usage

### PaymentsPage Component
- **File**: `manager_dashboard/components/pages/payments.tsx`
- **Description**: Displays payment information in multiple tabs with visualizations.
- **Features**:
  - Transactions table with filtering capability
  - Payment methods distribution pie chart
  - Revenue breakdown by booking source bar chart
- **Data Flow**:
  1. Component loads and sets loading state
  2. Calls `getPaymentsData()` to fetch payment information
  3. Updates state with received data
  4. Renders visualizations based on the data
- **Dependencies**:
  - Uses UI components from the design system
  - Displays skeleton loaders during data loading
