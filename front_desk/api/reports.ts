import axios from "axios"

const API_URL = "http://localhost:8000/api/v1"

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add authentication interceptor if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Report API functions
export const reportsApi = {
  // Get dashboard metrics
  getDashboardMetrics: async (hotelId: string, startDate?: string, endDate?: string) => {
    try {
      const response = await apiClient.get("/reports/dashboard", {
        params: { hotelId, startDate, endDate },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error)
      throw error
    }
  },

  // Get occupancy metrics
  getOccupancyMetrics: async (hotelId: string, startDate?: string, endDate?: string) => {
    try {
      const response = await apiClient.get("/reports/occupancy", {
        params: { hotelId, startDate, endDate },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching occupancy metrics:", error)
      throw error
    }
  },

  // Get revenue metrics
  getRevenueMetrics: async (hotelId: string, startDate?: string, endDate?: string) => {
    try {
      const response = await apiClient.get("/reports/revenue", {
        params: { hotelId, startDate, endDate },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching revenue metrics:", error)
      throw error
    }
  },

  // Get guest metrics
  getGuestMetrics: async (hotelId: string, startDate?: string, endDate?: string) => {
    try {
      const response = await apiClient.get("/reports/guests", {
        params: { hotelId, startDate, endDate },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching guest metrics:", error)
      throw error
    }
  },
}

export default reportsApi
