import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "@/types";

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  preferences: {
    theme: "light",
    alertsEnabled: true,
    biasThreshold: 3,
    autoRefreshEnabled: true,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState["user"]>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserState["preferences"]>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    toggleAutoRefresh: (state) => {
      state.preferences.autoRefreshEnabled =
        !state.preferences.autoRefreshEnabled;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updatePreferences, toggleAutoRefresh, logout } =
  userSlice.actions;
export default userSlice.reducer;
