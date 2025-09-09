import { NextRequest, NextResponse } from "next/server";

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

interface FredResponse {
  observations: Array<{
    date: string;
    value: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    if (!FRED_API_KEY) {
      return NextResponse.json(
        { error: "FRED API key not configured" },
        { status: 500 }
      );
    }

    const cpiResponse = await fetch(
      `${FRED_BASE_URL}?series_id=CPIAUCSL&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
    );
    const cpiData: FredResponse = await cpiResponse.json();

    const yieldsResponse = await fetch(
      `${FRED_BASE_URL}?series_id=GS10&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
    );
    const yieldsData: FredResponse = await yieldsResponse.json();

    const fedResponse = await fetch(
      `${FRED_BASE_URL}?series_id=FEDFUNDS&api_key=${FRED_API_KEY}&file_type=json&limit=1&sort_order=desc`
    );
    const fedData: FredResponse = await fedResponse.json();

    const data = {
      cpi: cpiData.observations?.[0]
        ? parseFloat(cpiData.observations[0].value)
        : null,
      yields10y: yieldsData.observations?.[0]
        ? parseFloat(yieldsData.observations[0].value)
        : null,
      fedRate: fedData.observations?.[0]
        ? parseFloat(fedData.observations[0].value)
        : null,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("FRED API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch FRED data" },
      { status: 500 }
    );
  }
}
