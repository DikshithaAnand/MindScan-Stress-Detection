/**
 * MindScan / Early-Stress
 * FINAL background.js
 * Accurate + Stable + Token Ready
 */

const API_BASE = "http://localhost:8000";
const SYNC_INTERVAL_MINUTES = 1;

/* ---------------------------------- */
/* Global State */
/* ---------------------------------- */
let state = {
  tab_switches: 0,
  active_minutes: 0,
  screen_start: null,
  session_start: Date.now(),
  last_sync: null,
  auth_token: ""
};

/* ---------------------------------- */
/* Install / Startup */
/* ---------------------------------- */
chrome.runtime.onInstalled.addListener(async () => {
  console.log("[MindScan] Installed");
  await restoreState();
  setupAlarms();
});

chrome.runtime.onStartup.addListener(async () => {
  await restoreState();
  setupAlarms();
});

/* ---------------------------------- */
/* Restore Saved Data */
/* ---------------------------------- */
async function restoreState() {

  const saved = await chrome.storage.local.get([
    "es_state",
    "auth_token"
  ]);

  if (saved.es_state) {
    state.tab_switches =
      saved.es_state.tab_switches || 0;

    state.active_minutes =
      saved.es_state.active_minutes || 0;

    state.screen_start =
      saved.es_state.screen_start || getCurrentTime();

  } else {
    state.screen_start = getCurrentTime();
  }

  state.auth_token = saved.auth_token || "";
}

/* ---------------------------------- */
/* Save Counters */
/* ---------------------------------- */
async function persistState() {

  await chrome.storage.local.set({
    es_state: {
      tab_switches: state.tab_switches,
      active_minutes: state.active_minutes,
      screen_start: state.screen_start
    }
  });

}

/* ---------------------------------- */
/* Prevent Duplicate Alarms */
/* ---------------------------------- */
function setupAlarms() {

  chrome.alarms.clearAll(() => {

    chrome.alarms.create("track_active", {
      periodInMinutes: 1
    });

    chrome.alarms.create("sync_backend", {
      periodInMinutes: SYNC_INTERVAL_MINUTES
    });

  });

}

/* ---------------------------------- */
/* Tab Switch Tracking */
/* ---------------------------------- */
chrome.tabs.onActivated.addListener(async () => {

  state.tab_switches++;

  await persistState();

  console.log(
    "[MindScan] Tab switches:",
    state.tab_switches
  );

});

/* ---------------------------------- */
/* Active Minutes */
/* ---------------------------------- */
chrome.idle.setDetectionInterval(60);

chrome.alarms.onAlarm.addListener(async (alarm) => {

  if (alarm.name === "track_active") {

    chrome.idle.queryState(60, async (status) => {

      if (status === "active") {

        state.active_minutes++;

        await persistState();

        console.log(
          "[MindScan] Active Minutes:",
          state.active_minutes
        );

      }

    });

  }

  if (alarm.name === "sync_backend") {
    await syncToBackend();
  }

});

/* ---------------------------------- */
/* Sync To FastAPI */
/* ---------------------------------- */
async function syncToBackend() {

  if (!state.auth_token) {
    console.log("[MindScan] No token found");
    return;
  }

  const payload = {
    tab_switches: state.tab_switches,
    active_minutes: state.active_minutes,
    screen_start: state.screen_start,
    screen_end: getCurrentTime()
  };

  try {

    const res = await fetch(
      `${API_BASE}/behavior-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${state.auth_token}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (res.ok) {

      state.last_sync =
        new Date().toISOString();

      console.log(
        "[MindScan] Sync Success",
        payload
      );

    } else {

      console.log(
        "[MindScan] Sync Failed:",
        res.status
      );

    }

  } catch (err) {

    console.log(
      "[MindScan] Backend Error:",
      err
    );

  }

}

/* ---------------------------------- */
/* Popup / Website Messages */
/* ---------------------------------- */
chrome.runtime.onMessage.addListener(
  (msg, sender, sendResponse) => {

    if (msg.type === "GET_STATS") {

      sendResponse(state);
      return true;

    }

    if (msg.type === "SYNC_NOW") {

      syncToBackend().then(() => {
        sendResponse({ ok: true });
      });

      return true;
    }

    if (msg.type === "RESET") {

      state.tab_switches = 0;
      state.active_minutes = 0;
      state.screen_start = getCurrentTime();

      persistState();

      sendResponse({ ok: true });

      return true;
    }

    if (msg.type === "SET_TOKEN") {

      state.auth_token = msg.token;

      chrome.storage.local.set({
        auth_token: msg.token
      });

      sendResponse({ ok: true });

      return true;
    }

  }
);

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */
function getCurrentTime() {

  const now = new Date();

  return now.toTimeString().slice(0, 5);

}