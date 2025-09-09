export interface MacroData {
  cpi: number | null;
  dxy: number | null;
  gold: number | null;
  yields10y: number | null;
  fedRate: number | null;
  nfp: number | null;
  lastUpdated: string;
}

export interface BiasState {
  score: number;
  label:
    | "Strong Bullish"
    | "Bullish"
    | "Neutral"
    | "Bearish"
    | "Strong Bearish";
  factors: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface NewsData {
  items: NewsItem[];
  lastUpdated: string;
  filtered?: {
    total: number;
    afterRelevanceFilter: number;
    afterDuplicateFilter: number;
  };
}

export interface UserState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
  preferences: {
    theme: "light" | "dark";
    alertsEnabled: boolean;
    biasThreshold: number;
    autoRefreshEnabled: boolean;
  };
}
