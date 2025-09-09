"use client";
import { useState } from "react";
import { useMacroData } from "@/hooks/useMacroData";
import { useGetNewsQuery } from "@/redux/slices/apiSlice";
import { useAppSelector } from "@/redux/hooks";
import { useTimeAgo } from "@/hooks/useTimeAgo";
import { Card } from "@/components/ui/Card";
import { NewsModal } from "@/components/NewsModal";
import { formatNumber } from "@/lib/utils";
import { NewsItem } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MoreHorizontal,
} from "lucide-react";

export default function Dashboard() {
  const { data: macroData, isLoading: macroLoading } = useMacroData();
  const { data: newsData, isLoading: newsLoading } = useGetNewsQuery();
  const bias = useAppSelector((state) => state.bias);

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const macroTimeAgo = useTimeAgo(macroData?.lastUpdated);
  const newsTimeAgo = useTimeAgo(newsData?.lastUpdated);

  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  const getBiasConfig = (label: string) => {
    switch (label) {
      case "Strong Bullish":
        return {
          color: "text-emerald-500",
          bg: "bg-emerald-50",
          icon: TrendingUp,
          border: "border-emerald-200",
        };
      case "Bullish":
        return {
          color: "text-green-500",
          bg: "bg-green-50",
          icon: TrendingUp,
          border: "border-green-200",
        };
      case "Strong Bearish":
        return {
          color: "text-red-500",
          bg: "bg-red-50",
          icon: TrendingDown,
          border: "border-red-200",
        };
      case "Bearish":
        return {
          color: "text-orange-500",
          bg: "bg-orange-50",
          icon: TrendingDown,
          border: "border-orange-200",
        };
      default:
        return {
          color: "text-slate-500",
          bg: "bg-slate-50",
          icon: Minus,
          border: "border-slate-200",
        };
    }
  };

  const biasConfig = getBiasConfig(bias.label);
  const BiasIcon = biasConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-slate-900 tracking-tight">
            Gold Macro Tracker
          </h1>
          <p className="text-slate-600 mt-2 font-light">
            Real-time market sentiment analysis
          </p>

          {/* Auto-refresh status */}
          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                Auto-refresh: Yahoo (5m) • News (10m) • FRED/BLS (8:31 & 10:01
                EST)
              </span>
            </div>
          </div>
        </div>

        {/* Bias Meter */}
        <Card className={`p-8 mb-8 ${biasConfig.border} border-2`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-slate-800">Market Bias</h2>
            <div className={`p-3 rounded-full ${biasConfig.bg}`}>
              <BiasIcon className={`w-6 h-6 ${biasConfig.color}`} />
            </div>
          </div>

          <div className="text-center">
            <div className={`text-5xl font-light ${biasConfig.color} mb-2`}>
              {bias.label}
            </div>
            <div className="text-2xl text-slate-400 font-light mb-6">
              Score: {bias.score > 0 ? "+" : ""}
              {bias.score}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {bias.factors.map((factor, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Macro Data Grid */}
        <Card className="p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-medium text-slate-800">
                Market Data
              </h2>
              {macroTimeAgo && (
                <p className="text-sm text-slate-500 mt-1">
                  Updated {macroTimeAgo}
                </p>
              )}
            </div>
            {macroLoading && (
              <div className="flex items-center gap-2 text-slate-500">
                <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group">
              <div className="text-sm font-medium text-slate-500 mb-2">
                Gold
              </div>
              <div className="text-3xl font-light text-slate-900 mb-1">
                ${formatNumber(macroData?.gold)}
              </div>
              <div className="text-xs text-slate-400">
                Auto-updates every 5m
              </div>
            </div>

            <div className="group">
              <div className="text-sm font-medium text-slate-500 mb-2">DXY</div>
              <div className="text-3xl font-light text-slate-900 mb-1">
                {formatNumber(macroData?.dxy)}
              </div>
              <div className="text-xs text-slate-400">
                Auto-updates every 5m
              </div>
            </div>

            <div className="group">
              <div className="text-sm font-medium text-slate-500 mb-2">CPI</div>
              <div className="text-3xl font-light text-slate-900 mb-1">
                {formatNumber(macroData?.cpi, 1)}
              </div>
              <div className="text-xs text-slate-400">8:31 & 10:01 EST</div>
            </div>

            <div className="group">
              <div className="text-sm font-medium text-slate-500 mb-2">
                10Y Yield
              </div>
              <div className="text-3xl font-light text-slate-900 mb-1">
                {formatNumber(macroData?.yields10y)}%
              </div>
              <div className="text-xs text-slate-400">8:31 & 10:01 EST</div>
            </div>

            <div className="group">
              <div className="text-sm font-medium text-slate-500 mb-2">
                Fed Rate
              </div>
              <div className="text-3xl font-light text-slate-900 mb-1">
                {formatNumber(macroData?.fedRate)}%
              </div>
              <div className="text-xs text-slate-400">8:31 & 10:01 EST</div>
            </div>

            <div className="group">
              <div className="text-sm font-medium text-slate-500 mb-2">NFP</div>
              <div className="text-3xl font-light text-slate-900 mb-1">
                {macroData?.nfp
                  ? `${formatNumber(macroData.nfp / 1000, 0)}K`
                  : "—"}
              </div>
              <div className="text-xs text-slate-400">8:31 & 10:01 EST</div>
            </div>
          </div>
        </Card>

        {/* News Feed */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-slate-800">Market News</h2>
            <div className="flex items-center gap-3">
              {newsTimeAgo && (
                <p className="text-sm text-slate-500">Updated {newsTimeAgo}</p>
              )}
              {newsLoading && (
                <div className="flex items-center gap-2 text-slate-500">
                  <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 max-h-96 overflow-y-auto">
            {newsData?.items?.slice(0, 8).map((item) => (
              <article key={item.id} className="group">
                <h3 className="font-medium text-slate-900 group-hover:text-slate-600 transition-colors mb-2 leading-snug">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {item.title}
                  </a>
                </h3>
                <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                  {item.description}
                  {item.description && (
                    <button
                      onClick={() => handleNewsClick(item)}
                      className="ml-2 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                      see more
                    </button>
                  )}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <time>{new Date(item.publishedAt).toLocaleDateString()}</time>
                </div>
              </article>
            ))}
          </div>
        </Card>

        {/* News Modal */}
        <NewsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          newsItem={selectedNews}
        />
      </div>
    </div>
  );
}
