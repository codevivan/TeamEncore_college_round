import React, { useState } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { ChromeIcon } from '@/components/BrandIcons';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Puzzle,
  Laptop,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Key,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export default function ExtensionSettingsPage() {
  const {
    extensionSessions,
    pairingCode,
    generatePairingCode,
    revokeExtensionSession,
    logAudit,
    integrations,
  } = usePatchworkStore();
  const [copied, setCopied] = useState(false);

  const areIntegrationsReady = Boolean(
    integrations?.github?.connected && integrations?.vercel?.connected
  );

  const handleCopyCode = () => {
    if (pairingCode) {
      navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardLayout
      title="Chrome Extension Settings"
      subtitle="Pair and manage visual browser editor clients connected to this workspace."
      actions={
        areIntegrationsReady ? (
          <Link
            href="/extension/connect"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Generate Pairing Token</span>
          </Link>
        ) : (
          <Link
            href="/settings/integrations"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold shadow-xs hover:bg-amber-600 transition-all"
          >
            <span>Setup Integrations First</span>
          </Link>
        )
      }
    >
      <div className="space-y-6 max-w-4xl">
        <SettingsNav currentTab="chrome extension" />

        {/* Pairing Code Card */}
        {areIntegrationsReady ? (
          <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <ChromeIcon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1B133C]">One-Click Pairing Code</h3>
                  <p className="text-xs text-muted-foreground">Enter this 6-digit pin in the AXON Chrome extension popup.</p>
                </div>
              </div>

              <button
                onClick={() => generatePairingCode()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50 shadow-2xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate Code</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-[#1B133C] text-white">
              <div className="space-y-1 text-center sm:text-left flex-1">
                <span className="text-[11px] uppercase tracking-wider text-white/60 font-medium">Active Verification Code</span>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <span className="font-mono text-3xl font-extrabold tracking-widest text-emerald-400">
                    {pairingCode || 'AX-8492'}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-white/80"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-white/70 max-w-xs text-center sm:text-right">
                Valid for 15 minutes. Automatically links your browser DOM inspector with authenticated GitHub repos.
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 md:p-8 border border-amber-200 bg-amber-50/40 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                !
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-amber-950">Integrations Required for Token Generation</h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  You must connect both <strong>GitHub</strong> and <strong>Vercel</strong> in your workspace settings before generating extension pairing tokens. This ensures the visual editor client has authorized repository and preview credentials.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/settings/integrations"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B133C] hover:bg-black text-white text-xs font-semibold transition-all shadow-xs"
              >
                <span>Go to Integrations Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Connected Browser Sessions */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div>
              <h3 className="font-bold text-base text-[#1B133C]">Active Extension Sessions ({extensionSessions.length})</h3>
              <p className="text-xs text-muted-foreground">Browsers authorized to submit visual patches to this workspace.</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
              extensionSessions.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {extensionSessions.length} Session{extensionSessions.length === 1 ? '' : 's'} Active
            </span>
          </div>

          {extensionSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-3">
              <Laptop className="w-8 h-8 mx-auto text-black/20" />
              <p>No browser extension sessions are currently connected.</p>
              <Link
                href="/extension/connect"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
              >
                <span>Pair Axon Extension</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {extensionSessions.map((session) => (
                <div key={session.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1B133C]">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1B133C]">
                          {session.deviceName || session.deviceInfo || 'Chrome Browser'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        Browser: {session.browser || 'Chrome 129'} • Last active: {session.lastActiveAt || 'Just now'} • Token: {session.tokenHash}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        revokeExtensionSession(session.id);
                        logAudit('EXTENSION_REVOKED', { metadata: { sessionId: session.id } });
                      }}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load Unpacked Installation Guide */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-4">
          <div className="flex items-center gap-2.5">
            <Puzzle className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-sm text-[#1B133C]">How to Load Axon Extension in Chrome</h4>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-xs text-[#1B133C]/80 leading-relaxed pl-1">
            <li>Open Chrome and navigate to <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[11px]">chrome://extensions</code></li>
            <li>Enable <strong>Developer mode</strong> using the toggle switch in the top-right corner.</li>
            <li>Click <strong>Load unpacked</strong> button in the top-left toolbar.</li>
            <li>Select the folder: <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[11px]">axon/extension</code> (or <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[11px]">Downloads/extension</code>).</li>
            <li>Open the Axon sidepanel by clicking the extension icon or pressing <code className="px-1.5 py-0.5 rounded bg-black/5 font-mono text-[11px]">Alt+D</code>.</li>
            <li>Click <strong>Pair with Axon</strong> and enter your 6-digit PIN to start collaborating live!</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}
