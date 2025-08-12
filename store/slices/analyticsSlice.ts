import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { apiClient } from "../../lib/api"

export interface EventAnalytics {
  event: {
    id: number
    name: string
    date: string
    status: string
    category: string
    budget: number
    expected_guests: number
  }
  budget: {
    stats: {
      total_estimated: number
      total_actual: number
      total_items: number
      paid_items: number
      pending_items: number
      overdue_items: number
    }
    by_category: Array<{
      category: string
      estimated: number
      actual: number
      count: number
    }>
    timeline: Array<{
      month: string
      amount: number
      count: number
    }>
    budget_utilization: number
    variance: number
  }
  guests: {
    stats: {
      total_guests: number
      total_attendees: number
      confirmed_guests: number
      confirmed_attendees: number
      pending_guests: number
      declined_guests: number
      checked_in_guests: number
      checked_in_attendees: number
    }
    by_category: Array<{
      category: string
      count: number
      attendees: number
      confirmed: number
    }>
    timeline: Array<{
      month: string
      count: number
      attendees: number
    }>
    rsvp_rate: number
    attendance_rate: number
  }
  vendors: {
    stats: {
      total_vendors: number
      avg_rating: number
      preferred_vendors: number
    }
    by_category: Array<{
      category: string
      count: number
      avg_rating: number
    }>
  }
  progress: {
    days_until_event: number
    is_past_event: boolean
    planning_progress: number
  }
  generated_at: string
}

export interface OverallAnalytics {
  overall_stats: {
    total_events: number
    active_events: number
    completed_events: number
    total_budget: number
    total_expected_guests: number
  }
  events_by_category: Array<{
    category: string
    count: number
    total_budget: number
  }>
  events_by_status: Array<{
    status: string
    count: number
  }>
  monthly_trend: Array<{
    month: string
    count: number
  }>
  recent_events: Array<{
    id: number
    name: string
    date: string
    status: string
    category: string
    budget: number
  }>
  generated_at: string
}

interface AnalyticsState {
  eventAnalytics: EventAnalytics | null
  overallAnalytics: OverallAnalytics | null
  loading: boolean
  error: string | null
}

const initialState: AnalyticsState = {
  eventAnalytics: null,
  overallAnalytics: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchEventAnalytics = createAsyncThunk("analytics/fetchEventAnalytics", async (eventId: number) => {
  const response = await apiClient.getEventAnalytics(eventId)
  return response
})

export const fetchOverallAnalytics = createAsyncThunk("analytics/fetchOverallAnalytics", async () => {
  const response = await apiClient.getOverallAnalytics()
  return response
})

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalytics: (state) => {
      state.eventAnalytics = null
      state.overallAnalytics = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Event Analytics
      .addCase(fetchEventAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventAnalytics.fulfilled, (state, action: PayloadAction<EventAnalytics>) => {
        state.loading = false
        state.eventAnalytics = action.payload
      })
      .addCase(fetchEventAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch event analytics"
      })
      // Overall Analytics
      .addCase(fetchOverallAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOverallAnalytics.fulfilled, (state, action: PayloadAction<OverallAnalytics>) => {
        state.loading = false
        state.overallAnalytics = action.payload
      })
      .addCase(fetchOverallAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch overall analytics"
      })
  },
})

export const { clearAnalytics } = analyticsSlice.actions
export default analyticsSlice.reducer
