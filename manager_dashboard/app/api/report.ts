import axios from 'axios'

const API_BASE = 'http://16.171.47.60:8000/api/v1/reports'

export const getOccupancyTrend = async (year?: number, hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/occupancy-trend`, {
    params: { 
      ...(year && { year }),
      ...(hotelId && { hotelId })
    }
  })
  return response.data
}

export const getRevenueByRoomType = async (year?: number, hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/revenue-by-room-type`, {
    params: { 
      ...(year && { year }),
      ...(hotelId && { hotelId })
    }
  })
  return response.data
}

export const getGuestFeedback = async (hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/guest-feedback`, {
    params: hotelId ? { hotelId } : {}
  })
  return response.data
}

export const getAvailableReports = async (hotelId?: string) => {
  const response = await axios.get(`${API_BASE}/available-reports`, {
    params: hotelId ? { hotelId } : {}
  })
  return response.data
}
