
export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        error: "Search query is required"
      });
    }

    if (query.length > 200) {
      return res.status(400).json({
        error: "Search query is too long"
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "YouTube API key is not configured"
      });
    }

    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "12",
      key: apiKey
    });

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("YouTube API request failed:", data.error?.code);

      return res.status(502).json({
        error: "Video search failed. Check your API key and quota."
      });
    }

    const videos = (data.items || []).map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title || "",
      description: item.snippet?.description || "",
      channel: item.snippet?.channelTitle || "",
      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        "",
      publishedAt: item.snippet?.publishedAt || "",
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`
    }));

    return res.status(200).json({
      query,
      totalResults: data.pageInfo?.totalResults || 0,
      videos
    });
  } catch (error) {
    console.error("Search error:", error.message);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
