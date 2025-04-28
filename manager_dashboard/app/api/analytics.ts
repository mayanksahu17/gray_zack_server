import axios from 'axios'

const API_BASE = 'http://localhost:8000/api/v1/analytics'

export const getTodaysTimeline = async (hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/timeline/today`, {
    params: hotelId ? { hotelId } : {}
  })
  return response.data
}

export const getTodayRevenue = async () => {
  const response = await axios.get(`${API_BASE}/revenue/today`)
  return response.data
}

export const getOccupancyRateToday = async (hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/occupancy-rate/today`, {
    params: hotelId ? { hotelId } : {}
  })
  return response.data
}

export const getActiveReservations = async (hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/active-reservations`, {
    params: hotelId ? { hotelId } : {}
  })
  return response.data
}

export const getRoomServiceOrders = async (hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/room-service-orders`, {
    params: hotelId ? { hotelId } : {}
  })
  return response.data
}

export const getMonthlyRevenue = async (year?: number, hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/revenue/monthly`, {
    params: { 
      ...(year && { year }),
      ...(hotelId && { hotelId })
    }
  })
  return response.data
}

export const getMonthlyOccupancy = async (year?: number, hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/occupancy/monthly`, {
    params: { 
      ...(year && { year }),
      ...(hotelId && { hotelId })
    }
  })
  return response.data
}

export const getSystemAlerts = async (timeframe?: number, hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/alerts`, {
    params: { 
      ...(timeframe && { timeframe }),
      ...(hotelId && { hotelId })
    }
  })
  return response.data
}

