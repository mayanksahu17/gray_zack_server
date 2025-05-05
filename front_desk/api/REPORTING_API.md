# Reporting API Documentation

This document outlines the API requirements for the hotel reporting system's different views.

## Common Parameters

All API endpoints should accept the following common parameters:

```typescript
interface DateRange {
  from: Date;    // Start date for the report
  to: Date;      // End date for the report
}

interface PaginationParams {
  page?: number;
  limit?: number;
}
```

## 1. Dashboard Tab API Requirements

### 1.1 Dashboard Summary
**Endpoint:** `/api/analytics/dashboard-summary`
```typescript
interface DashboardSummary {
  occupancyRate: number;     // Current occupancy rate (percentage)
  totalRooms: number;        // Total number of rooms in hotel
  occupiedRooms: number;     // Currently occupied rooms
  adr: number;              // Average Daily Rate
  revpar: number;           // Revenue Per Available Room
  totalRevenue: number;     // Total revenue for the period
  todayRevenue: number;     // Revenue for today
}
```

### 1.2 Occupancy by Room Type
**Endpoint:** `/api/analytics/occupancy-by-room-type`
```typescript
interface RoomTypeOccupancy {
  roomType: string;         // Type of room (e.g., 'standard', 'deluxe', 'suite')
  totalRooms: number;       // Total rooms of this type
  occupiedRooms: number;    // Number of occupied rooms
  occupancyRate: number;    // Occupancy rate as percentage
}
```

### 1.3 Revenue by Room Type
**Endpoint:** `/api/analytics/revenue-by-room-type`
```typescript
interface RoomTypeRevenue {
  roomType: string;         // Type of room
  roomRevenue: number;      // Revenue from room charges
  fbRevenue: number;        // Food & Beverage revenue
  otherRevenue: number;     // Other revenue sources
  totalRevenue: number;     // Total revenue for room type
  count: number;            // Number of room nights
}
```

### 1.4 Daily Metrics
**Endpoint:** `/api/analytics/daily-metrics`
```typescript
interface DailyMetrics {
  date: string;             // Date in ISO format
  occupancyRate: number;    // Daily occupancy rate
  adr: number;              // Average Daily Rate
  revenue: number;          // Total daily revenue
  roomRevenue?: number;     // Optional: Room revenue breakdown
  additionalRevenue?: number; // Optional: Additional revenue
}
```

## 2. Occupancy Tab API Requirements

### 2.1 Detailed Occupancy Report
**Endpoint:** `/api/analytics/occupancy-report`
```typescript
interface OccupancyReport {
  summary: {
    overallOccupancy: number;
    totalAvailableRooms: number;
    totalOccupiedRooms: number;
  };
  byRoomType: RoomTypeOccupancy[];
  dailyBreakdown: Array<{
    date: string;
    occupancyRate: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms?: number;
    outOfOrderRooms?: number;
  }>;
}
```

## 3. Revenue Tab API Requirements

### 3.1 Detailed Revenue Report
**Endpoint:** `/api/analytics/revenue-report`
```typescript
interface RevenueReport {
  summary: {
    totalRevenue: number;
    roomRevenue: number;
    fbRevenue: number;
    otherRevenue: number;
    averageADR: number;
    averageRevPAR: number;
  };
  byRoomType: RoomTypeRevenue[];
  dailyBreakdown: Array<{
    date: string;
    totalRevenue: number;
    roomRevenue: number;
    fbRevenue: number;
    otherRevenue: number;
    adr: number;
    revpar: number;
    occupiedRooms: number;
  }>;
  revenueStreams: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}
```

## 4. Guests Tab API Requirements

### 4.1 Guest Analytics Report
**Endpoint:** `/api/analytics/guest-report`
```typescript
interface GuestReport {
  summary: {
    totalGuests: number;
    averageStayLength: number;
    repeatGuestPercentage: number;
    topSourceMarkets: Array<{
      market: string;
      guestCount: number;
      percentage: number;
    }>;
  };
  demographics: {
    ageGroups: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    nationality: Array<{
      country: string;
      count: number;
      percentage: number;
    }>;
    purposeOfStay: Array<{
      purpose: string;
      count: number;
      percentage: number;
    }>;
  };
  bookingSources: Array<{
    source: string;
    bookings: number;
    revenue: number;
    percentage: number;
  }>;
  satisfaction: {
    overallScore: number;
    categories: Array<{
      category: string;
      score: number;
      responses: number;
    }>;
  };
}
```

## API Response Format

All API responses should follow this standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}
```

## Error Codes

Common error codes that may be returned:

- `INVALID_DATE_RANGE`: Date range is invalid or missing
- `UNAUTHORIZED`: Authentication failed or token expired
- `FORBIDDEN`: User lacks permission for requested data
- `NOT_FOUND`: Requested resource not found
- `INTERNAL_ERROR`: Server-side processing error

## Data Refresh Rates

- Dashboard metrics: Real-time updates
- Occupancy data: Updated every 15 minutes
- Revenue data: Updated hourly
- Guest analytics: Updated daily

## Authentication

All API endpoints require authentication using Bearer token:

```http
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- Standard tier: 100 requests per minute
- Premium tier: 1000 requests per minute

## Notes

1. All monetary values should be returned in cents/smallest currency unit
2. All percentages should be returned as decimal numbers (e.g., 75.5 for 75.5%)
3. Dates should be in ISO 8601 format
4. All endpoints support optional date range filtering
5. Responses should be gzipped for improved performance 