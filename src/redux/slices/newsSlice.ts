/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NewsItem } from "@/types";

interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
  filterStats?: {
    total: number;
    afterRelevanceFilter: number;
    afterDuplicateFilter: number;
  };
}

const initialState: NewsState = {
  items: [],
  loading: false,
  error: null,
};

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {
    setNews: (
      state,
      action: PayloadAction<{
        items: NewsItem[];
        filterStats?: any;
      }>
    ) => {
      state.items = action.payload.items;
      state.filterStats = action.payload.filterStats;
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

export const { setNews, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer;
