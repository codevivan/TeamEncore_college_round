import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  GitPullRequest,
  Rocket,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  Puzzle,
  Laptop,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Chrome
} from 'lucide-react';
import { GitHubIcon, VercelIcon, ChromeIcon } from '@/components/BrandIcons';

export default function DashboardPage() {
  const {
    projects,
    patches,
    deployments,
    verificationRun,
    auditLogs,
    extensionSessions,
    presence,
    activeProjectId,
    seedStarterProject,
    isLoading
  } = usePatchworkStore();

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const activePatches = patches.filter((p) => p.status !== 'DEPLOYED' && p.status !== 'ROLLED_BACK');
  const latestPatch = patches[0];
  const latestDeployment = deployments[0];
  const isExtensionConnected = extensionSessions.length > 0;

  return (
    <DashboardLayout
      title="Overview"
      subtitle={
        activeProject
          ? `${activeProject.name} • ${activeProject.productionUrl.replace('https://', '')}`
          : 'Welcome to Axon Studio • Connect your production site to get started'
      }
      actions={
        activeProject ? (
          <div className="flex items-center gap-2.5">
            <Link
              href="/patches"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Patch</span>
            </Link>
            <a
              href={activeProject.productionUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/10 bg-white text-[#1B133C] text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-all"
            >
              <span>Visit Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </Link>
          </div>
        )
      }
    >
      <div className="space-y-8 max-w-6xl">
        {/* IF NO PROJECT: CLEAN ONBOARDING CARD */}
        {!activeProject ? (
          <div className="glass-card p-8 md:p-12 border border-white/80 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
              <Laptop className="w-7 h-7" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-[#1B133C]">No Active Projects Yet</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your live website or web repository to enable visual inspection, browser-staged git hotfixes, and multiplayer team collaboration.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-md hover:bg-black transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Project</span>
              </Link>
            </div>
          </div>
        ) : (
          /* TOP SPOTLIGHT: LIVE SITE PREVIEW & PATCH PIPELINE */
          <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold text-[#1B133C]">{activeProject.name}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Production Healthy
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <GitHubIcon size={14} className="text-black/70" />
                  <span>{activeProject.repositoryName}</span>
                  <span>•</span>
                  <span>Branch: <strong>{activeProject.defaultBranch}</strong></span>
                  <span>•</span>
                  <span className="capitalize">{activeProject.framework}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {latestPatch ? (
                  <Link
                    href={`/patches/${latestPatch.id}`}
                    className="px-4 py-2 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
                  >
                    <span>Inspect Active Patch ({latestPatch.id})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href="/extension-connect"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-xs flex items-center gap-2 transition-all"
                  >
                    <Chrome className="w-3.5 h-3.5" />
                    <span>Open in Extension Studio</span>
                  </Link>
                )}
              </div>
            </div>

            {/* VISUAL SITE MOCKUP BANNER */}
            <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs">
              {/* Mock browser top bar */}
              <div className="px-4 py-3 bg-slate-50/80 border-b border-black/5 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-3 font-mono text-[11px] text-[#1B133C] bg-white px-3 py-1 rounded-md border border-black/5 shadow-2xs">
                    {activeProject.productionUrl}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{verificationRun.passedChecks}/{verificationRun.totalChecks} Automated Checks Passed</span>
                </div>
              </div>

              {/* Visual site preview illustration */}
              <div className="p-8 sm:p-14 text-center bg-gradient-to-b from-white to-[#fbfaf8] space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white shadow-2xs text-xs font-medium text-[#1B133C]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Live Preview Synchronized</span>
                </div>
                <h3 className="font-serif text-3xl sm:text-5xl font-normal text-[#1B133C] tracking-tight">
                  Hotfix the Internet.
                </h3>
                <p className="max-w-md mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Direct visual styling and DOM adjustments captured from Chrome and mapped to Git commits.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  {latestPatch ? (
                    <Link
                      href={`/patches/${latestPatch.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#1B133C] text-white font-medium text-xs shadow-md hover:bg-black transition-all"
                    >
                      Review {latestPatch.id} Diff & Release
                    </Link>
                  ) : (
                    <Link
                      href="/extension-connect"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Chrome className="w-3.5 h-3.5" />
                      <span>Stage Visual Hotfix in Chrome</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 CLEAN KEY METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Active Visual Patches</span>
              <GitPullRequest className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-[#1B133C]">{activePatches.length}</p>
            <p className="text-xs text-indigo-700 font-medium">
              {latestPatch ? `${latestPatch.id} staged • ${latestPatch.status}` : 'Zero pending patches'}
            </p>
          </div>

          <div className="glass-card p-6 border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Automated Verification</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-[#1B133C]">
              {verificationRun.passedChecks} / {verificationRun.totalChecks}
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              Zero unhandled errors • {verificationRun.visualSimilarityPercent}% visual match
            </p>
          </div>

          <div className="glass-card p-6 border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider">Latest Production Release</span>
              <Rocket className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-[#1B133C]">
              {latestDeployment ? latestDeployment.id : 'DEP-READY'}
            </p>
            <p className="text-xs text-purple-700 font-medium">
              {latestDeployment
                ? `Deployed on ${latestDeployment.provider} (${latestDeployment.commitSha})`
                : 'Pipeline armed & ready for release'}
            </p>
          </div>
        </div>

        {/* TWO COLUMN GRID: ACTIVE PATCHES & CLIENT PAIRING / ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Patches (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1B133C] flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-600" />
                Active Visual Patches
              </h3>
              <Link href="/patches" className="text-xs text-indigo-600 font-semibold hover:underline">
                View All ({patches.length})
              </Link>
            </div>

            {patches.length === 0 ? (
              <div className="glass-card p-8 border border-white/80 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  No visual patches submitted yet. Launch the Axon Chrome Extension on your live site to inspect elements and publish your first visual hotfix.
                </p>
                <Link
                  href="/extension-connect"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  <Chrome className="w-3.5 h-3.5" />
                  <span>Connect Chrome Extension</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {patches.slice(0, 3).map((patch) => (
                  <div
                    key={patch.id}
                    className="glass-card p-5 border border-white/80 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          {patch.id}
                        </span>
                        <Link
                          href={`/patches/${patch.id}`}
                          className="text-sm font-bold text-[#1B133C] hover:text-indigo-600 transition-colors truncate"
                        >
                          {patch.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Author: <strong>{patch.author.name}</strong></span>
                        <span>•</span>
                        <span>{patch.files.length} files modified</span>
                        <span>•</span>
                        <span className="font-mono">{patch.branchName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          patch.status === 'READY_TO_DEPLOY'
                            ? 'bg-emerald-100 text-emerald-800'
                            : patch.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : patch.status === 'DEPLOYED'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {patch.status.replace(/_/g, ' ')}
                      </span>
                      <Link
                        href={`/patches/${patch.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold shadow-2xs"
                      >
                        Review Diff
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Extension Status & Activity */}
          <div className="space-y-6">
            {/* Chrome Extension Status */}
            <div className="glass-card p-6 border border-white/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2.5">
                  <ChromeIcon size={20} className="text-indigo-600" />
                  <h4 className="text-xs font-bold text-[#1B133C] uppercase tracking-wider">Chrome Extension</h4>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {isExtensionConnected ? 'Connected ✓' : 'Pair Device'}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                The Axon Chrome Extension enables live DOM inspection and visual styling adjustments directly on your production environment.
              </p>

              <Link
                href="/settings/extension"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#1B133C] hover:bg-slate-50 transition-all shadow-2xs"
              >
                <span>Manage Paired Browsers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recent Audit Logs */}
            <div className="glass-card p-6 border border-white/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h4 className="text-xs font-bold text-[#1B133C] uppercase tracking-wider">Recent Activity</h4>
                <Link href="/audit" className="text-[11px] text-indigo-600 hover:underline">
                  View Audit Logs
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent activity recorded.</p>
                ) : (
                  auditLogs.slice(0, 4).map((log) => {
                    const userName = typeof log.user === 'object' ? (log.user as any)?.name : log.user || 'Member';
                    return (
                      <div key={log.id} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[#1B133C] leading-snug">
                            <strong>{userName}</strong>{' '}
                            <span className="text-muted-foreground">{log.action.toLowerCase().replace(/_/g, ' ')}</span>{' '}
                            {log.patchId && <strong className="font-mono text-indigo-700">{log.patchId}</strong>}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
