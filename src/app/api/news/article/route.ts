import { NextRequest, NextResponse } from "next/server";

function cleanContent(html: string): string {
  const content = html
    // Remove script and style tags with their content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove HTML tags but keep the content
    .replace(/<[^>]+>/g, " ")
    // Clean up common HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    // Remove CSS-like content (selectors, properties)
    .replace(/[.#][a-zA-Z_-][a-zA-Z0-9_-]*\s*{[^}]*}/g, "")
    .replace(/[a-zA-Z-]+\s*:\s*[^;]+;/g, "")
    // Remove URLs and email addresses
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "")
    // Normalize whitespace and line breaks
    .replace(/\s+/g, " ")
    .trim();

  // Split into sentences and rejoin with proper spacing
  return content
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.length > 20) // Remove very short fragments
    .join(" ")
    .substring(0, 1500); // Reasonable length limit
}

function extractBestContent(html: string): string {
  // Try multiple selectors in order of preference
  const selectors = [
    // Article content
    /<article[^>]*>([\s\S]*?)<\/article>/,
    // Main content areas
    /<main[^>]*>([\s\S]*?)<\/main>/,
    /<div[^>]*class="[^"]*story[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    /<div[^>]*class="[^"]*post[^"]*"[^>]*>([\s\S]*?)<\/div>/,
    // Fallback to paragraphs
    /<div[^>]*>((?:<p[^>]*>[\s\S]*?<\/p>\s*){2,})<\/div>/,
  ];

  for (const regex of selectors) {
    const match = html.match(regex);
    if (match && match[1]) {
      const cleaned = cleanContent(match[1]);
      if (cleaned.length > 100) {
        // Ensure we got meaningful content
        return cleaned;
      }
    }
  }

  return "";
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      },
      10000
    );

    if (!response.ok) {
      throw new Error("Failed to fetch article");
    }

    const html = await response.text();
    const content = extractBestContent(html);

    return NextResponse.json({
      content:
        content ||
        "Content could not be extracted from this article. Please visit the original source for the full story.",
      url,
      extracted: !!content,
    });
  } catch (error) {
    console.error("Article fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch article content" },
      { status: 500 }
    );
  }
}
