"use strict";

/*
  VIDTUBE - Frontend JavaScript
  Real multi-user features will work after backend connection.
*/

const API_BASE = window.VIDTUBE_API || "";

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

/* Search videos */
function setupSearch() {
  const searchInput = $(
    "#searchInput, #search, input[name='search']"
  );

  const searchButton = $(
    "#searchButton, #searchBtn, button[type='search']"
  );

  function search() {
    if (!searchInput) return;

    const query = searchInput.value.trim();
    if (!query) return;

    window.location.href =
      `/?search=${encodeURIComponent(query)}`;
  }

  searchButton?.addEventListener("click", search);

  searchInput?.addEventListener("keydown", event => {
    if (event.key === "Enter") search();
  });
}

/* Video upload */
function setupUpload() {
  const form = $("#uploadForm");

  if (!form) return;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const fileInput = $(
      "input[type='file']",
      form
    );

    const titleInput = $(
      "[name='title']",
      form
    );

    const descriptionInput = $(
      "[name='description']",
      form
    );

    if (!fileInput?.files?.length) {
      alert("Please select a video first.");
      return;
    }

    const file = fileInput.files[0];

    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", titleInput?.value || "");
    formData.append(
      "description",
      descriptionInput?.value || ""
    );

    const submitButton = $(
      "button[type='submit']",
      form
    );

    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(
        `${API_BASE}/api/videos`,
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Upload failed"
        );
      }

      alert("Video uploaded successfully!");
      form.reset();

    } catch (error) {
      alert(
        "Upload abhi available nahi. Backend connect karna baqi hai."
      );
      console.error(error);

    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

/* Like button */
async function likeVideo(videoId, button) {
  if (!videoId) return;

  try {
    const result = await apiRequest(
      `/api/videos/${encodeURIComponent(videoId)}/like`,
      { method: "POST" }
    );

    if (button && result.likes !== undefined) {
      button.textContent = `👍 ${result.likes}`;
    }

  } catch (error) {
    alert("Like feature ke liye login aur backend zaroori hai.");
    console.error(error);
  }
}

/* Subscribe button */
async function subscribe(channelId, button) {
  if (!channelId) return;

  try {
    const result = await apiRequest(
      `/api/channels/${encodeURIComponent(channelId)}/subscribe`,
      { method: "POST" }
    );

    if (button) {
      button.textContent = result.subscribed
        ? "Subscribed"
        : "Subscribe";
    }

  } catch (error) {
    alert("Subscribe feature ke liye login aur backend zaroori hai.");
    console.error(error);
  }
}

/* Comments */
async function submitComment(videoId, input) {
  if (!videoId || !input?.value.trim()) return;

  try {
    await apiRequest(
      `/api/videos/${encodeURIComponent(videoId)}/comments`,
      {
        method: "POST",
        body: JSON.stringify({
          text: input.value.trim()
        })
      }
    );

    input.value = "";
    alert("Comment added!");

  } catch (error) {
    alert("Comments ke liye login aur backend zaroori hai.");
    console.error(error);
  }
}

/* Buttons with data attributes */
document.addEventListener("click", event => {
  const likeButton = event.target.closest("[data-like]");
  const subscribeButton = event.target.closest("[data-subscribe]");
  const commentButton = event.target.closest("[data-comment]");

  if (likeButton) {
    likeVideo(
      likeButton.dataset.like,
      likeButton
    );
  }

  if (subscribeButton) {
    subscribe(
      subscribeButton.dataset.subscribe,
      subscribeButton
    );
  }

  if (commentButton) {
    const form = commentButton.closest("form");
    const input = form?.querySelector("textarea, input");

    submitComment(
      commentButton.dataset.comment,
      input
    );
  }
});

/* Mobile menu */
function setupMenu() {
  const menuButton = $("#menuButton, #menuBtn");
  const sidebar = $("#sidebar, .sidebar");

  menuButton?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
  });
}

/* Start application */
document.addEventListener("DOMContentLoaded", () => {
  setupSearch();
  setupUpload();
  setupMenu();

  console.log("VIDTUBE app.js loaded successfully");
});
