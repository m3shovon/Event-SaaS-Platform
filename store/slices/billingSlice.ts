import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api"

interface SubscriptionPlan {
  id: number
  name: string
  display_name: string
  description: string
  price_monthly: number
  price_yearly: number
  max_events: number
  max_guests_per_event: number
  max_vendors: number
  features: string[]
  is_active: boolean
}

interface UserSubscription {
  id: number
  plan: SubscriptionPlan
  billing_cycle: "monthly" | "yearly"
  status: "active" | "cancelled" | "expired" | "pending"
  current_period_start: string
  current_period_end: string
}

interface PaymentRequest {
  id: number
  plan_name: string
  amount: number
  currency: string
  payment_method: string
  transaction_id: string
  payment_proof: string
  notes: string
  status: "pending" | "submitted" | "verified" | "approved" | "rejected"
  admin_notes: string
  created_at: string
  submitted_at: string
}

interface PaymentHistory {
  id: number
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "refunded"
  payment_method: string
  transaction_id: string
  created_at: string
}

interface BillingState {
  plans: SubscriptionPlan[]
  currentSubscription: UserSubscription | null
  paymentRequests: PaymentRequest[]
  paymentHistory: PaymentHistory[]
  loading: boolean
  error: string | null
  paymentLoading: boolean
}

const initialState: BillingState = {
  plans: [],
  currentSubscription: null,
  paymentRequests: [],
  paymentHistory: [],
  loading: false,
  error: null,
  paymentLoading: false,
}

// Async thunks
export const fetchSubscriptionPlans = createAsyncThunk("billing/fetchPlans", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.getSubscriptionPlans()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchCurrentSubscription = createAsyncThunk(
  "billing/fetchCurrentSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getCurrentSubscription()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const fetchPaymentRequests = createAsyncThunk("billing/fetchPaymentRequests", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.getPaymentRequests()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const fetchPaymentHistory = createAsyncThunk("billing/fetchPaymentHistory", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.getPaymentHistory()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

export const createPaymentRequest = createAsyncThunk(
  "billing/createPaymentRequest",
  async (
    {
      planId,
      billingCycle,
      paymentMethod,
      transactionId,
      paymentProof,
      notes,
    }: {
      planId: number
      billingCycle: "monthly" | "yearly"
      paymentMethod: string
      transactionId: string
      paymentProof: string
      notes: string
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await apiClient.createPaymentRequest({
        plan_id: planId,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        payment_proof: paymentProof,
        notes: notes,
      })
      return response.payment_request
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  },
)

export const cancelSubscription = createAsyncThunk("billing/cancelSubscription", async (_, { rejectWithValue }) => {
  try {
    await apiClient.cancelSubscription()
    return null
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch plans
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false
        state.plans = action.payload
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch current subscription
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.currentSubscription = action.payload
      })
      // Fetch payment requests
      .addCase(fetchPaymentRequests.fulfilled, (state, action) => {
        state.paymentRequests = action.payload
      })
      // Fetch payment history
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload
      })
      // Create payment request
      .addCase(createPaymentRequest.pending, (state) => {
        state.paymentLoading = true
        state.error = null
      })
      .addCase(createPaymentRequest.fulfilled, (state, action) => {
        state.paymentLoading = false
        state.paymentRequests.unshift(action.payload)
      })
      .addCase(createPaymentRequest.rejected, (state, action) => {
        state.paymentLoading = false
        state.error = action.payload as string
      })
      // Cancel subscription
      .addCase(cancelSubscription.fulfilled, (state) => {
        if (state.currentSubscription) {
          state.currentSubscription.status = "cancelled"
        }
      })
  },
})

export const { clearError } = billingSlice.actions
export default billingSlice.reducer
