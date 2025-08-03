import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { authAPI } from "@/lib/api"

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  business_name: string
  business_type: string
  phone: string
  country: string
  city: string
  subscription_plan: string
  is_verified: boolean
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const signupUser = createAsyncThunk("auth/signup", async (userData: any, { rejectWithValue }) => {
  try {
    const data = await authAPI.signup(userData)
    return data
  } catch (error: any) {
    return rejectWithValue({ message: error.message })
  }
})

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authAPI.signin(credentials)
      // Store tokens in localStorage
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("refresh_token", data.refresh_token)
      return data
    } catch (error: any) {
      return rejectWithValue({ message: error.message })
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Signup failed"
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Login failed"
      })
  },
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
