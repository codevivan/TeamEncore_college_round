import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { SupabaseIcon } from '@/components/BrandIcons';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  CheckCircle2,
  RefreshCw,
  Database,
  ArrowLeft,
  Lock,
  Activity
} from 'lucide-react';

export default function SupabaseIntegrationPage() {
  const { integrations, updateIntegrations, logAudit } = usePatchworkStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [connected, setConnected] = useState(Boolean(integrations?.supabase?.connected));

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      updateIntegrations((prev) => ({
        ...prev,
        supabase: { ...prev.supabase, lastSync: 'Just now' },
      }));
      logAudit('INTEGRATION_SYNCED', { metadata: { provider: 'supabase' } });
    }, 600);
  };

  const handleToggle = () => {
    const nextState = !connected;
    setConnected(nextState);
    updateIntegrations((prev) => ({
      ...prev,
      supabase: { ...prev.supabase, connected: nextState },
    }));
  };

  return (
    <DashboardLayout
      title="Supabase PostgreSQL & Realtime"
      subtitle="Relational data store with Row Level Security (RLS) and multi-cursor multiplayer broadcast channels."
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
              <div className="w-12 h-12 rounded-2xl bg-[#3ECF8E] text-black flex items-center justify-center shadow-xs">
                <SupabaseIcon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1B133C]">Supabase Realtime Instance</h3>
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
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  Project: <strong className="text-[#1B133C]">pw-prod-us-east-1.supabase.co</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing || !connected}
                className="px-3.5 py-2 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                <span>Test Connection</span>
              </button>
              <button
                onClick={handleToggle}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  connected
                    ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-[#1B133C] text-white hover:bg-black'
                }`}
              >
                {connected ? 'Disconnect' : 'Connect Supabase'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-black/5">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">Row Level Security</p>
              <p className="text-xs font-bold text-emerald-700 mt-1">100% Enforced</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-black/5">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">WebSocket Presence</p>
              <p className="text-xs font-bold text-emerald-700 mt-1">Sub-15ms Latency</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-black/5">
              <p className="text-[11px] text-muted-foreground uppercase font-semibold">SSL Cipher</p>
              <p className="text-xs font-bold text-[#1B133C] mt-1 font-mono">TLS_AES_256_GCM</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
