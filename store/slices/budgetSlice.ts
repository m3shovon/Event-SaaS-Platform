import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { apiClient } from "@/lib/api"

interface BudgetItem {
  id: number
  event: number
  category: string
  item_name: string
  estimated_cost: number
  actual_cost: number | null
  vendor: number | null
  vendor_name: string | null
  status: string
  due_date: string
  notes: string
  created_at: string
}

interface BudgetState {
  budgetItems: BudgetItem[]
  currentBudgetItem: BudgetItem | null
  isLoading: boolean
  error: string | null
}

const initialState: BudgetState = {
  budgetItems: [],
  currentBudgetItem: null,
  isLoading: false,
  error: null,
}

export const fetchBudgetItems = createAsyncThunk("budget/fetchBudgetItems", async (_, { rejectWithValue }) => {
  try {
    const data = await apiClient.getBudgetItems()
    return Array.isArray(data) ? data : data.results || []
  } catch (error: any) {
    return rejectWithValue({ message: error.message || "Network error" })
  }
})

export const createBudgetItem = createAsyncThunk(
  "budget/createBudgetItem",
  async (budgetData: any, { rejectWithValue }) => {
    try {
      const data = await apiClient.createBudgetItem(budgetData)
      return data
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" })
    }
  },
)

export const updateBudgetItem = createAsyncThunk(
  "budget/updateBudgetItem",
  async ({ id, budgetData }: { id: number; budgetData: any }, { rejectWithValue }) => {
    try {
      const data = await apiClient.updateBudgetItem(id, budgetData)
      return data
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" })
    }
  },
)

export const deleteBudgetItem = createAsyncThunk("budget/deleteBudgetItem", async (id: number, { rejectWithValue }) => {
  try {
    await apiClient.deleteBudgetItem(id)
    return id
  } catch (error: any) {
    return rejectWithValue({ message: error.message || "Network error" })
  }
})

export const fetchBudgetItem = createAsyncThunk("budget/fetchBudgetItem", async (id: number, { rejectWithValue }) => {
  try {
    const data = await apiClient.getBudgetItem(id)
    return data
  } catch (error: any) {
    return rejectWithValue({ message: error.message || "Network error" })
  }
})

const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentBudgetItem: (state, action) => {
      state.currentBudgetItem = action.payload
    },
    clearCurrentBudgetItem: (state) => {
      state.currentBudgetItem = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgetItems.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBudgetItems.fulfilled, (state, action) => {
        state.isLoading = false
        state.budgetItems = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchBudgetItems.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to fetch budget items"
      })
      // Create Budget Item
      .addCase(createBudgetItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBudgetItem.fulfilled, (state, action) => {
        state.isLoading = false
        state.budgetItems.push(action.payload)
      })
      .addCase(createBudgetItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to create budget item"
      })
      // Update Budget Item
      .addCase(updateBudgetItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateBudgetItem.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.budgetItems.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.budgetItems[index] = action.payload
        }
        state.currentBudgetItem = action.payload
      })
      .addCase(updateBudgetItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to update budget item"
      })
      // Delete Budget Item
      .addCase(deleteBudgetItem.fulfilled, (state, action) => {
        state.budgetItems = state.budgetItems.filter((item) => item.id !== action.payload)
        if (state.currentBudgetItem?.id === action.payload) {
          state.currentBudgetItem = null
        }
      })
      // Fetch Budget Item
      .addCase(fetchBudgetItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBudgetItem.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentBudgetItem = action.payload
        const index = state.budgetItems.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.budgetItems[index] = action.payload
        } else {
          state.budgetItems.push(action.payload)
        }
      })
      .addCase(fetchBudgetItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to fetch budget item"
      })
  },
})

export const { clearError, setCurrentBudgetItem, clearCurrentBudgetItem } = budgetSlice.actions
export default budgetSlice.reducer
