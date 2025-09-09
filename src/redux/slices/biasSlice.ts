import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BiasState } from "@/types";

const initialState: BiasState = {
  score: 0,
  label: "Neutral",
  factors: [],
};

const biasSlice = createSlice({
  name: "bias",
  initialState,
  reducers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    calculateBias: (state, action: PayloadAction<any>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cpi, dxy, gold, yields10y, fedRate, nfp } = action.payload;

      let score = 0;
      const factors: string[] = [];

      // CPI rules
      if (cpi > 3) {
        score += 2;
        factors.push("High inflation (+2)");
      }

      // DXY rules
      if (dxy < 100) {
        score += 1;
        factors.push("Weak dollar (+1)");
      } else if (dxy > 105) {
        score -= 1;
        factors.push("Strong dollar (-1)");
      }

      // Fed Rate rules
      if (fedRate < 2) {
        score += 2;
        factors.push("Low Fed rates (+2)");
      }

      // Yields rules
      if (yields10y < 3) {
        score += 1;
        factors.push("Low yields (+1)");
      }

      // Jobs rules
      if (nfp < 150000) {
        score += 1;
        factors.push("Weak jobs (+1)");
      }

      state.score = score;
      state.factors = factors;

      // Determine label
      if (score >= 4) state.label = "Strong Bullish";
      else if (score >= 2) state.label = "Bullish";
      else if (score <= -4) state.label = "Strong Bearish";
      else if (score <= -2) state.label = "Bearish";
      else state.label = "Neutral";
    },
  },
});

export const { calculateBias } = biasSlice.actions;
export default biasSlice.reducer;
