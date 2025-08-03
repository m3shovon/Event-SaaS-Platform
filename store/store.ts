import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import eventSlice from "./slices/eventSlice"
import budgetSlice from "./slices/budgetSlice"
import guestSlice from "./slices/guestSlice"
import vendorSlice from "./slices/vendorSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    events: eventSlice,
    budget: budgetSlice,
    guests: guestSlice,
    vendors: vendorSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
