import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  AlertTriangle,
  Layers,
  Sliders,
  Check,
  ExternalLink
} from 'lucide-react';

export default function VerificationPage() {
  const { verificationRun, visualSnapshot, runVerificationSuite, patches } = usePatchworkStore();
  const [sliderPos, setSliderPos] = useState(50);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    runVerificationSuite(verificationRun.patchId || patches[0]?.id || 'PW-101');
    setTimeout(() => setIsRunning(false), 1400);
  };

  return (
    <DashboardLayout
      title="Automated Verification Suite"
      subtitle="12-step automated verification, perceptual visual regression, and AI visual QA."
      actions={
        <button
          onClick={handleRun}
          disabled={isRunning || verificationRun.status === 'running'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{isRunning ? 'Running 12 Checks...' : 'Run Verification Suite'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Verification Summary Card */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                  {verificationRun.patchId}
                </span>
                <h3 className="text-base font-bold text-[#1B133C]">Automated QA Test Results</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Completed at {new Date(verificationRun.completedAt || Date.now()).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {verificationRun.passedChecks} of {verificationRun.totalChecks} Checks Passed
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold">
                {verificationRun.visualSimilarityPercent}% Visual Similarity
              </span>
            </div>
          </div>

          {/* 12-STEP PIPELINE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {verificationRun.checks.map((check) => (
              <div
                key={check.id}
                className="p-3.5 rounded-xl bg-white border border-black/5 hover:border-black/15 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                      {check.stepNumber}
                    </span>
                    <h4 className="text-xs font-bold text-[#1B133C] truncate">{check.name}</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {check.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Passed
                  </span>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">{check.durationMs}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VISUAL REGRESSION & SCREENSHOT QA */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-[#1B133C]">Visual Regression Comparison</h3>
            </div>
            <span className="text-xs text-muted-foreground">
              Perceptual Diff Match: <strong className="text-emerald-700 font-mono">98.7%</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Baseline Screenshot */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                1. Baseline (Production)
              </span>
              <div className="rounded-xl overflow-hidden border border-black/10 aspect-video relative bg-slate-900 group">
                <img
                  src={visualSnapshot.beforeScreenshotUrl}
                  alt="Production Baseline Screenshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-md rounded text-[10px] text-white font-mono">
                  Production URL
                </div>
              </div>
            </div>

            {/* Proposed Patch Screenshot */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                2. Patch Preview ({verificationRun.patchId || patches[0]?.id || 'Active Patch'})
              </span>
              <div className="rounded-xl overflow-hidden border-2 border-indigo-500/60 aspect-video relative bg-slate-900 group">
                <img
                  src={visualSnapshot.afterScreenshotUrl}
                  alt="Patch Preview Screenshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-mono">
                  Preview URL
                </div>
              </div>
            </div>

            {/* Difference Map */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                3. Perceptual Diff Map
              </span>
              <div className="rounded-xl overflow-hidden border border-black/10 aspect-video relative bg-slate-900 group">
                <img
                  src={visualSnapshot.diffHighlightUrl}
                  alt="Difference Highlighting"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-mono">
                  Highlight (Button area)
                </div>
              </div>
            </div>
          </div>

          {/* AI Visual Analysis Box */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs text-[#1B133C] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Perceptual Quality Summary</span>
            </div>
            <p className="leading-relaxed text-indigo-950/80">
              {visualSnapshot.aiExplanation}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
