import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Guest {
  id: number
  event: number
  name: string
  email: string
  phone: string
  category: string
  rsvp_status: string
  plus_ones: number
  dietary_restrictions: string
  notes: string
  invitation_sent: boolean
  checked_in: boolean
  created_at: string
}

interface GuestState {
  guests: Guest[]
  totalGuests: number
  confirmedGuests: number
  pendingRSVPs: number
  isLoading: boolean
  error: string | null
}

const initialState: GuestState = {
  guests: [],
  totalGuests: 0,
  confirmedGuests: 0,
  pendingRSVPs: 0,
  isLoading: false,
  error: null,
}

export const fetchGuests = createAsyncThunk("guests/fetchGuests", async (eventId: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:8888/api/guests/?event=${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data)
    }
    return data
  } catch (error) {
    return rejectWithValue({ message: "Network error" })
  }
})

export const createGuest = createAsyncThunk("guests/createGuest", async (guestData: any, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:8888/api/guests/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(guestData),
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data)
    }
    return data
  } catch (error) {
    return rejectWithValue({ message: "Network error" })
  }
})

export const updateGuest = createAsyncThunk(
  "guests/updateGuest",
  async ({ id, guestData }: { id: number; guestData: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8888/api/guests/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(guestData),
      })
      const data = await response.json()
      if (!response.ok) {
        return rejectWithValue(data)
      }
      return data
    } catch (error) {
      return rejectWithValue({ message: "Network error" })
    }
  },
)

export const deleteGuest = createAsyncThunk("guests/deleteGuest", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:8888/api/guests/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!response.ok) {
      const data = await response.json()
      return rejectWithValue(data)
    }
    return id
  } catch (error) {
    return rejectWithValue({ message: "Network error" })
  }
})

export const fetchGuest = createAsyncThunk("guests/fetchGuest", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:8888/api/guests/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data)
    }
    return data
  } catch (error) {
    return rejectWithValue({ message: "Network error" })
  }
})

const guestSlice = createSlice({
  name: "guests",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuests.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.isLoading = false
        state.guests = action.payload
        state.totalGuests = action.payload.length
        state.confirmedGuests = action.payload.filter((guest: Guest) => guest.rsvp_status === "confirmed").length
        state.pendingRSVPs = action.payload.filter((guest: Guest) => guest.rsvp_status === "pending").length
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to fetch guests"
      })
      // Create Guest
      .addCase(createGuest.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.isLoading = false
        state.guests.push(action.payload)
        state.totalGuests += 1
        if (action.payload.rsvp_status === "confirmed") {
          state.confirmedGuests += 1
        } else if (action.payload.rsvp_status === "pending") {
          state.pendingRSVPs += 1
        }
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to create guest"
      })
      // Update Guest
      .addCase(updateGuest.fulfilled, (state, action) => {
        const index = state.guests.findIndex((guest) => guest.id === action.payload.id)
        if (index !== -1) {
          const oldGuest = state.guests[index]
          // Update counters
          if (oldGuest.rsvp_status === "confirmed" && action.payload.rsvp_status !== "confirmed") {
            state.confirmedGuests -= 1
          } else if (oldGuest.rsvp_status !== "confirmed" && action.payload.rsvp_status === "confirmed") {
            state.confirmedGuests += 1
          }
          if (oldGuest.rsvp_status === "pending" && action.payload.rsvp_status !== "pending") {
            state.pendingRSVPs -= 1
          } else if (oldGuest.rsvp_status !== "pending" && action.payload.rsvp_status === "pending") {
            state.pendingRSVPs += 1
          }
          state.guests[index] = action.payload
        }
      })
      // Delete Guest
      .addCase(deleteGuest.fulfilled, (state, action) => {
        const guest = state.guests.find((guest) => guest.id === action.payload)
        if (guest) {
          state.totalGuests -= 1
          if (guest.rsvp_status === "confirmed") {
            state.confirmedGuests -= 1
          } else if (guest.rsvp_status === "pending") {
            state.pendingRSVPs -= 1
          }
        }
        state.guests = state.guests.filter((guest) => guest.id !== action.payload)
      })
      // Fetch Guest
      .addCase(fetchGuest.fulfilled, (state, action) => {
        const index = state.guests.findIndex((guest) => guest.id === action.payload.id)
        if (index !== -1) {
          state.guests[index] = action.payload
        } else {
          state.guests.push(action.payload)
        }
      })
  },
})

export const { clearError } = guestSlice.actions
export default guestSlice.reducer
