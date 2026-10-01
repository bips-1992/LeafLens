import { ScanRecord } from '../types';

const STORAGE_KEY = 'leaflens_ephemeral_scans_v1';

export function getSessionScans(): ScanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not read from sessionStorage:', err);
    return [];
  }
}

export function saveScanToSession(newRecord: ScanRecord): ScanRecord[] {
  if (typeof window === 'undefined') return [newRecord];
  try {
    const existing = getSessionScans();
    // Keep most recent first, limit to latest 25 records to prevent quota overflow
    const updated = [newRecord, ...existing.filter((s) => s.id !== newRecord.id)].slice(0, 25);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Could not save to sessionStorage (quota exceeded?):', err);
    // If quota exceeded, try saving with lightweight thumbnail only
    try {
      const existing = getSessionScans();
      const lightweightRecord = { ...newRecord, image: newRecord.thumbnail };
      const trimmed = [lightweightRecord, ...existing.slice(0, 10)];
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return trimmed;
    } catch {
      return [newRecord];
    }
  }
}

export function updateScanChecklist(scanId: string, checklistState: Record<string, boolean>): ScanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSessionScans();
    const updated = existing.map((s) => (s.id === scanId ? { ...s, checklistState } : s));
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to update scan checklist:', err);
    return [];
  }
}

export function clearSessionScans(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear sessionStorage:', err);
  }
}

export async function createOptimizedThumbnail(dataUrl: string, maxDim = 320): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
