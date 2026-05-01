import { configureStore } from "@reduxjs/toolkit";
import listingReducer from "./slices/listingSlice";

export const store = configureStore({
  reducer: {
    listing: listingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
