export default async function handler(req, res) {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({
      error: "Search query is required"
    });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "YouTube API key is not configured in Vercel"
    });
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "12",
      q: query,
      key: apiKey
    });

    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/search?" + params
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "YouTube search failed"
      });
    }

    const videos = (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt
    }));

    return res.status(200).json({ videos });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to connect to YouTube"
    });
  }
}
