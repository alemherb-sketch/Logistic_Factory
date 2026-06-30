import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface Report {
  id: string;
  code: string;
  date: string;
  technician: string;
  vehicle: string;
  plate: string;
  brand: string;
  issue: string;
  actionTaken: string;
  partsUsed: string;
  finalStatus: string;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  sync_status: 'pending' | 'synced';
}

const STORAGE_KEY = '@reports_history';

// Base API URL (Render production). Override with EXPO_PUBLIC_API_URL if needed.
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || 'https://logistic-factory-api.onrender.com';

const SYNC_URL = `${API_BASE}/api/reports`; // GET to reconcile
const SYNC_POST_URL = `${SYNC_URL}/sync`; // POST to upload

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Render's free tier sleeps after ~15 min of inactivity; the first request then
// returns 502/503/504 for ~30-60s while the instance wakes back up. Without
// retries that surfaces to the user as "Error del servidor". This retries those
// transient gateway errors (and network drops) with a fixed backoff, and aborts
// any single attempt that hangs too long so the loop can move on.
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  { retries = 5, backoffMs = 5000, timeoutMs = 70000 } = {}
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      // Gateway errors mean the instance is still waking — wait and retry.
      if (res.status >= 502 && res.status <= 504 && attempt < retries) {
        await sleep(backoffMs);
        continue;
      }
      return res;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) {
        await sleep(backoffMs);
        continue;
      }
    }
  }
  throw lastError ?? new Error('fetchWithRetry: retries exhausted');
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadReports();

    // Wake the (possibly sleeping) backend early, so it's warm by the time the
    // user submits a report. Fire-and-forget.
    fetchWithRetry(`${API_BASE}/`, {}, { retries: 3, backoffMs: 4000 }).catch(() => {});

    // Listen for network changes to trigger auto-sync
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        syncPendingReports();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadReports = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReports(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `LF-${dateStr}-${randomNum}`;
  };

  const addReport = async (reportData: Omit<Report, 'id' | 'code' | 'sync_status'>) => {
    try {
      const newReport: Report = {
        ...reportData,
        id: Date.now().toString(),
        code: generateCode(),
        sync_status: 'pending'
      };

      const updatedReports = [newReport, ...reports];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
      setReports(updatedReports);

      // Try to sync immediately if online
      syncPendingReports();

      return true;
    } catch (error) {
      console.error('Error saving report:', error);
      return false;
    }
  };

  const syncPendingReports = async () => {
    if (isSyncing) return;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const currentReports: Report[] = JSON.parse(stored);
      if (currentReports.length === 0) return;

      // Push only NEW (pending) reports. We deliberately do NOT re-push reports
      // the backend is missing: now that data persists in Postgres, a report
      // absent from the server was deleted on purpose from the admin panel, so
      // re-uploading it would make deletions reappear.
      const reportsToPush = currentReports.filter(r => r.sync_status === 'pending');

      if (reportsToPush.length === 0) return;

      setIsSyncing(true);

      // The /sync endpoint is idempotent (dedupes by id), so re-pushing is safe.
      // fetchWithRetry survives Render free-tier cold starts (502 while waking).
      const response = await fetchWithRetry(SYNC_POST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reports: reportsToPush })
      });

      if (response.ok) {
        const pushedIds = reportsToPush.map(r => r.id);
        const updatedReports = currentReports.map(r =>
          pushedIds.includes(r.id) ? { ...r, sync_status: 'synced' as const } : r
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
        setReports(updatedReports);
        alert('✅ ¡Informes sincronizados con la nube!');
      } else {
        alert(`❌ El servidor respondió con un error (${response.status}). Se reintentará automáticamente.`);
      }
    } catch (error) {
      console.log('Sync failed, will retry later when online.', error);
      alert('⏳ No se pudo contactar al servidor (puede estar iniciando). Se reintentará solo cuando haya conexión.');
    } finally {
      setIsSyncing(false);
    }
  };

  const clearAll = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setReports([]);
    } catch (error) {
      console.error('Error clearing reports:', error);
    }
  };

  return {
    reports,
    isLoading,
    isSyncing,
    addReport,
    syncPendingReports,
    clearAll,
  };
}
