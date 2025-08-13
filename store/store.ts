import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import eventReducer from "./slices/eventSlice"
import budgetReducer from "./slices/budgetSlice"
import guestReducer from "./slices/guestSlice"
import vendorReducer from "./slices/vendorSlice"
import analyticsReducer from "./slices/analyticsSlice"
import settingsReducer from "./slices/settingsSlice"
import billingReducer from "./slices/billingSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
    budget: budgetReducer,
    guests: guestReducer,
    vendors: vendorReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
    billing: billingReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
