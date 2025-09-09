/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { MacroData, NewsData } from "@/types";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  tagTypes: ["Macro", "News", "Bias", "User", "FredBls", "Yahoo"],
  endpoints: (builder) => ({
    // FRED Data
    getFredData: builder.query<Partial<MacroData>, void>({
      query: () => "/macro/fred",
      providesTags: ["FredBls"],
    }),

    // Yahoo Finance Data
    getYahooData: builder.query<Partial<MacroData>, void>({
      query: () => "/macro/yahoo",
      providesTags: ["Yahoo"],
    }),

    // BLS Data
    getBLSData: builder.query<
      { nfp: number | null; period: string; year: string },
      void
    >({
      query: () => "/macro/bls",
      providesTags: ["FredBls"],
    }),

    // News Data
    getNews: builder.query<NewsData, void>({
      query: () => "/news",
      providesTags: ["News"],
    }),

    // Combined FRED + BLS Data (scheduled refresh)
    getFredBLSData: builder.query<any, void>({
      queryFn: async (arg, api, extraOptions, fetchWithBQ) => {
        try {
          const fredResult = await fetchWithBQ("/macro/fred");
          const blsResult = await fetchWithBQ("/macro/bls");

          if (fredResult.error) return { error: fredResult.error };
          if (blsResult.error) return { error: blsResult.error };

          const fredData = fredResult.data as Record<string, any>;
          const blsData = blsResult.data as Record<string, any>;

          return {
            data: {
              ...fredData,
              ...blsData,
            },
          };
        } catch (error) {
          return {
            error: { status: 500, data: "Failed to fetch FRED/BLS data" },
          };
        }
      },
      providesTags: ["FredBls"],
    }),

    // Combined All Macro Data
    getAllMacroData: builder.query<MacroData, void>({
      queryFn: async (arg, api, extraOptions, fetchWithBQ) => {
        try {
          const fredResult = await fetchWithBQ("/macro/fred");
          const yahooResult = await fetchWithBQ("/macro/yahoo");
          const blsResult = await fetchWithBQ("/macro/bls");

          if (fredResult.error) return { error: fredResult.error };
          if (yahooResult.error) return { error: yahooResult.error };
          if (blsResult.error) return { error: blsResult.error };

          const fredData = fredResult.data as Record<string, any>;
          const yahooData = yahooResult.data as Record<string, any>;
          const blsData = blsResult.data as Record<string, any>;

          const combinedData: MacroData = {
            cpi: fredData.cpi,
            yields10y: fredData.yields10y,
            fedRate: fredData.fedRate,
            gold: yahooData.gold,
            dxy: yahooData.dxy,
            nfp: blsData.nfp,
            lastUpdated: new Date().toISOString(),
          };

          return { data: combinedData };
        } catch (error) {
          return { error: { status: 500, data: "Failed to fetch macro data" } };
        }
      },
      providesTags: ["Macro"],
    }),
  }),
});

export const {
  useGetFredDataQuery,
  useGetYahooDataQuery,
  useGetBLSDataQuery,
  useGetNewsQuery,
  useGetFredBLSDataQuery,
  useGetAllMacroDataQuery,
} = apiSlice;
