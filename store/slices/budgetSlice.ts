import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface BudgetItem {
  id: number
  event: number
  category: string
  item_name: string
  estimated_cost: number
  actual_cost: number
  notes: string
  status: string
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
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:8888/api/budget/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (!response.ok) {
      return rejectWithValue(data)
    }
    return Array.isArray(data) ? data : data.results || []
  } catch (error) {
    return rejectWithValue({ message: "Network error" })
  }
})

export const createBudgetItem = createAsyncThunk(
  "budget/createBudgetItem",
  async (budgetData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:8888/api/budget/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
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

export const updateBudgetItem = createAsyncThunk(
  "budget/updateBudgetItem",
  async ({ id, budgetData }: { id: number; budgetData: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8888/api/budget/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
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

export const deleteBudgetItem = createAsyncThunk("budget/deleteBudgetItem", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:8888/api/budget/${id}/`, {
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

export const fetchBudgetItem = createAsyncThunk("budget/fetchBudgetItem", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:8888/api/budget/${id}/`, {
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
      .addCase(updateBudgetItem.fulfilled, (state, action) => {
        const index = state.budgetItems.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.budgetItems[index] = action.payload
        }
      })
      // Delete Budget Item
      .addCase(deleteBudgetItem.fulfilled, (state, action) => {
        state.budgetItems = state.budgetItems.filter((item) => item.id !== action.payload)
      })
      // Fetch Budget Item
      .addCase(fetchBudgetItem.fulfilled, (state, action) => {
        state.currentBudgetItem = action.payload
        const index = state.budgetItems.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.budgetItems[index] = action.payload
        } else {
          state.budgetItems.push(action.payload)
        }
      })
  },
})

export const { clearError, setCurrentBudgetItem } = budgetSlice.actions
export default budgetSlice.reducer
