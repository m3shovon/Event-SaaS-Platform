import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Vendor {
  id: number
  name: string
  category: string
  email: string
  phone: string
  address: string
  website: string
  rating: number
  price_range: string
  services: string
  notes: string
  is_preferred: boolean
  created_at: string
}

interface VendorState {
  vendors: Vendor[]
  preferredVendors: Vendor[]
  isLoading: boolean
  error: string | null
}

const initialState: VendorState = {
  vendors: [],
  preferredVendors: [],
  isLoading: false,
  error: null,
}

export const fetchVendors = createAsyncThunk("vendors/fetchVendors", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:8888/api/vendors/", {
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

export const createVendor = createAsyncThunk("vendors/createVendor", async (vendorData: any, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:8888/api/vendors/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vendorData),
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

export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async ({ id, vendorData }: { id: number; vendorData: any }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:8888/api/vendors/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vendorData),
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

export const deleteVendor = createAsyncThunk("vendors/deleteVendor", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:8888/api/vendors/${id}/`, {
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

export const fetchVendor = createAsyncThunk("vendors/fetchVendor", async (id: number, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token")
    const response = await fetch(`http://localhost:8888/api/vendors/${id}/`, {
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

const vendorSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false
        state.vendors = action.payload
        state.preferredVendors = action.payload.filter((vendor: Vendor) => vendor.is_preferred)
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to fetch vendors"
      })
      // Create Vendor
      .addCase(createVendor.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.isLoading = false
        state.vendors.push(action.payload)
        if (action.payload.is_preferred) {
          state.preferredVendors.push(action.payload)
        }
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message || "Failed to create vendor"
      })
      // Update Vendor
      .addCase(updateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex((vendor) => vendor.id === action.payload.id)
        if (index !== -1) {
          state.vendors[index] = action.payload
        }
        // Update preferred vendors
        state.preferredVendors = state.vendors.filter((vendor) => vendor.is_preferred)
      })
      // Delete Vendor
      .addCase(deleteVendor.fulfilled, (state, action) => {
        state.vendors = state.vendors.filter((vendor) => vendor.id !== action.payload)
        state.preferredVendors = state.preferredVendors.filter((vendor) => vendor.id !== action.payload)
      })
      // Fetch Vendor
      .addCase(fetchVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex((vendor) => vendor.id === action.payload.id)
        if (index !== -1) {
          state.vendors[index] = action.payload
        } else {
          state.vendors.push(action.payload)
        }
      })
  },
})

export const { clearError } = vendorSlice.actions
export default vendorSlice.reducer
