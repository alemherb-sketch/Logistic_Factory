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

import Constants from 'expo-constants';

const STORAGE_KEY = '@reports_history';

// Helper to get the correct API URL depending on how the app is running
const getApiUrl = () => {
  // 🚀 PARA PRODUCCIÓN (RENDER): 
  return 'https://logistic-factory-api.onrender.com/api/reports/sync';
};

const API_URL = getApiUrl();

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadReports();
    
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
      const pendingReports = currentReports.filter(r => r.sync_status === 'pending');
      
      if (pendingReports.length === 0) return;

      setIsSyncing(true);
      
      // Attempt to send to the backend
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reports: pendingReports })
      });

      if (response.ok) {
        // Mark all sent reports as synced
        const syncedIds = pendingReports.map(r => r.id);
        const updatedReports = currentReports.map(r => 
          syncedIds.includes(r.id) ? { ...r, sync_status: 'synced' as const } : r
        );
        
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
        setReports(updatedReports);
        alert('✅ ¡Informes sincronizados con la nube de Render!');
      } else {
        alert('❌ Error del servidor de Render. Asegúrate de que tu URL sea correcta.');
      }
    } catch (error) {
      alert('❌ Error de conexión: No se pudo contactar a Render. Revisa la URL en el código.');
      console.log('Sync failed, will retry later when online.');
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
