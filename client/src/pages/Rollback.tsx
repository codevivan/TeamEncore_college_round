import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  GitCommit,
  Rocket,
  ShieldCheck,
  Check,
  ArrowLeft
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { VersionItem } from '../../../shared/patchwork-types';

export default function RollbackPage() {
  const [, setLocation] = useLocation();
  const { versions, triggerRollback } = usePatchworkStore();
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);
  const [reason, setReason] = useState('Critical layout regression or unexpected production bug');
  const [isRollbackDone, setIsRollbackDone] = useState(false);

  const currentVersion = versions.find((v) => v.status === 'active') || versions[0];
  const rollbackCandidates = versions.filter((v) => v.status !== 'active' && v.rollbackPossible);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get('target');
    if (target) {
      const match = versions.find((v) => v.version === target);
      if (match) setSelectedVersion(match);
    }
  }, [versions]);

  const handleConfirmRollback = async () => {
    if (!selectedVersion) return;
    await triggerRollback(selectedVersion, reason);
    setSelectedVersion(null);
    setIsRollbackDone(true);
    setTimeout(() => {
      setIsRollbackDone(false);
      setLocation('/versions');
    }, 2000);
  };

  return (
    <DashboardLayout
      title="Instant Production Rollback"
      subtitle="Safely restore previous stable versions without destructive git history alteration."
      actions={
        <Link
          href="/versions"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Versions Timeline
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Success Alert */}
        {isRollbackDone && (
          <div className="p-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg animate-bounce">
            <CheckCircle2 className="w-4 h-4" /> Non-destructive rollback complete! Safe revert deployment live.
          </div>
        )}

        {/* Current Active Version Card */}
        <div className="glass-card p-6 border border-white/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Live Production Version
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              Active Now
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-[#1B133C]">{currentVersion.version}</span>
                <span className="text-base font-semibold text-[#1B133C]">{currentVersion.title}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Deployed by <strong>{currentVersion.author.name}</strong> • Commit{' '}
                <span className="font-mono">{currentVersion.commitSha}</span> (Deployment: {currentVersion.deploymentId})
              </p>
            </div>
          </div>
        </div>

        {/* Rollback Safety Guardrail Explainer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Non-Destructive Safe Rollback Architecture</span>
          </div>
          <p className="leading-relaxed">
            PATCHWORK never executes destructive <code className="font-mono">git reset --hard</code> on production trees. Clicking Rollback creates an atomic, forward-moving <strong>git revert</strong> commit and triggers a certified deployment snapshot with 100% audit traceability.
          </p>
        </div>

        {/* Stable Versions Available for Restore */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#1B133C]">Stable Previous Versions Available for Restore</h3>

          <div className="space-y-3">
            {rollbackCandidates.map((ver) => (
              <div
                key={ver.version}
                className="glass-card p-5 border border-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {ver.version}
                    </span>
                    <h4 className="text-sm font-semibold text-[#1B133C]">{ver.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Author: {ver.author.name} • Commit <span className="font-mono">{ver.commitSha}</span> • Deployed {new Date(ver.deployedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedVersion(ver)}
                  className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rollback to {ver.version}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <Dialog open={Boolean(selectedVersion)} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="sm:max-w-md glass-card border border-white/80">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#1B133C] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              Confirm Production Rollback
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You are about to restore the previous production version{' '}
              <strong className="text-[#1B133C] font-mono">{selectedVersion?.version}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-[#1B133C]">Target Version: {selectedVersion?.title}</p>
              <p className="text-muted-foreground font-mono">Commit SHA: {selectedVersion?.commitSha}</p>
              <p className="text-muted-foreground">Original Author: {selectedVersion?.author.name}</p>
            </div>

            <div>
              <label className="block font-semibold text-[#1B133C] mb-1">Reason for Rollback (Recorded in Audit Log)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <button
              onClick={() => setSelectedVersion(null)}
              className="px-4 py-2 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRollback}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Deploy Revert</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
