"use strict";

const $ = (id) => document.getElementById(id);

const defaultVideos = [
  {id:"v1",title:"Beautiful Village Life | A Day in the Countryside",channel:"Village Stories",views:"125K views",age:"2 days ago",duration:"12:45",category:"Desi Vlogs",emoji:"🌾",bg:"linear-gradient(135deg,#315c32,#b7a65a)"},
  {id:"v2",title:"Top Trending Music Mix 2026",channel:"Music World",views:"1.2M views",age:"1 day ago",duration:"18:20",category:"Music",emoji:"🎵",bg:"linear-gradient(135deg,#411b79,#e63c8c)"},
  {id:"v3",title:"Pakistani Drama | Emotional Moments",channel:"Drama Central",views:"875K views",age:"3 days ago",duration:"9:18",category:"Pakistani Dramas",emoji:"🎭",bg:"linear-gradient(135deg,#164e63,#d97706)"},
  {id:"v4",title:"Funny Moments That Will Make You Laugh",channel:"Fun Time",views:"540K views",age:"5 hours ago",duration:"8:42",category:"Comedy",emoji:"😂",bg:"linear-gradient(135deg,#f59e0b,#dc2626)"},
  {id:"v5",title:"Amazing AI Animated Story | Never Give Up",channel:"AI Story Studio",views:"92K views",age:"1 day ago",duration:"6:33",category:"AI Stories",emoji:"🤖",bg:"linear-gradient(135deg,#075985,#7c3aed)"},
  {id:"v6",title:"Peaceful Morning | Beautiful Recitation",channel:"Peaceful World",views:"230K views",age:"4 days ago",duration:"15:07",category:"Islamic",emoji:"🌙",bg:"linear-gradient(135deg,#064e3b,#0e7490)"},
  {id:"v7",title:"Amazing Travel Adventure",channel:"Travel Now",views:"410K views",age:"2 days ago",duration:"14:20",category:"Trending",emoji:"🏞️",bg:"linear-gradient(135deg,#0369a1,#65a30d)"},
  {id:"v8",title:"Best Cooking Ideas for the Whole Family",channel:"Home Kitchen",views:"86K views",age:"6 days ago",duration:"10:12",category:"Desi Vlogs",emoji:"🍲",bg:"linear-gradient(135deg,#9a3412,#eab308)"}
];

const shorts = [
  {title:"A beautiful village morning",views:"Short video",emoji:"🌄",bg:"linear-gradient(160deg,#14532d,#a3e635)"},
  {title:"Music beats",views:"Short video",emoji:"🎧",bg:"linear-gradient(160deg,#581c87,#ec4899)"},
  {title:"Funny moment",views:"Short video",emoji:"🤣",bg:"linear-gradient(160deg,#9a3412,#fbbf24)"},
  {title:"AI magic world",views:"Short video",emoji:"🤖",bg:"linear-gradient(160deg,#1e3a8a,#a78bfa)"},
  {title:"Food lovers",views:"Short video",emoji:"🍜",bg:"linear-gradient(160deg,#7c2d12,#fdba74)"},
  {title:"Amazing nature",views:"Short video",emoji:"🌳",bg:"linear-gradient(160deg,#064e3b,#34d399)"}
];

let activeCategory = "All";
let currentSearch = "";
let viewMode = "home";

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    alert("Browser storage is full or unavailable.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;",
    '"':"&quot;", "'":"&#39;"
  })[ch]);
}

function allVideos() {
  return [...readList("vidtubeUploads"), ...defaultVideos];
}

function openVideo(video) {
  const params = new URLSearchParams();
  params.set("id", video.id || "");
  params.set("t", video.title || "VIDTUBE Video");
  location.href = "watch.html?" + params.toString();
}

function renderVideos() {
  const grid = $("videoGrid");
  const empty = $("emptyMessage");
  if (!grid || !empty) return;

  let videos = allVideos();

  if (viewMode === "saved") {
    const saved = readList("vidtubeSaved");
    videos = videos.filter(v => saved.includes(v.id));
    $("gridTitle").textContent = "Watch Later";
  } else if (viewMode === "liked") {
    const liked = readList("vidtubeLiked");
    videos = videos.filter(v => liked.includes(v.id));
    $("gridTitle").textContent = "Liked Videos";
  } else {
    $("gridTitle").textContent =
      activeCategory === "All" ? "Recommended Videos" : activeCategory + " Videos";
  }

  if (viewMode === "home" && activeCategory !== "All") {
    videos = videos.filter(v =>
      activeCategory === "Trending"
        ? v.category === "Trending" || parseViews(v.views) >= 500000
        : v.category === activeCategory
    );
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    videos = videos.filter(v =>
      [v.title, v.channel, v.category].join(" ").toLowerCase().includes(q)
    );
  }

  grid.replaceChildren();
  empty.hidden = videos.length !== 0;

  videos.forEach(video => {
    const card = document.createElement("article");
    card.className = "video-card";

    const thumb = document.createElement("div");
    thumb.className = "thumbnail";
    thumb.style.background = video.bg || "#242424";

    const emoji = document.createElement("span");
    emoji.textContent = video.emoji || "▶️";

    const play = document.createElement("span");
    play.className = "play";
    play.textContent = "▶";

    const duration = document.createElement("span");
    duration.className = "duration";
    duration.textContent = video.duration || "Video";

    thumb.append(emoji, play, duration);

    const info = document.createElement("div");
    info.className = "video-info";

    const avatar = document.createElement("div");
    avatar.className = "channel-avatar";
    avatar.textContent = (video.channel || "V").charAt(0);

    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = video.title;

    const channel = document.createElement("p");
    channel.textContent = video.channel || "VIDTUBE Creator";

    const metadata = document.createElement("p");
    metadata.textContent = `${video.views || "New video"} · ${video.age || "Just now"}`;

    details.append(title, channel, metadata);
    info.append(avatar, details);
    card.append(thumb, info);

    card.addEventListener("click", () => openVideo(video));
    grid.append(card);
  });
}

