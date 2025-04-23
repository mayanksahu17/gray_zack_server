import { BASE_URL } from './constants';

// Generic fetch handler with error management
const fetchWithErrorHandling = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkoutService = {
  // Get checkout details for a guest
  getCheckoutDetails: async (userId: string) => {
    return fetchWithErrorHandling(`${BASE_URL}checkout/guest/${userId}`);
  },

  // Process checkout
  processCheckout: async (checkoutData: {
    userId: string;
    bookingId: string;
    paymentMethod: 'credit_card' | 'cash';
    paymentDetails?: {
      card?: {
        number: string;
        expMonth: string;
        expYear: string;
        cvv: string;
        zipCode: string;
      }
    };
    roomServices: string[];
  }) => {
    return fetchWithErrorHandling(`${BASE_URL}checkout/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });
  },

  // Get checkout history
  getCheckoutHistory: async (userId: string) => {
    return fetchWithErrorHandling(`${BASE_URL}checkout/history/${userId}`);
  },
};

export const guestService = {
  // Search for guests using email, phone, or ID number
  searchGuests: async (params: { email?: string; phone?: string; idNumber?: string }) => {
    const queryParams = new URLSearchParams();
    
    if (params.email) queryParams.append('email', params.email);
    if (params.phone) queryParams.append('phone', params.phone);
    if (params.idNumber) queryParams.append('idNumber', params.idNumber);
    
    return fetchWithErrorHandling(`${BASE_URL}guest/search?${queryParams.toString()}`);
  },
  
  // Get a guest by ID
  getGuestById: async (id: string) => {
    return fetchWithErrorHandling(`${BASE_URL}guest/${id}`);
  }
};

export const roomServiceAPI = {
  // Get room service charges for a booking
  getRoomServiceCharges: async (bookingId: string) => {
    return fetchWithErrorHandling(`${BASE_URL}room-service/booking/${bookingId}`);
  },
  
  // Get pending charges for checkout
  getPendingCharges: async (bookingId: string) => {
    return fetchWithErrorHandling(`${BASE_URL}room-service/pending/${bookingId}`);
  }
}; 