import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Rocket,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Terminal,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Deployment } from '../../../shared/patchwork-types';

export default function DeploymentsPage() {
  const { deployments, projects, triggerDeployment } = usePatchworkStore();
  const [activeLogDep, setActiveLogDep] = useState<Deployment | null>(null);

  return (
    <DashboardLayout
      title="Deployments & Previews"
      subtitle="Isolated preview environments and production releases on Vercel and Netlify."
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/verification"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verification Suite</span>
          </Link>
          <Link
            href="/rollback"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Instant Rollback</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {deployments.length === 0 ? (
          <div className="glass-card p-12 text-center border border-white/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-200">
              <Rocket className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1B133C]">No Deployments Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Approve and promote a visual patch to trigger an automated preview build or production release.
              </p>
            </div>
          </div>
        ) : (
          /* Deployments List */
          <div className="space-y-4">
            {deployments.map((dep) => {
              const project = projects.find((p) => p.id === dep.projectId);
              return (
                <div
                  key={dep.id}
                  className="glass-card p-5 border border-white/80 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {dep.id}
                    </span>
                    <span className="text-sm font-bold text-[#1B133C]">
                      {project?.name || 'Production Site'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        dep.environment === 'production'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {dep.environment}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/5 text-muted-foreground">
                      via {dep.provider}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Triggered by <strong>{dep.author.name}</strong> • Commit{' '}
                    <span className="font-mono font-semibold">{dep.commitSha}</span> (Branch:{' '}
                    <span className="font-mono">{dep.branch}</span>)
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duration: {dep.durationSeconds}s
                    </span>
                    <span>•</span>
                    <a
                      href={dep.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono truncate max-w-[260px]"
                    >
                      <span>{dep.previewUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                  </span>

                  <button
                    onClick={() => setActiveLogDep(dep)}
                    className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-xs text-[#1B133C] flex items-center gap-1"
                    title="View Logs"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logs</span>
                  </button>

                  <a
                    href={dep.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* BUILD LOGS MODAL */}
      <Dialog open={Boolean(activeLogDep)} onOpenChange={() => setActiveLogDep(null)}>
        <DialogContent className="sm:max-w-xl glass-card border border-white/80">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#1B133C]">
              Build Logs: {activeLogDep?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs max-h-72 overflow-y-auto space-y-1">
            {activeLogDep?.logs?.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                {line}
              </div>
            )) || <p className="text-slate-500">Logs packaging complete.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