function parseViews(text) {
  const m = String(text || "").match(/([\d.]+)\s*([KM]?)/i);
  if (!m) return 0;
  const number = Number(m[1]);
  const unit = m[2].toUpperCase();
  return number * (unit === "M" ? 1e6 : unit === "K" ? 1000 : 1);
}

function selectCategory(category) {
  activeCategory = category;
  viewMode = "home";

  document.querySelectorAll("[data-category]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });

  document.querySelectorAll("[data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === "home");
  });

  renderVideos();
}

function showView(view) {
  viewMode = view;
  activeCategory = "All";

  document.querySelectorAll("[data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  document.querySelectorAll("[data-category]").forEach(button => {
    button.classList.toggle("active", button.dataset.category === "All");
  });

  if (view === "home") {
    currentSearch = "";
    $("searchInput").value = "";
  }

  renderVideos();
  window.scrollTo({top:0, behavior:"smooth"});
}

document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => {
    selectCategory(button.dataset.category);
  });
});

document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  currentSearch = $("searchInput").value.trim();
  viewMode = "home";
  renderVideos();
});

$("searchInput").addEventListener("input", event => {
  currentSearch = event.target.value.trim();
  viewMode = "home";
  renderVideos();
});

$("exploreBtn").addEventListener("click", () => {
  $("gridTitle").scrollIntoView({behavior:"smooth"});
});

function addVideo(event) {
  event.preventDefault();

  const title = $("uploadTitle").value.trim();
  const category = $("uploadCategory").value;
  const url = $("uploadUrl").value.trim();

  if (!title) {
    $("uploadMessage").textContent = "Please enter a video title.";
    return;
  }

  if (url && !/^https?:\/\//i.test(url)) {
    $("uploadMessage").textContent = "Please enter a valid HTTP or HTTPS URL.";
    return;
  }

  const uploaded = readList("vidtubeUploads");
  uploaded.unshift({
    id: "user-" + Date.now(),
    title,
    category,
    url,
    channel: "My VIDTUBE Channel",
    views: "0 views",
    age: "Just now",
    duration: url ? "Video" : "Demo",
    emoji: "🎬",
    bg: "linear-gradient(135deg,#1d4ed8,#9333ea)"
  });

  if (!saveList("vidtubeUploads", uploaded)) return;

  $("uploadTitle").value = "";
  $("uploadUrl").value = "";
  $("uploadMessage").textContent =
    "Video details saved in this browser. They are not uploaded to a shared server.";

  currentSearch = "";
  $("searchInput").value = "";
  showView("home");
  $("gridTitle").scrollIntoView({behavior:"smooth"});
}

$("uploadForm").addEventListener("submit", addVideo);

const ideas = [
  "A day in a beautiful village",
  "Top 5 amazing facts about Pakistan",
  "Funny family moments",
  "A short inspirational story",
  "Traditional food cooked at home",
  "A peaceful morning in nature",
  "An AI animated adventure"
];

$("ideaBtn").addEventListener("click", () => {
  const idea = ideas[Math.floor(Math.random() * ideas.length)];
  $("aiResult").textContent = "Your next video idea: " + idea;
});

function showShorts() {
  $("shortsSection").scrollIntoView({behavior:"smooth"});
}

$("shortsNav").addEventListener("click", showShorts);
$("mobileShorts").addEventListener("click", showShorts);

$("profileBtn").addEventListener("click", () => {
  alert("Creator profiles and login require a connected authentication backend.");
});

$("voiceBtn").addEventListener("click", () => {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Speech) {
    alert("Voice search is not supported here. Please type your search.");
    return;
  }

  const recognition = new Speech();
  recognition.lang = "en-US";
  recognition.onresult = event => {
    $("searchInput").value = event.results[0][0].transcript;
    currentSearch = $("searchInput").value.trim();
    viewMode = "home";
    renderVideos();
  };
  recognition.onerror = () => {
    alert("Voice search could not start. Please type your search.");
  };
  recognition.start();
});

function renderShorts() {
  const row = $("shortsRow");
  row.replaceChildren();

  shorts.forEach(short => {
    const card = document.createElement("article");
    card.className = "short-card";

    const thumb = document.createElement("div");
    thumb.className = "short-thumb";
    thumb.style.background = short.bg;
    thumb.textContent = short.emoji;

    const title = document.createElement("h3");
    title.textContent = short.title;

    const views = document.createElement("p");
    views.textContent = short.views;

    card.append(thumb, title, views);
    card.addEventListener("click", () => {
      const params = new URLSearchParams({t: short.title});
      location.href = "watch.html?" + params.toString();
    });
    row.append(card);
  });
}

renderVideos();
renderShorts();
