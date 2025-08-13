import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api"

interface UserSettings {
  id: number
  email_notifications: boolean
  sms_notifications: boolean
  whatsapp_notifications: boolean
  event_reminders: boolean
  marketing_emails: boolean
  data_export_format: "csv" | "excel"
  default_event_privacy: "private" | "public"
  auto_backup: boolean
}

interface SettingsState {
  settings: UserSettings | null
  loading: boolean
  error: string | null
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
}

// Async thunks
export const fetchSettings = createAsyncThunk("settings/fetchSettings", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.getSettings()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (settingsData: Partial<UserSettings>, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateSettings(settingsData)
      return response.settings
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false
        state.settings = action.payload
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false
        state.settings = action.payload
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = settingsSlice.actions
export default settingsSlice.reducer
