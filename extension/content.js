/**
 * content.js — Early-Stress Content Script
 * Minimal: only tracks page visibility changes (no browsing content collected).
 */
document.addEventListener("visibilitychange", () => {
  // Signal to background that user switched away from/back to this tab
  // No URL or content is sent
  chrome.runtime.sendMessage?.({ type: "VISIBILITY", hidden: document.hidden });
});
