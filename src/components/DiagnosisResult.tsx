import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Droplets,
  Activity,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Share2,
  CheckSquare,
  Square,
  Info,
  Layers,
  Leaf,
  Clock,
  FlaskConical,
} from 'lucide-react';
import { DiagnosisData, ScanRecord } from '../types';

interface DiagnosisResultProps {
  scan: ScanRecord;
  onScanAnother: () => void;
  onBack: () => void;
  onToggleChecklistItem?: (scanId: string, itemKey: string) => void;
}

export const DiagnosisResult: React.FC<DiagnosisResultProps> = ({
  scan,
  onScanAnother,
  onBack,
  onToggleChecklistItem,
}) => {
  const { diagnosis, image, checklistState = {} } = scan;
  const [copiedShare, setCopiedShare] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const confidenceScore = diagnosis.confidence || 75;

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'mild':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const handleShare = async () => {
    const textToShare = `🌿 LeafLens Plant Diagnosis:
Plant: ${diagnosis.plantName}
Result: ${diagnosis.shortSummary}
Severity: ${diagnosis.severity}
Symptoms: ${diagnosis.visualSymptoms?.slice(0, 2).join(', ')}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `LeafLens: ${diagnosis.shortSummary}`,
          text: textToShare,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(textToShare);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Ignore
    }
  };

  if (!diagnosis.isPlant) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Plant Leaf Detected</h2>
          <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto">
            {diagnosis.nonPlantReason ||
              'The AI model could not identify clear plant foliage or a leaf in this image. Please capture a clear, close-up photo of the affected plant leaf.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
            >
              Back
            </button>
            <button
              onClick={onScanAnother}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              Scan Another Leaf
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/80 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scans</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition cursor-pointer"
            title="Share summary"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedShare ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={onScanAnother}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* Hero Prediction Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Leaf className="w-3.5 h-3.5" />
                {diagnosis.plantName || 'Plant'}
              </span>

              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(diagnosis.severity)}`}>
                <Activity className="w-3 h-3" />
                {diagnosis.severity} Severity
              </span>

              {diagnosis.affectedArea && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Layers className="w-3 h-3" />
                  {diagnosis.affectedArea}
                </span>
              )}
            </div>

            {/* Primary Prediction Banner */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                AI Diagnostic Result
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {diagnosis.shortSummary}
              </h1>
            </div>

            {/* Confidence score indicator bar */}
            <div className="space-y-1.5 max-w-sm pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Model Confidence</span>
                <span className="font-bold text-emerald-400">{confidenceScore}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(10, confidenceScore))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Captured Leaf Photo Thumbnail */}
          <div className="flex-shrink-0 flex items-center justify-center md:justify-end">
            <button
              onClick={() => setShowPhotoModal(true)}
              className="relative group rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-emerald-400 transition shadow-lg cursor-pointer"
              title="Click to view full photo"
            >
              <img
                src={image}
                alt={diagnosis.plantName}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition flex items-center justify-center">
                <span className="text-[10px] bg-black/75 px-1.5 py-0.5 rounded text-white font-mono opacity-80 group-hover:opacity-100">
                  Inspect
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Immediate Action Plan & Visual Symptoms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Immediate Next Steps */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Droplets className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3>Immediate Recovery Steps</h3>
              <p className="text-xs text-slate-400 font-normal">Fastest remedies to reverse symptoms</p>
            </div>
          </div>

          <div className="space-y-3">
            {diagnosis.immediateActions?.map((action, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/30 transition space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    {action.title}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                    {action.method}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6.5">
                  {action.instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Observed Visual Symptoms */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3>Observed Visual Symptoms</h3>
              <p className="text-xs text-slate-400 font-normal">Leaf markers detected by AI vision</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {diagnosis.visualSymptoms?.map((symptom, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{symptom}</span>
              </li>
            ))}
          </ul>

          {/* Root Causes */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              Underlying Root Causes
            </h4>
            <div className="space-y-1.5">
              {diagnosis.rootCauses?.map((cause, idx) => (
                <p key={idx} className="text-xs text-slate-400 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-sky-400">
                  {cause}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Soil pH & Long-term Amendments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Soil & pH Diagnostics */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <FlaskConical className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3>Soil & pH Balance</h3>
              <p className="text-xs text-slate-400 font-normal">Nutrient lockout prevention</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Target Soil pH Sweetspot
            </span>
            <div className="text-3xl font-black text-sky-300">
              {diagnosis.soilAndPh?.optimalPh || '6.0 – 6.8'}
            </div>
            <p className="text-xs text-slate-300">
              {diagnosis.soilAndPh?.explanation}
            </p>
          </div>

          <p className="text-xs text-slate-400 italic">
            💡 {diagnosis.soilAndPh?.testAdvice}
          </p>
        </div>

        {/* Long-Term Soil Amendments & Organic Fixes */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3>Long-Term Soil Amendments</h3>
              <p className="text-xs text-slate-400 font-normal">Sustainable organic amendments</p>
            </div>
          </div>

          <div className="space-y-2">
            {diagnosis.longTermRemedies?.map((remedy, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                <span>{remedy}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Action Checklist */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Interactive Care Checklist</span>
          </div>
          <span className="text-xs text-slate-400">Saved in current session</span>
        </div>

        <div className="space-y-2">
          {diagnosis.immediateActions?.map((action, idx) => {
            const key = `action_${idx}`;
            const isChecked = Boolean(checklistState[key]);

            return (
              <button
                key={key}
                onClick={() => onToggleChecklistItem?.(scan.id, key)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                  <div>
                    <h5 className={`text-xs font-semibold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                      {action.title}
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {action.instruction}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                  {action.method}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botany Fun Fact */}
      {diagnosis.funBotanyFact && (
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3 text-xs text-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-emerald-300">Botanical Note:</strong> {diagnosis.funBotanyFact}
          </p>
        </div>
      )}

      {/* Modal for full photo inspection */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-pointer"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center">
            <img
              src={image}
              alt="Full leaf preview"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain border border-slate-700"
            />
            <p className="text-xs text-slate-400 mt-3">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};
