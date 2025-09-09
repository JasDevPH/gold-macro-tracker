import { NextRequest, NextResponse } from "next/server";

const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";

interface YahooResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          close: number[];
        }>;
      };
    }>;
  };
}

async function fetchYahooData(symbol: string) {
  try {
    const response = await fetch(
      `${YAHOO_BASE_URL}/${symbol}?interval=1d&range=1d`
    );
    const data: YahooResponse = await response.json();

    const result = data.chart.result[0];
    const price =
      result.meta.regularMarketPrice ||
      result.indicators.quote[0].close.slice(-1)[0];

    return price;
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const goldPrice = await fetchYahooData("GC=F");
    const dxyPrice = await fetchYahooData("DX-Y.NYB");

    const data = {
      gold: goldPrice,
      dxy: dxyPrice,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Yahoo Finance API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Yahoo Finance data" },
      { status: 500 }
    );
  }
}
