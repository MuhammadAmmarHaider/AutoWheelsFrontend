import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiBaseUrl } from "@/lib/api";

export type City = { id: string; name: string };
export type ModelOption = {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  fullName: string;
};

export type SellFormOptions = {
  cities: City[];
  models: ModelOption[];
};

export type UserMeResponse = {
  id: string;
  name: string;
  phone?: string | null;
};

interface ListingState {
  sellFormOptions: SellFormOptions | null;
  currentUser: UserMeResponse | null;
  loadingFormOptions: boolean;
  loadingUserData: boolean;
  error: string | null;
}

const initialState: ListingState = {
  sellFormOptions: null,
  currentUser: null,
  loadingFormOptions: false,
  loadingUserData: false,
  error: null,
};

export const fetchSellFormOptions = createAsyncThunk(
  "listing/fetchSellFormOptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<SellFormOptions>(
        `${getApiBaseUrl()}/listings/sell-form/options`,
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load form options";
      return rejectWithValue(message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "listing/fetchCurrentUser",
  async (token: string | null, { rejectWithValue }) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get<UserMeResponse>(
        `${getApiBaseUrl()}/users/me`,
        { headers },
      );
      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load user data";
      return rejectWithValue(message);
    }
  }
);

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellFormOptions.pending, (state) => {
        state.loadingFormOptions = true;
        state.error = null;
      })
      .addCase(
        fetchSellFormOptions.fulfilled,
        (state, action: PayloadAction<SellFormOptions>) => {
          state.loadingFormOptions = false;
          state.sellFormOptions = action.payload;
        }
      )
      .addCase(fetchSellFormOptions.rejected, (state, action) => {
        state.loadingFormOptions = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loadingUserData = true;
        state.error = null;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<UserMeResponse>) => {
          state.loadingUserData = false;
          state.currentUser = action.payload;
        }
      )
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loadingUserData = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = listingSlice.actions;
export default listingSlice.reducer;
