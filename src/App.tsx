import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  BookOpen,
  Shield,
  Sparkles,
  Leaf,
  Plus,
  ArrowRight,
  RefreshCw,
  Info,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { CameraView } from './components/CameraView';
import { DiagnosisResult } from './components/DiagnosisResult';
import { RecentScans } from './components/RecentScans';
import { OfflineFieldGuide } from './components/OfflineFieldGuide';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Chatbot } from './components/Chatbot';
import { SAMPLE_LEAVES, SampleLeaf } from './data/sampleLeaves';
import { DiagnosisData, ScanRecord } from './types';
import {
  getSessionScans,
  saveScanToSession,
  clearSessionScans,
  createOptimizedThumbnail,
  updateScanChecklist,
} from './utils/storage';

export default function App() {
  // Navigation views: 'dashboard' | 'camera' | 'result' | 'guide'
  const [currentView, setCurrentView] = useState<'dashboard' | 'camera' | 'result' | 'guide'>('dashboard');
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [activeScan, setActiveScan] = useState<ScanRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('Uploading leaf image...');
  const [apiError, setApiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load session scans on mount
  useEffect(() => {
    const sessionData = getSessionScans();
    setScans(sessionData);
  }, []);

  // Send photo to backend /api/diagnose
  const handleAnalyzePhoto = async (dataUrl: string, sampleHint?: string) => {
    setIsAnalyzing(true);
    setApiError(null);
    setAnalysisStatus('Examining leaf venation & chlorophyll patterns...');

    const statusTimer1 = setTimeout(() => {
      setAnalysisStatus('Evaluating interveinal chlorosis & margin necrosis...');
    }, 1200);

    const statusTimer2 = setTimeout(() => {
      setAnalysisStatus('Formulating organic remedies & soil pH guidance...');
    }, 2800);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: dataUrl,
          plantHint: sampleHint,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || `Analysis failed (${response.status})`);
      }

      const diagnosisResult: DiagnosisData = await response.json();
      const thumbnail = await createOptimizedThumbnail(dataUrl, 240);

      const newRecord: ScanRecord = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        thumbnail,
        image: dataUrl,
        diagnosis: diagnosisResult,
        checklistState: {},
      };

      const updated = saveScanToSession(newRecord);
      setScans(updated);
      setActiveScan(newRecord);
      setCurrentView('result');
    } catch (err: any) {
      console.error('Diagnosis error:', err);
      setApiError(err.message || 'Could not complete leaf diagnosis. Please check network connection and try again.');
    } finally {
      clearTimeout(statusTimer1);
      clearTimeout(statusTimer2);
      setIsAnalyzing(false);
    }
  };

  // Gallery file picker
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        handleAnalyzePhoto(result);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  // Toggle checklist item state in session
  const handleToggleChecklist = (scanId: string, itemKey: string) => {
    if (!activeScan) return;
    const currentState = activeScan.checklistState || {};
    const nextState = {
      ...currentState,
      [itemKey]: !currentState[itemKey],
    };

    const updatedScans = updateScanChecklist(scanId, nextState);
    setScans(updatedScans);
    setActiveScan({
      ...activeScan,
      checklistState: nextState,
    });
  };

  // Clear session storage
  const handleClearAll = () => {
    if (confirm('Clear all scans from this session? This data only exists in your browser and will be erased immediately.')) {
      clearSessionScans();
      setScans([]);
      if (currentView === 'result') {
        setCurrentView('dashboard');
      }
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Offline Status Bar */}
      <OfflineIndicator onOpenFieldGuide={() => setCurrentView('guide')} />

      {/* Hidden File Input for Gallery Fallback */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-300 transition">
                  LeafLens
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Leaf Deficiency Scanner
              </p>
            </div>
          </button>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView(currentView === 'guide' ? 'dashboard' : 'guide')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                currentView === 'guide'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Browse offline deficiency knowledge base"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Field Guide</span>
            </button>

            <PWAInstallButton compact />

            {currentView !== 'camera' && (
              <button
                onClick={() => setCurrentView('camera')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition cursor-pointer active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take Photo</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {/* Fullscreen Live Camera View */}
        {currentView === 'camera' && (
          <CameraView
            onCapture={(dataUrl, sampleHint) => {
              setCurrentView('dashboard');
              handleAnalyzePhoto(dataUrl, sampleHint);
            }}
            onClose={() => setCurrentView('dashboard')}
          />
        )}

        {/* Diagnosis Result View */}
        {currentView === 'result' && activeScan && (
          <DiagnosisResult
            scan={activeScan}
            onScanAnother={() => setCurrentView('camera')}
            onBack={() => setCurrentView('dashboard')}
            onToggleChecklistItem={handleToggleChecklist}
          />
        )}

        {/* Offline Field Guide View */}
        {currentView === 'guide' && (
          <OfflineFieldGuide onClose={() => setCurrentView('dashboard')} />
        )}

        {/* Dashboard / Home View */}
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* API Error Toast if diagnosis failed */}
            {apiError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
                <Info className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="block font-bold mb-0.5">Analysis Failed</strong>
                  <span>{apiError}</span>
                </div>
                <button
                  onClick={() => setApiError(null)}
                  className="text-rose-400 hover:text-white font-bold text-xs"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Hero Camera Trigger Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl">
              {/* Glow effects */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time Nutrient & Leaf Health AI</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Point camera at leaf. <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Identify deficiencies instantly.
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Identify Magnesium, Potassium, Nitrogen, Iron, and Calcium deficiencies with visual symptoms, soil pH analysis, and actionable organic remedies.
                </p>

                {/* Primary Camera Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setCurrentView('camera')}
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/40 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Photo with Camera</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 px-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Or choose from photos</span>
                  </button>
                </div>

                {/* Privacy & Speed Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Session-Only Storage
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    No Login Required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Unlimited Free Scans
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Offline PWA Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Instant Sample Leaves Quick Carousel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Quick Test Samples (1-Click Diagnosis)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Test the AI model right now without needing a live plant or camera
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_LEAVES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleAnalyzePhoto(sample.dataUrl, `${sample.species} with ${sample.tag}`)}
                    className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-850 transition text-left cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-2 relative">
                      <img
                        src={sample.dataUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
                        Test
                      </span>
                    </div>
                    <div>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-1 ${sample.accent}`}>
                        {sample.tag}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                        {sample.name}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Session Scans List */}
            <RecentScans
              scans={scans}
              onSelectScan={(scan) => {
                setActiveScan(scan);
                setCurrentView('result');
              }}
              onClearScans={handleClearAll}
              onStartCamera={() => setCurrentView('camera')}
            />

            {/* Botanical Deficiency Matrix Preview */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Botanical Nutrient Diagnostic Field Key
                    </h3>
                    <p className="text-xs text-slate-400">
                      Learn the visual patterns of mobile vs immobile leaf deficiencies
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('guide')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Key</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Magnesium (Mg)
                  </span>
                  <p className="text-xs font-semibold text-white">Interveinal Chlorosis</p>
                  <p className="text-[11px] text-slate-400">
                    Yellowing between veins on older lower leaves. Veins stay green.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    Potassium (K)
                  </span>
                  <p className="text-xs font-semibold text-white">Marginal Leaf Scorch</p>
                  <p className="text-[11px] text-slate-400">
                    Crispy burnt brown edges and curling along outer leaf borders.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                    Nitrogen (N)
                  </span>
                  <p className="text-xs font-semibold text-white">Uniform Yellowing</p>
                  <p className="text-[11px] text-slate-400">
                    Overall pale yellowing starting strictly from oldest bottom foliage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Analysis Overlay Modal */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-8 shadow-2xl text-center space-y-5">
            {/* Animated Botanical Scan Radar */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                Diagnosing Leaf Health
              </h3>
              <p className="text-xs text-emerald-300 font-mono animate-pulse min-h-[36px] flex items-center justify-center">
                {analysisStatus}
              </p>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-[indeterminate_2s_infinite]" />
            </div>

            <p className="text-[11px] text-slate-500">
              Classifying nutrient markers & botanical pathology...
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 px-4 border-t border-slate-800/80 text-center text-xs text-slate-500 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <button
            onClick={() => setCurrentView('guide')}
            className="hover:text-emerald-400 transition cursor-pointer"
          >
            Offline Diagnostic Key
          </button>
          <span>•</span>
          <button
            onClick={() => setCurrentView('camera')}
            className="hover:text-emerald-400 transition cursor-pointer"
          >
            Live Camera Scanner
          </button>
          <span>•</span>
          <button
            onClick={handleClearAll}
            className="hover:text-rose-400 transition cursor-pointer"
          >
            Reset Session Data
          </button>
        </div>
        <p className="text-[11px] text-slate-600">
          LeafLens • Offline-first PWA • Session storage automatically cleared upon browser close • Zero tracking
        </p>
      </footer>

      {/* Floating Botanical AI Chatbot in Corner */}
      <Chatbot activeScan={activeScan} onNavigateToView={setCurrentView} />
    </div>
  );
}
