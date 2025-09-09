/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { Modal } from "./ui/Modal";
import { NewsItem } from "@/types";
import {
  ExternalLink,
  Calendar,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsItem: NewsItem | null;
}

export function NewsModal({ isOpen, onClose, newsItem }: NewsModalProps) {
  const [fullContent, setFullContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFullContent = useCallback(
    async (url: string) => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/news/article?url=" + encodeURIComponent(url)
        );

        if (!response.ok) {
          throw new Error("Failed to fetch");
        }

        const data = await response.json();

        if (data.error) {
          setError("Unable to load full article content");
          setFullContent(newsItem?.description || "No content available.");
        } else {
          const content =
            data.content || newsItem?.description || "No content available.";
          setFullContent(content);
        }
      } catch (err) {
        setError("Failed to fetch article content");
        setFullContent(newsItem?.description || "No content available.");
      } finally {
        setIsLoading(false);
      }
    },
    [newsItem?.description]
  );

  useEffect(() => {
    if (isOpen && newsItem) {
      fetchFullContent(newsItem.url);
    } else {
      setFullContent("");
      setError("");
      setIsLoading(false);
    }
  }, [isOpen, newsItem, fetchFullContent]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!newsItem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-semibold text-slate-900 leading-tight mb-4">
            {newsItem.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{newsItem.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(newsItem.publishedAt)}</span>
            </div>
          </div>
        </div>

        {newsItem.description && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              Article Summary:
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {newsItem.description}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">
            Full Article Content
          </h3>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">
                  Loading full article content...
                </p>
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">
                    Content Unavailable
                  </h4>
                  <p className="text-amber-700 text-sm mb-3">{error}</p>
                  <div className="bg-white rounded p-3 border border-amber-200">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {fullContent || "No additional content available."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-slate-700 leading-relaxed space-y-4">
                {fullContent
                  .split(/(?<=[.!?])\s+/)
                  .filter((sentence) => sentence.trim().length > 10)
                  .map((sentence, index) => (
                    <p key={index} className="text-sm leading-relaxed">
                      {sentence.trim()}
                    </p>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col gap-2">
            <a
              href={newsItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Read original article on {newsItem.source}
            </a>
            <p className="text-xs text-slate-400">Opens in a new tab</p>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
