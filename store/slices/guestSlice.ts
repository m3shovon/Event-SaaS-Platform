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
  checked_in: boolean
  invitation_sent: boolean
  invitation_sent_date: string | null
  check_in_time: string | null
  created_at: string
  updated_at: string
  total_attendees: number
}

interface GuestStats {
  total_guests: number
  total_attendees: number
  confirmed_guests: number
  confirmed_attendees: number
  pending_guests: number
  declined_guests: number
  checked_in_guests: number
}

interface GuestState {
  guests: Guest[]
  currentGuest: Guest | null
  stats: GuestStats | null
  isLoading: boolean
  error: string | null
}

const initialState: GuestState = {
  guests: [],
  currentGuest: null,
  stats: null,
  isLoading: false,
  error: null,
}

export const fetchGuests = createAsyncThunk("guests/fetchGuests", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:8888/api/guests/", {
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
    setCurrentGuest: (state, action) => {
      state.currentGuest = action.payload
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
        if (action.payload.results) {
          // Paginated response
          state.guests = action.payload.results
          state.stats = action.payload.stats
        } else {
          // Direct array response
          state.guests = Array.isArray(action.payload) ? action.payload : []
          state.stats = null
        }
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
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to create guest"
      })
      // Update Guest
      .addCase(updateGuest.fulfilled, (state, action) => {
        const index = state.guests.findIndex((guest) => guest.id === action.payload.id)
        if (index !== -1) {
          state.guests[index] = action.payload
        }
      })
      // Delete Guest
      .addCase(deleteGuest.fulfilled, (state, action) => {
        state.guests = state.guests.filter((guest) => guest.id !== action.payload)
      })
      // Fetch Guest
      .addCase(fetchGuest.fulfilled, (state, action) => {
        state.currentGuest = action.payload
        const index = state.guests.findIndex((guest) => guest.id === action.payload.id)
        if (index !== -1) {
          state.guests[index] = action.payload
        } else {
          state.guests.push(action.payload)
        }
      })
  },
})

export const { clearError, setCurrentGuest } = guestSlice.actions
export default guestSlice.reducer
