export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // Read search query
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      error: "Please enter a search term",
      videos: []
    });
  }

  if (query.length > 200) {
    return res.status(400).json({
      error: "Search term is too long",
      videos: []
    });
  }

  // API key is stored securely in Vercel
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "YouTube API key is missing in Vercel",
      videos: []
    });
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "12",
      safeSearch: "moderate",
      key: apiKey
    });

    const apiUrl =
      "https://www.googleapis.com/youtube/v3/search?" +
      params.toString();

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error(
        "YouTube API error:",
        data.error?.code || response.status
      );

      return res.status(502).json({
        error: "YouTube search failed. Check API settings and quota.",
        videos: []
      });
    }

    const videos = (data.items || []).map((item) => {
      const snippet = item.snippet || {};
      const thumbnails = snippet.thumbnails || {};
      const videoId = item.id?.videoId || "";

      return {
        id: videoId,
        title: snippet.title || "",
        description: snippet.description || "",
        channel: snippet.channelTitle || "",
        publishedAt: snippet.publishedAt || "",
        thumbnail:
          thumbnails.high?.url ||
          thumbnails.medium?.url ||
          thumbnails.default?.url ||
          "",
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    });

    return res.status(200).json({
      query,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error("Search request failed:", error.message);

    return res.status(500).json({
      error: "Internal server error",
      videos: []
    });
  }
}
