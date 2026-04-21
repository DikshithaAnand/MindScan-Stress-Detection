// popup.js

const CONSENT_KEY = "es_consent";

async function getConsent() {
  const r = await chrome.storage.local.get(CONSENT_KEY);
  return !!r[CONSENT_KEY];
}

async function setConsent() {
  await chrome.storage.local.set({ [CONSENT_KEY]: true });
}

function show(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function updateStatus(hasToken) {
  const dot = document.getElementById("status-dot");
  dot.className = "status " + (hasToken ? "connected" : "disconnected");
  dot.title = hasToken ? "Connected" : "No token set";
}

async function loadMain() {
  chrome.runtime.sendMessage({ type: "GET_STATS" }, (stats) => {
    if (chrome.runtime.lastError) return;
    document.getElementById("tab-count").textContent = stats.tab_switches;
    document.getElementById("active-mins").textContent = stats.active_minutes;
    document.getElementById("screen-start").textContent = stats.screen_start || "—";
    if (stats.last_sync) {
      const d = new Date(stats.last_sync);
      document.getElementById("last-sync-text").textContent =
        `Last sync: ${d.toLocaleTimeString()}`;
    }
    updateStatus(stats.has_token);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const hasConsent = await getConsent();

  if (!hasConsent) {
    show("consent-view");
    document.getElementById("btn-accept").addEventListener("click", async () => {
      await setConsent();
      show("token-view");
    });
    return;
  }

  // Check if token already set
  chrome.runtime.sendMessage({ type: "GET_STATS" }, (stats) => {
    if (!stats || !stats.has_token) {
      show("token-view");
    } else {
      show("main-view");
      loadMain();
    }
    updateStatus(stats?.has_token || false);
  });

  // Token save
  document.getElementById("btn-save-token").addEventListener("click", () => {
    const token = document.getElementById("token-input").value.trim();
    if (!token) return alert("Please paste a token first.");
    chrome.runtime.sendMessage({ type: "SET_TOKEN", token }, () => {
      show("main-view");
      loadMain();
    });
  });

  // Sync now
  document.getElementById("btn-sync").addEventListener("click", () => {
    const btn = document.getElementById("btn-sync");
    btn.textContent = "Syncing…";
    btn.disabled = true;
    chrome.runtime.sendMessage({ type: "SYNC_NOW" }, () => {
      loadMain();
      btn.textContent = "Sync Now";
      btn.disabled = false;
    });
  });

  // Reset
  document.getElementById("btn-reset").addEventListener("click", () => {
    if (!confirm("Reset today's counts?")) return;
    chrome.runtime.sendMessage({ type: "RESET_DAY" }, loadMain);
  });

  // Change token
  document.getElementById("btn-change-token").addEventListener("click", () => {
    show("token-view");
  });
});
