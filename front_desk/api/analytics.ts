import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://16.171.47.60:8000/api/v1';

// Set to true to use fallback data instead of real API calls
const USE_FALLBACK_DATA = true;

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardSummary {
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  adr: number;
  revpar: number;
  totalRevenue: number;
  todayRevenue: number;
}

export interface RoomTypeOccupancy {
  roomType: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
}

export interface RoomTypeRevenue {
  roomType: string;
  roomRevenue: number;
  fbRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  count: number;
}

export interface DailyMetrics {
  date: string;
  occupancyRate: number;
  adr: number;
  revenue: number;
  roomRevenue?: number;
  additionalRevenue?: number;
  occupiedNights?: number;
  source?: string;
}

export interface BookingSource {
  source: string;
  count: number;
  percentage: number;
}

export interface RevenueTrend {
  period: string;
  roomRevenue: number;
  additionalRevenue: number;
  totalRevenue: number;
  occupiedNights: number;
  adr: number;
}

// Fallback data functions for demonstration
const getFallbackSummary = (): DashboardSummary => ({
  occupancyRate: 76.4,
  totalRooms: 100,
  occupiedRooms: 76,
  adr: 189.5,
  revpar: 144.78,
  totalRevenue: 42856,
  todayRevenue: 4320
});

const getFallbackOccupancy = (): RoomTypeOccupancy[] => [
  { roomType: 'standard', totalRooms: 50, occupiedRooms: 42, occupancyRate: 84 },
  { roomType: 'deluxe', totalRooms: 30, occupiedRooms: 22, occupancyRate: 73.3 },
  { roomType: 'suite', totalRooms: 15, occupiedRooms: 10, occupancyRate: 66.7 },
  { roomType: 'Accessible', totalRooms: 5, occupiedRooms: 2, occupancyRate: 40 }
];

const getFallbackRevenue = (): RoomTypeRevenue[] => [
  { roomType: 'standard', roomRevenue: 15000, fbRevenue: 5500, otherRevenue: 2200, totalRevenue: 22700, count: 42 },
  { roomType: 'deluxe', roomRevenue: 12500, fbRevenue: 4200, otherRevenue: 1800, totalRevenue: 18500, count: 22 },
  { roomType: 'suite', roomRevenue: 9500, fbRevenue: 3500, otherRevenue: 1500, totalRevenue: 14500, count: 10 },
  { roomType: 'Accessible', roomRevenue: 1500, fbRevenue: 800, otherRevenue: 400, totalRevenue: 2700, count: 2 }
];

const getFallbackDailyMetrics = (): DailyMetrics[] => {
  const today = new Date();
  return Array.from({ length: 10 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (9 - i));
    return {
      date: date.toISOString().split('T')[0],
      occupancyRate: 65 + Math.floor(Math.random() * 20),
      adr: 180 + Math.floor(Math.random() * 20),
      revenue: 4500 + Math.floor(Math.random() * 1500)
    };
  });
};

const getFallbackBookingSources = (): BookingSource[] => [
  { source: 'Direct', count: 45, percentage: 45 },
  { source: 'Booking.com', count: 25, percentage: 25 },
  { source: 'Expedia', count: 15, percentage: 15 },
  { source: 'Airbnb', count: 10, percentage: 10 },
  { source: 'Other', count: 5, percentage: 5 }
];

/**
 * Get summary metrics for the dashboard
 */
export const getDashboardSummary = async (hotelId: string, dateRange?: DateRange): Promise<DashboardSummary> => {
  if (USE_FALLBACK_DATA) {
    return Promise.resolve(getFallbackSummary());
  }

  try {
    let url = `${API_URL}/analytics/${hotelId}/dashboard`;
    
    if (dateRange && dateRange.from && dateRange.to) {
      url += `?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return getFallbackSummary();
  }
};

/**
 * Get occupancy breakdown by room type
 */
export const getOccupancyByRoomType = async (hotelId: string): Promise<RoomTypeOccupancy[]> => {
  if (USE_FALLBACK_DATA) {
    return Promise.resolve(getFallbackOccupancy());
  }

  try {
    const url = `${API_URL}/analytics/${hotelId}/occupancy-by-room-type`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching occupancy by room type:', error);
    return getFallbackOccupancy();
  }
};

/**
 * Get revenue breakdown by room type
 */
export const getRevenueByRoomType = async (hotelId: string, dateRange?: DateRange): Promise<RoomTypeRevenue[]> => {
  if (USE_FALLBACK_DATA) {
    return Promise.resolve(getFallbackRevenue());
  }

  try {
    let url = `${API_URL}/analytics/${hotelId}/revenue-by-room-type`;
    
    if (dateRange && dateRange.from && dateRange.to) {
      url += `?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue by room type:', error);
    return getFallbackRevenue();
  }
};

/**
 * Get daily occupancy and revenue metrics
 */
export const getDailyOccupancyAndRevenue = async (hotelId: string, dateRange?: DateRange): Promise<DailyMetrics[]> => {
  if (USE_FALLBACK_DATA) {
    return Promise.resolve(getFallbackDailyMetrics());
  }

  try {
    let url = `${API_URL}/analytics/${hotelId}/daily-metrics`;
    
    if (dateRange && dateRange.from && dateRange.to) {
      url += `?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    return getFallbackDailyMetrics();
  }
};

/**
 * Get booking sources breakdown
 */
export const getBookingSources = async (hotelId: string, dateRange?: DateRange): Promise<BookingSource[]> => {
  if (USE_FALLBACK_DATA) {
    return Promise.resolve(getFallbackBookingSources());
  }

  try {
    let url = `${API_URL}/analytics/${hotelId}/booking-sources`;
    
    if (dateRange && dateRange.from && dateRange.to) {
      url += `?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking sources:', error);
    return getFallbackBookingSources();
  }
};

/**
 * Get revenue trends over time (monthly or weekly)
 */
export const getRevenueTrends = async (
  hotelId: string, 
  dateRange?: DateRange, 
  groupBy: 'month' | 'week' = 'month'
): Promise<RevenueTrend[]> => {
  try {
    let url = `${API_URL}/analytics/${hotelId}/revenue-trends?groupBy=${groupBy}`;
    
    if (dateRange && dateRange.from && dateRange.to) {
      url += `&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    
    // Return fallback data
    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return Array.from({ length: 12 }).map((_, i) => {
      const date = new Date(today);
      date.setMonth(date.getMonth() - (11 - i));
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      return {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        roomRevenue: 15000 + Math.floor(Math.random() * 5000),
        additionalRevenue: 5000 + Math.floor(Math.random() * 2000),
        totalRevenue: 20000 + Math.floor(Math.random() * 7000),
        occupiedNights: 80 + Math.floor(Math.random() * 40),
        adr: 180 + Math.floor(Math.random() * 30)
      };
    });
  }
}; 