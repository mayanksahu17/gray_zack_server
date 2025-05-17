import axios from 'axios'

const API_BASE = 'http://56.228.32.222:8000/api/v1/overview/payments'

export const getPaymentsData = async () => {
  const response = await axios.get(`${API_BASE}/dashboard/payments-data`)
  return response.data
}
