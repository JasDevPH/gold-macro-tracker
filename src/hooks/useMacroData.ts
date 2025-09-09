import { useEffect } from "react";
import {
  useGetAllMacroDataQuery,
  useGetFredBLSDataQuery,
  useGetYahooDataQuery,
  useGetNewsQuery,
} from "@/redux/slices/apiSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setMacroData, setLoading, setError } from "@/redux/slices/macroSlice";
import { calculateBias } from "@/redux/slices/biasSlice";
import { useAutoRefresh } from "./useAutoRefresh";

export const useMacroData = () => {
  const dispatch = useAppDispatch();
  const { data, error, isLoading, refetch } = useGetAllMacroDataQuery();
  const autoRefreshEnabled = useAppSelector(
    (state) => state.user.preferences.autoRefreshEnabled
  );

  // Separate queries for different refresh schedules
  const { refetch: refetchFredBLS } = useGetFredBLSDataQuery();
  const { refetch: refetchYahoo } = useGetYahooDataQuery();
  const { refetch: refetchNews } = useGetNewsQuery();

  // Auto-refresh Yahoo data every 5 minutes
  useAutoRefresh({
    onRefresh: () => {
      refetchYahoo();
      refetch(); // Update combined data
    },
    interval: 5 * 60 * 1000, // 5 minutes
    enabled: autoRefreshEnabled,
  });

  // Auto-refresh News every 10 minutes
  useAutoRefresh({
    onRefresh: () => refetchNews(),
    interval: 10 * 60 * 1000, // 10 minutes
    enabled: autoRefreshEnabled,
  });

  // Auto-refresh FRED/BLS at scheduled times (8:31 AM and 10:01 AM EST)
  useAutoRefresh({
    onRefresh: () => {
      refetchFredBLS();
      refetch(); // Update combined data
    },
    scheduledTimes: ["08:31", "10:01"], // EST times
    enabled: autoRefreshEnabled,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));

    if (data) {
      dispatch(setMacroData(data));
      dispatch(calculateBias(data));
    }

    if (error) {
      dispatch(setError("Failed to fetch macro data"));
    }
  }, [data, error, isLoading, dispatch]);

  return { data, error, isLoading, refetch };
};
