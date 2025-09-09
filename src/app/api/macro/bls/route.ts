import { NextRequest, NextResponse } from "next/server";

const BLS_API_KEY = process.env.BLS_API_KEY;
const BLS_BASE_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data";
const NFP_SERIES_ID = "CES0000000001";

interface BLSResponse {
  Results: {
    series: Array<{
      data: Array<{
        year: string;
        period: string;
        value: string;
        periodName: string;
      }>;
    }>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const currentYear = new Date().getFullYear();
    const requestBody = {
      seriesid: [NFP_SERIES_ID],
      startyear: currentYear.toString(),
      endyear: currentYear.toString(),
      registrationkey: BLS_API_KEY,
    };

    const response = await fetch(BLS_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: BLSResponse = await response.json();

    const seriesData = data.Results?.series?.[0]?.data;
    const latestData = seriesData?.[0];

    const nfp = latestData ? parseFloat(latestData.value) * 1000 : null;

    const result = {
      nfp: nfp,
      period: latestData?.periodName || null,
      year: latestData?.year || null,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("BLS API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch BLS data" },
      { status: 500 }
    );
  }
}
