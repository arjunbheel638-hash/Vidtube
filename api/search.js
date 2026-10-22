export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  const query = String(req.query?.q || "").trim();

  if (!query) {
    return res.status(400).json({
      success: false,
      message: "Search query is required"
    });
  }

  if (query.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Search query is too long"
    });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        success: false,
        message: "Database connection is not configured yet."
      });
    }

    const url = new URL(
      "/rest/v1/videos",
      supabaseUrl
    );

    url.searchParams.set(
      "select",
      "id,title,description,video_url,thumbnail_url,created_at"
    );

    url.searchParams.set(
      "or",
      `(title.ilike.*${query.replace(/[(),.*]/g, "")}*,description.ilike.*${query.replace(/[(),.*]/g, "")}*)`
    );

    url.searchParams.set("order", "created_at.desc");
    url.searchParams.set("limit", "30");

    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      throw new Error("Database search failed");
    }

    const videos = await response.json();

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });

  } catch (error) {
    console.error("VIDTUBE search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search videos right now."
    });
  }
}
