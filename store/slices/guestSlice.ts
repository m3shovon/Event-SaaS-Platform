import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api"

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

export const fetchGuests = createAsyncThunk(
  "guests/fetchGuests",
  async (params?: Record<string, string>, { rejectWithValue }) => {
    try {
      const data = await apiClient.getGuests(params)
      return data
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" })
    }
  },
)

export const createGuest = createAsyncThunk("guests/createGuest", async (guestData: any, { rejectWithValue }) => {
  try {
    const data = await apiClient.createGuest(guestData)
    return data
  } catch (error: any) {
    return rejectWithValue({ message: error.message || "Network error" })
  }
})

export const updateGuest = createAsyncThunk(
  "guests/updateGuest",
  async ({ id, guestData }: { id: number; guestData: any }, { rejectWithValue }) => {
    try {
      const data = await apiClient.updateGuest(id, guestData)
      return data
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" })
    }
  },
)

export const deleteGuest = createAsyncThunk("guests/deleteGuest", async (id: number, { rejectWithValue }) => {
  try {
    await apiClient.deleteGuest(id)
    return id
  } catch (error: any) {
    return rejectWithValue({ message: error.message || "Network error" })
  }
})

export const fetchGuest = createAsyncThunk("guests/fetchGuest", async (id: number, { rejectWithValue }) => {
  try {
    const data = await apiClient.getGuest(id)
    return data
  } catch (error: any) {
    return rejectWithValue({ message: error.message || "Network error" })
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
