const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888/api"

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "API request failed")
  }
  return response.json()
}

// Authentication API
export const authAPI = {
  signup: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    return handleResponse(response)
  },

  signin: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/signin/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
    return handleResponse(response)
  },
}

// Events API
export const eventsAPI = {
  getEvents: async (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const response = await fetch(`${API_BASE_URL}/events/?${queryString}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  createEvent: async (eventData: any) => {
    const response = await fetch(`${API_BASE_URL}/events/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    })
    return handleResponse(response)
  },

  getEvent: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  updateEvent: async (id: number, eventData: any) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    })
    return handleResponse(response)
  },

  deleteEvent: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/events/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete event")
    }
  },
}

// Budget API
export const budgetAPI = {
  getBudgetItems: async (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const response = await fetch(`${API_BASE_URL}/budget/?${queryString}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  createBudgetItem: async (budgetData: any) => {
    const response = await fetch(`${API_BASE_URL}/budget/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(budgetData),
    })
    return handleResponse(response)
  },

  updateBudgetItem: async (id: number, budgetData: any) => {
    const response = await fetch(`${API_BASE_URL}/budget/${id}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(budgetData),
    })
    return handleResponse(response)
  },

  deleteBudgetItem: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/budget/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete budget item")
    }
  },
}

// Guests API
export const guestsAPI = {
  getGuests: async (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const response = await fetch(`${API_BASE_URL}/guests/?${queryString}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  createGuest: async (guestData: any) => {
    const response = await fetch(`${API_BASE_URL}/guests/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(guestData),
    })
    return handleResponse(response)
  },

  updateGuest: async (id: number, guestData: any) => {
    const response = await fetch(`${API_BASE_URL}/guests/${id}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(guestData),
    })
    return handleResponse(response)
  },

  deleteGuest: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/guests/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete guest")
    }
  },
}

// Vendors API
export const vendorsAPI = {
  getVendors: async (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const response = await fetch(`${API_BASE_URL}/vendors/?${queryString}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  createVendor: async (vendorData: any) => {
    const response = await fetch(`${API_BASE_URL}/vendors/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(vendorData),
    })
    return handleResponse(response)
  },

  updateVendor: async (id: number, vendorData: any) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(vendorData),
    })
    return handleResponse(response)
  },

  deleteVendor: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/vendors/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error("Failed to delete vendor")
    }
  },
}
