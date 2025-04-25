import axios from 'axios'

const API_BASE = 'http://localhost:8000/api/v1/overview/payments'

export const getPaymentsData = async () => {
  const response = await axios.get(`${API_BASE}/dashboard/payments-data`)
  return response.data
}
