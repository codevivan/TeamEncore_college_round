import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { NetlifyIcon } from '@/components/BrandIcons';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Globe,
  ArrowLeft
} from 'lucide-react';

export default function NetlifyIntegrationPage() {
  const { integrations, updateIntegrations, logAudit, projects: storeProjects } = usePatchworkStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [connected, setConnected] = useState(Boolean(integrations?.netlify?.connected));

  const sites = storeProjects.length > 0
    ? storeProjects.map((p) => ({
        name: p.slug || p.name.toLowerCase(),
        domain: `${p.slug || 'app'}.netlify.app`,
        buildHook: 'Active',
        status: 'ready' as const,
      }))
    : [
        { name: 'production-marketing', domain: 'production.netlify.app', buildHook: 'Active', status: 'ready' as const },
      ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateIntegrations((prev) => ({
        ...prev,
        netlify: { ...prev.netlify, lastSync: 'Just now' },
      }));
      logAudit('INTEGRATION_SYNCED', { metadata: { provider: 'netlify' } });
    }, 600);
  };

  const handleToggle = () => {
    const nextState = !connected;
    setConnected(nextState);
    updateIntegrations((prev) => ({
      ...prev,
      netlify: { ...prev.netlify, connected: nextState },
    }));
  };

  return (
    <DashboardLayout
      title="Netlify Integration"
      subtitle="Edge functions, branch deploy previews, and automatic deploy hook triggers."
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

        {/* Status Card */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#00AD9F] text-white flex items-center justify-center shadow-xs">
                <NetlifyIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1B133C]">Netlify Team</h3>
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
                  Connected Team: <strong className="text-[#1B133C] font-mono">{integrations.netlify.team}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing || !connected}
                className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
                <span>Sync Sites</span>
              </button>
              <button
                onClick={handleToggle}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  connected
                    ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-[#1B133C] text-white hover:bg-black'
                }`}
              >
                {connected ? 'Disconnect' : 'Connect Netlify'}
              </button>
            </div>
          </div>
        </div>

        {/* Connected Sites */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <div>
              <h4 className="text-sm font-bold text-[#1B133C]">Configured Netlify Sites</h4>
              <p className="text-xs text-muted-foreground">Sites listening to PATCHWORK branch deployment hooks.</p>
            </div>
          </div>

          <div className="divide-y divide-black/5">
            {sites.map((site) => (
              <div key={site.name} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[#00AD9F] shrink-0" />
                  <div>
                    <span className="font-bold text-[#1B133C]">{site.name}</span>
                    <p className="text-[11px] text-teal-700 font-mono mt-0.5">{site.domain}</p>
                  </div>
                </div>

                <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Deploy Hooks Active ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
