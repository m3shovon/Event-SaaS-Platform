import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { eventsAPI } from "@/lib/api"

interface Event {
  id: number
  name: string
  category: string
  description: string
  date: string
  time: string
  venue: string
  budget: number
  expected_guests: number
  status: string
  created_at: string
  updated_at: string
}

interface EventState {
  events: Event[]
  currentEvent: Event | null
  isLoading: boolean
  error: string | null
}

const initialState: EventState = {
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,
}

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params?: Record<string, string>, { rejectWithValue }) => {
    try {
      const data = await eventsAPI.getEvents(params)
      return data.results || data
    } catch (error: any) {
      return rejectWithValue({ message: error.message })
    }
  },
)

export const createEvent = createAsyncThunk("events/createEvent", async (eventData: any, { rejectWithValue }) => {
  try {
    const data = await eventsAPI.createEvent(eventData)
    return data
  } catch (error: any) {
    return rejectWithValue({ message: error.message })
  }
})

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, eventData }: { id: number; eventData: any }, { rejectWithValue }) => {
    try {
      const data = await eventsAPI.updateEvent(id, eventData)
      return data
    } catch (error: any) {
      return rejectWithValue({ message: error.message })
    }
  },
)

export const deleteEvent = createAsyncThunk("events/deleteEvent", async (id: number, { rejectWithValue }) => {
  try {
    await eventsAPI.deleteEvent(id)
    return id
  } catch (error: any) {
    return rejectWithValue({ message: error.message })
  }
})

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false
        state.events = action.payload
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to fetch events"
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false
        state.events.push(action.payload)
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to create event"
      })
      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex((event) => event.id === action.payload.id)
        if (index !== -1) {
          state.events[index] = action.payload
        }
      })
      // Delete Event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((event) => event.id !== action.payload)
      })
  },
})

export const { clearError, setCurrentEvent } = eventSlice.actions
export default eventSlice.reducer
