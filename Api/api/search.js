
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const query = String(req.query.q || "").trim();

  if (!query || query.length > 200) {
    return res.status(400).json({
      error: "Enter a search query under 200 characters"
    });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "YouTube API key is not configured"
    });
  }

  try {
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
      console.error("YouTube API error:", data.error?.code);
      return res.status(502).json({
        error: "YouTube search failed"
      });
    }

    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channel: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        "",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    return res.status(200).json({ videos });
  } catch (error) {
    console.error("Search error:", error.message);
    return res.status(500).json({
      error: "Internal server error"
    });
  }
}
