import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { GitHubIcon } from '@/components/BrandIcons';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  FolderGit2,
  ArrowLeft,
  Check
} from 'lucide-react';

export default function GitHubIntegrationPage() {
  const { integrations, updateIntegrations, logAudit, projects: storeProjects, patches } = usePatchworkStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [connected, setConnected] = useState(Boolean(integrations?.github?.connected));

  const repos = storeProjects.length > 0
    ? storeProjects.map((p) => ({
        name: p.repositoryName,
        defaultBranch: p.defaultBranch,
        patchesCount: patches.filter((pt) => pt.projectId === p.id).length,
        active: true,
      }))
    : [
        { name: 'organization/production-repo', defaultBranch: 'main', patchesCount: 0, active: true },
      ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateIntegrations((prev) => ({
        ...prev,
        github: { ...prev.github, lastSync: 'Just now' },
      }));
      logAudit('GITHUB_CONNECTED', { metadata: { action: 'resync_repositories' } });
    }, 600);
  };

  const handleToggleConnect = () => {
    const nextState = !connected;
    setConnected(nextState);
    updateIntegrations((prev) => ({
      ...prev,
      github: { ...prev.github, connected: nextState },
    }));
    logAudit(nextState ? 'GITHUB_CONNECTED' : 'GITHUB_DISCONNECTED');
  };

  return (
    <DashboardLayout
      title="GitHub App Integration"
      subtitle="Git-native connection via the official PATCHWORK GitHub App."
      actions={
        <Link
          href="/settings/integrations"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Integrations Hub
        </Link>
      }
    >
      <div className="max-w-4xl space-y-6">
        <SettingsNav currentTab="integrations" />

        {/* Clerk Auth Integration Banner */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-950">Authorized via Clerk Authentication</span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full border border-emerald-300">
                  SSO Active ✓
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                GitHub OAuth tokens and repo dispatch permissions are secured by Clerk Enterprise Auth. Single sign-on and webhook identity verification are active.
              </p>
            </div>
          </div>
          <Link
            href="/settings/security"
            className="text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline shrink-0 whitespace-nowrap"
          >
            Manage in Security
          </Link>
        </div>

        {/* Connection Status Card */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                <GitHubIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1B133C]">GitHub Organization App</h3>
                  {connected ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">
                      Disconnected
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Authorized Organization: <strong className="text-[#1B133C] font-mono">{integrations.github.org}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing || !connected}
                className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
                <span>Sync Repos</span>
              </button>
              <button
                onClick={handleToggleConnect}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  connected
                    ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-[#1B133C] text-white hover:bg-black'
                }`}
              >
                {connected ? 'Disconnect' : 'Connect GitHub'}
              </button>
            </div>
          </div>

          {/* Workflow Diagram */}
          <div className="p-4 rounded-xl bg-white border border-black/5 space-y-2 text-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Git-Native Lifecycle Workflow
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#1B133C]">
              <span className="px-2.5 py-1 bg-slate-100 rounded">1. Visual Edit Captured</span>
              <span>→</span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded">2. Branch Created (patchwork/*)</span>
              <span>→</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded">3. Isolated Preview Deployed</span>
              <span>→</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded">4. PR Synchronized</span>
              <span>→</span>
              <span className="px-2.5 py-1 bg-[#1B133C] text-white rounded">5. Production Release</span>
            </div>
          </div>
        </div>

        {/* Repositories Access Table */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <div>
              <h4 className="text-sm font-bold text-[#1B133C]">Installed Repositories</h4>
              <p className="text-xs text-muted-foreground">Authorized for branch creation and visual patch pull requests.</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">Last sync: {integrations.github.lastSync}</span>
          </div>

          <div className="divide-y divide-black/5">
            {repos.map((repo) => (
              <div key={repo.name} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FolderGit2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-mono font-bold text-[#1B133C]">{repo.name}</span>
                    <span className="text-muted-foreground ml-2">(Default: {repo.defaultBranch})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono">{repo.patchesCount} patches</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      repo.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {repo.active ? 'Active' : 'Idle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Permissions */}
        <div className="glass-card p-6 border border-white/80 space-y-3">
          <h4 className="text-sm font-bold text-[#1B133C] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security & Short-Lived Tokens
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            PATCHWORK strictly uses short-lived GitHub App installation tokens. Personal Access Tokens (PATs) are never required or stored. All code changes result in traceable git commits signed by verified workspace members.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
