/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_BASE_URL = "https://newsapi.org/v2/everything";

interface NewsAPIResponse {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: {
      name: string;
    };
  }>;
}

// Function to normalize strings for comparison
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

// Function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  if (normalized1 === normalized2) return 1;

  // Simple word-based similarity
  const words1 = normalized1.split(" ");
  const words2 = normalized2.split(" ");
  const commonWords = words1.filter((word) => words2.includes(word));

  return (2 * commonWords.length) / (words1.length + words2.length);
}

// Function to remove duplicates
function removeDuplicates(articles: any[]): any[] {
  const filtered: any[] = [];
  const SIMILARITY_THRESHOLD = 0.7; // 70% similarity threshold

  for (const article of articles) {
    let isDuplicate = false;

    for (const existing of filtered) {
      // Check title similarity
      const titleSimilarity = calculateSimilarity(
        article.title,
        existing.title
      );

      // Check description similarity (if both exist)
      let descriptionSimilarity = 0;
      if (article.description && existing.description) {
        descriptionSimilarity = calculateSimilarity(
          article.description,
          existing.description
        );
      }

      // Consider duplicate if title similarity is high OR both title and description are moderately similar
      if (
        titleSimilarity > SIMILARITY_THRESHOLD ||
        (titleSimilarity > 0.5 && descriptionSimilarity > 0.5)
      ) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      filtered.push(article);
    }
  }

  return filtered;
}

// Function to filter relevant news
function filterRelevantNews(articles: any[]): any[] {
  const economicKeywords = [
    "gold",
    "federal reserve",
    "fed",
    "inflation",
    "cpi",
    "interest rate",
    "yield",
    "dollar",
    "dxy",
    "economy",
    "economic",
    "market",
    "trading",
    "unemployment",
    "jobs",
    "nfp",
    "gdp",
    "recession",
    "growth",
    "monetary policy",
    "fiscal",
    "treasury",
    "bond",
    "commodity",
  ];

  return articles.filter((article) => {
    const titleLower = article.title.toLowerCase();
    const descriptionLower = (article.description || "").toLowerCase();
    const combinedText = `${titleLower} ${descriptionLower}`;

    // Check if article contains relevant economic keywords
    return economicKeywords.some((keyword) => combinedText.includes(keyword));
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    if (!NEWS_API_KEY) {
      return NextResponse.json(
        { error: "News API key not configured" },
        { status: 500 }
      );
    }

    const query =
      'gold OR "federal reserve" OR inflation OR economy OR "interest rates" OR unemployment OR GDP OR recession';
    const params = new URLSearchParams({
      q: query,
      language: "en",
      sortBy: "publishedAt",
      pageSize: "50", // Fetch more to allow for filtering
      apiKey: NEWS_API_KEY,
    });

    const response = await fetch(`${NEWS_BASE_URL}?${params}`);
    const data: NewsAPIResponse = await response.json();

    if (!data.articles) {
      return NextResponse.json({
        items: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    // Filter out articles with missing essential data
    let filteredArticles = data.articles.filter(
      (article) =>
        article.title &&
        article.title.trim() !== "" &&
        article.url &&
        article.source?.name &&
        article.publishedAt
    );

    // Filter for economic relevance
    filteredArticles = filterRelevantNews(filteredArticles);

    // Remove duplicates
    filteredArticles = removeDuplicates(filteredArticles);

    // Sort by publication date (newest first)
    filteredArticles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Transform and limit results
    const newsItems = filteredArticles.slice(0, 20).map((article, index) => ({
      id: `news-${index}-${Date.now()}`,
      title: article.title.trim(),
      description: article.description?.trim() || "",
      url: article.url,
      publishedAt: article.publishedAt,
      source: article.source.name,
    }));

    return NextResponse.json({
      items: newsItems,
      lastUpdated: new Date().toISOString(),
      filtered: {
        total: data.articles.length,
        afterRelevanceFilter: filteredArticles.length,
        afterDuplicateFilter: newsItems.length,
      },
    });
  } catch (error) {
    console.error("News API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news data" },
      { status: 500 }
    );
  }
}
