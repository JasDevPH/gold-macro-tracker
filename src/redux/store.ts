import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./slices/apiSlice";
import macroSlice from "./slices/macroSlice";
import biasSlice from "./slices/biasSlice";
import userSlice from "./slices/userSlice";
import newsSlice from "./slices/newsSlice";

export const store = configureStore({
  reducer: {
    api: apiSlice.reducer,
    macro: macroSlice,
    bias: biasSlice,
    user: userSlice,
    news: newsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
