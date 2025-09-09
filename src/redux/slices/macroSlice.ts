import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MacroData } from "@/types";

interface MacroState {
  data: MacroData;
  loading: boolean;
  error: string | null;
}

const initialState: MacroState = {
  data: {
    cpi: null,
    dxy: null,
    gold: null,
    yields10y: null,
    fedRate: null,
    nfp: null,
    lastUpdated: "",
  },
  loading: false,
  error: null,
};

const macroSlice = createSlice({
  name: "macro",
  initialState,
  reducers: {
    setMacroData: (state, action: PayloadAction<MacroData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setMacroData, setLoading, setError } = macroSlice.actions;
export default macroSlice.reducer;
