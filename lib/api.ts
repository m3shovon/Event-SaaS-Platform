const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888/api"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    return headers
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Network error" }))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Auth methods
  async register(userData: any) {
    return this.request("/auth/signup/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/signin/", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async logout() {
    return this.request("/auth/logout/", {
      method: "POST",
    })
  }

  async getUser() {
    return this.request("/auth/user/")
  }

  // Auth Profile methods
  async getProfile() {
    return this.request("/auth/profile/")
  }

  async updateProfile(profileData: any) {
    return this.request("/auth/profile/", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  // Event methods
  async getEvents(params?: Record<string, string>) {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const endpoint = queryString ? `/events/?${queryString}` : "/events/"
    return this.request(endpoint)
  }

  async getEvent(id: number) {
    return this.request(`/events/${id}/`)
  }

  async createEvent(eventData: any) {
    return this.request("/events/", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  }

  async updateEvent(id: number, eventData: any) {
    return this.request(`/events/${id}/`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    })
  }

  async deleteEvent(id: number) {
    return this.request(`/events/${id}/`, {
      method: "DELETE",
    })
  }

  // Budget methods
  async getBudgetItems(params?: Record<string, string>) {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const endpoint = queryString ? `/budget/?${queryString}` : "/budget/"
    return this.request(endpoint)
  }

  async getBudgetItem(id: number) {
    return this.request(`/budget/${id}/`)
  }

  async createBudgetItem(budgetData: any) {
    return this.request("/budget/", {
      method: "POST",
      body: JSON.stringify(budgetData),
    })
  }

  async updateBudgetItem(id: number, budgetData: any) {
    return this.request(`/budget/${id}/`, {
      method: "PUT",
      body: JSON.stringify(budgetData),
    })
  }

  async deleteBudgetItem(id: number) {
    return this.request(`/budget/${id}/`, {
      method: "DELETE",
    })
  }

  // Guest methods
  async getGuests(params?: Record<string, string>) {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const endpoint = queryString ? `/guests/?${queryString}` : "/guests/"
    return this.request(endpoint)
  }

  async getGuest(id: number) {
    return this.request(`/guests/${id}/`)
  }

  async createGuest(guestData: any) {
    return this.request("/guests/", {
      method: "POST",
      body: JSON.stringify(guestData),
    })
  }

  async updateGuest(id: number, guestData: any) {
    return this.request(`/guests/${id}/`, {
      method: "PUT",
      body: JSON.stringify(guestData),
    })
  }

  async deleteGuest(id: number) {
    return this.request(`/guests/${id}/`, {
      method: "DELETE",
    })
  }

  // Vendor methods
  async getVendors(params?: Record<string, string>) {
    const queryString = params ? new URLSearchParams(params).toString() : ""
    const endpoint = queryString ? `/vendors/?${queryString}` : "/vendors/"
    return this.request(endpoint)
  }

  async getVendor(id: number) {
    return this.request(`/vendors/${id}/`)
  }

  async createVendor(vendorData: any) {
    return this.request("/vendors/", {
      method: "POST",
      body: JSON.stringify(vendorData),
    })
  }

  async updateVendor(id: number, vendorData: any) {
    return this.request(`/vendors/${id}/`, {
      method: "PUT",
      body: JSON.stringify(vendorData),
    })
  }

  async deleteVendor(id: number) {
    return this.request(`/vendors/${id}/`, {
      method: "DELETE",
    })
  }

  // Analytics methods
  async getEventAnalytics(eventId: number) {
    return this.request(`/analytics/event/${eventId}/`)
  }

  async getOverallAnalytics() {
    return this.request("/analytics/overall/")
  }

  // WhatsApp methods
  async createWhatsAppGroup(eventId: number) {
    return this.request("/whatsapp/create-group/", {
      method: "POST",
      body: JSON.stringify({ event_id: eventId }),
    })
  }

  async getEventContacts(eventId: number) {
    return this.request(`/whatsapp/contacts/${eventId}/`)
  }

  async getWhatsAppSettings() {
    return this.request("/whatsapp/settings/")
  }

  async updateWhatsAppSettings(settingsData: any) {
    return this.request("/whatsapp/settings/", {
      method: "PUT",
      body: JSON.stringify(settingsData),
    })
  }
}

export const apiClient = new ApiClient()
