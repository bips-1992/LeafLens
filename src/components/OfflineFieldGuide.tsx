import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Layers, CheckCircle2, Shield, ArrowUpDown, X, Droplets, FlaskConical } from 'lucide-react';
import { DEFICIENCIES_GUIDE } from '../data/deficienciesGuide';
import { OfflineNutrientGuide } from '../types';

interface OfflineFieldGuideProps {
  onClose?: () => void;
}

export const OfflineFieldGuide: React.FC<OfflineFieldGuideProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMobility, setFilterMobility] = useState<'all' | 'mobile' | 'immobile'>('all');
  const [selectedGuide, setSelectedGuide] = useState<OfflineNutrientGuide | null>(null);

  const filteredGuides = useMemo(() => {
    return DEFICIENCIES_GUIDE.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.classicSymptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.visualMarkers.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMobility =
        filterMobility === 'all' ||
        (filterMobility === 'mobile' && item.mobility.startsWith('Mobile')) ||
        (filterMobility === 'immobile' && item.mobility.startsWith('Immobile'));

      return matchesSearch && matchesMobility;
    });
  }, [searchQuery, filterMobility]);

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Offline Botanical Diagnostic Key</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            100% offline reference guide for garden & greenhouse nutrient deficiencies
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobility Quick Diagnostic Rule */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 text-xs text-slate-300 space-y-2">
        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4 text-emerald-400" />
          <span>The Golden Rule of Leaf Deficiency Diagnosis</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">
              Old / Lower Leaves First (Mobile Nutrients):
            </span>
            <p className="text-[11px] text-slate-300">
              <strong>Nitrogen, Phosphorus, Potassium, Magnesium</strong>. The plant robs nutrients from old leaves to fuel new shoots.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="font-bold text-teal-400 block mb-1">
              New / Upper Growth First (Immobile Nutrients):
            </span>
            <p className="text-[11px] text-slate-300">
              <strong>Calcium, Iron, Sulfur, Zinc, Manganese</strong>. The plant cannot move these, so new leaves suffer immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Mobility Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search symptoms (e.g., interveinal, scorched edges, iron)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setFilterMobility('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterMobility === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Nutrients
          </button>
          <button
            onClick={() => setFilterMobility('mobile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterMobility === 'mobile'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Older Leaves
          </button>
          <button
            onClick={() => setFilterMobility('immobile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filterMobility === 'immobile'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Growth
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGuides.map((guide) => (
          <div
            key={guide.name}
            onClick={() => setSelectedGuide(guide)}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-850 transition cursor-pointer space-y-3 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${guide.colorTheme} text-slate-950 font-black text-sm flex items-center justify-center shadow-md font-mono flex-shrink-0`}>
                  {guide.symbol}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                    {guide.name} Deficiency
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    {guide.mobility}
                  </span>
                </div>
              </div>

              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                View Details
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {guide.classicSymptom}
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate pr-2 font-mono">
                🧪 {guide.soilPhLockout}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal for Selected Guide */}
      {selectedGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedGuide(null)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedGuide.colorTheme} text-slate-950 font-black text-xl flex items-center justify-center shadow-lg font-mono flex-shrink-0`}>
                  {selectedGuide.symbol}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedGuide.name} Deficiency Guide
                  </h3>
                  <span className="text-xs font-semibold text-emerald-400">
                    {selectedGuide.mobility}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {selectedGuide.shortDescription}
            </p>

            {/* Visual Markers Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Key Visual Indicators
              </h4>
              <div className="space-y-1.5">
                {selectedGuide.visualMarkers.map((marker, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{marker}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast Remedies */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  Immediate Organic Remedy (Foliar & Soil)
                </span>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  {selectedGuide.organicFix}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-sky-400" />
                  Mineral & Chemical Amendment
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedGuide.chemicalFix}
                </p>
              </div>
            </div>

            {/* Soil pH */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200">
              <strong className="text-amber-300">Soil pH Lockout Factor: </strong>
              {selectedGuide.soilPhLockout}
            </div>

            <button
              onClick={() => setSelectedGuide(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
