import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  History,
  GitCommit,
  GitBranch,
  Rocket,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export default function VersionsPage() {
  const { versions, patches, deployments } = usePatchworkStore();

  return (
    <DashboardLayout
      title="Version History & Git Commits"
      subtitle="Git-native timeline of every production and visual patch deployment."
      actions={
        <Link
          href="/rollback"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Rollback Control</span>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="glass-card p-6 border border-white/80 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-[#1B133C]">Production Version Timeline</h3>
            </div>
            <span className="text-xs text-muted-foreground">{versions.length} Releases Recorded</span>
          </div>

          {versions.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#1B133C]">No Versions Recorded Yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  When you pair the Axon extension and commit or deploy visual changes to your Git repository, live releases and commit SHAs will be recorded here automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-8">
              {versions.map((ver, idx) => (
              <div key={ver.version} className="relative group">
                {/* Timeline node */}
                <span
                  className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full ring-4 ring-white ${
                    ver.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />

                <div className="p-4 rounded-xl bg-white border border-black/5 hover:border-black/15 shadow-xs transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-[#1B133C]">{ver.version}</span>
                      <h4 className="text-sm font-semibold text-[#1B133C]">{ver.title}</h4>
                      {ver.status === 'active' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Active Production
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ver.deployedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <GitCommit className="w-3.5 h-3.5 text-indigo-600" /> {ver.commitSha}
                    </span>
                    <span>Author: <strong>{ver.author.name}</strong></span>
                    <span>Deployment: <strong className="font-mono">{ver.deploymentId}</strong></span>
                    {ver.patchId && (
                      <Link href={`/patches/${ver.patchId}`} className="text-indigo-600 hover:underline font-mono">
                        {ver.patchId}
                      </Link>
                    )}
                  </div>

                  {ver.rollbackPossible && ver.status !== 'active' && (
                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/rollback?target=${ver.version}`}
                        className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Rollback to this version
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}
