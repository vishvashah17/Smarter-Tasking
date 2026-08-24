import { createContext, useCallback, useContext, useRef, useState } from "react";
import { api } from "../services/api.js";

// ─── Context ────────────────────────────────────────────────────────────────

const AppDataContext = createContext(null);

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside <AppDataProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

/**
 * Fetches ALL app data once on mount (right after login) and stores it in a
 * flat cache object.  Pages consume data from the cache and call invalidate()
 * helpers after mutations so the relevant slice is re-fetched.
 */
export function AppDataProvider({ children }) {
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track in-flight requests so we never double-fetch the same key.
  const inFlight = useRef({});

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Fetch one API endpoint and store result under `key`. */
  const fetchKey = useCallback(async (key, path) => {
    if (inFlight.current[key]) return;
    inFlight.current[key] = true;
    try {
      const data = await api(path);
      setCache((prev) => ({ ...prev, [key]: data }));
    } finally {
      inFlight.current[key] = false;
    }
  }, []);

  // ── Pre-fetch everything on login ─────────────────────────────────────────

  const prefetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchKey("dailyTasks",    "/api/tasks?type=daily&status=active"),
        fetchKey("periodicTasks", "/api/tasks?type=periodic&status=active"),
        fetchKey("history",       "/api/history"),
        fetchKey("codes",         "/api/codes"),
        fetchKey("notes",         "/api/notes"),
        fetchKey("profile",       "/api/profile"),
      ]);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [fetchKey]);

  // ── Per-key invalidation (re-fetch after a mutation) ──────────────────────

  const invalidate = useCallback(
    (key) => {
      const pathMap = {
        dailyTasks:    "/api/tasks?type=daily&status=active",
        periodicTasks: "/api/tasks?type=periodic&status=active",
        history:       "/api/history",
        codes:         "/api/codes",
        notes:         "/api/notes",
        profile:       "/api/profile",
      };
      if (pathMap[key]) fetchKey(key, pathMap[key]);
    },
    [fetchKey]
  );

  /**
   * Optimistically update a cache slice, fire the real API call in the
   * background, then sync (invalidate) on success or rollback on failure.
   *
   * @param {string}   key        - Cache key (e.g. "dailyTasks", "notes")
   * @param {function} updater    - Pure fn: (prevCacheSlice) => nextCacheSlice
   * @param {function} apiFn     - Async fn that performs the real mutation
   * @param {function} [onError] - Optional: (err) => void — shown to user
   */
  const optimisticUpdate = useCallback(
    async (key, updater, apiFn, onError) => {
      // 1. Snapshot current slice for rollback
      setCache((prev) => {
        const snapshot = prev[key];
        // Store snapshot on the ref so the async closure can read it
        inFlight.current[`__snap_${key}`] = snapshot;
        return { ...prev, [key]: updater(snapshot) };
      });

      // 2. Fire real API in the background
      try {
        await apiFn();
        // 3a. Success → sync cache from server to stay consistent
        invalidate(key);
      } catch (err) {
        // 3b. Failure → rollback to snapshot
        setCache((prev) => ({
          ...prev,
          [key]: inFlight.current[`__snap_${key}`],
        }));
        if (onError) onError(err);
      } finally {
        delete inFlight.current[`__snap_${key}`];
      }
    },
    [invalidate]
  );

  /**
   * Invalidate history with custom filter params (used by the History page
   * when filter dropdowns change — still reads from cache for default view).
   */
  const fetchHistoryWithFilters = useCallback(async (filters) => {
    const params = new URLSearchParams();
    if (filters.type)   params.set("type",   filters.type);
    if (filters.status) params.set("status", filters.status);
    // Store filtered result under a separate key so it doesn't clobber the main cache
    const data = await api(`/api/history?${params.toString()}`);
    return data.tasks ?? [];
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        cache,
        loading,
        error,
        prefetchAll,
        invalidate,
        optimisticUpdate,
        fetchHistoryWithFilters,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}
