import { get, ref } from "firebase/database";
import { database } from "../firebase";

let keysCache = [];
let currentIndex = 0;
let failedKeys = new Set();
let loadPromise = null;
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const snap = await get(ref(database, "api-keys"));
    const data = snap.val() || {};
    keysCache = Object.entries(data).map(([, k]) => k.key).filter(Boolean);
    currentIndex = 0;
    failedKeys.clear();
    loaded = true;
  })();
  return loadPromise;
}

export async function getNextKey() {
  await ensureLoaded();
  if (keysCache.length === 0) return null;

  if (failedKeys.size >= keysCache.length) {
    failedKeys.clear();
  }

  for (let i = 0; i < keysCache.length; i++) {
    const key = keysCache[currentIndex % keysCache.length];
    currentIndex = (currentIndex + 1) % keysCache.length;
    if (!failedKeys.has(key)) return key;
  }

  failedKeys.clear();
  return keysCache[0];
}

export function markKeyFailed(key) {
  failedKeys.add(key);
}
