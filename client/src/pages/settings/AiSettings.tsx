import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Sparkles,
  Bot,
  Save,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
  Cpu
} from 'lucide-react';

export default function AiSettingsPage() {
  const { integrations, updateIntegrations, logAudit } = usePatchworkStore();
  const [provider, setProvider] = useState(integrations?.ai?.provider || 'gemini');
  const [model, setModel] = useState(integrations?.ai?.model || 'gemini-1.5-pro');
  const [allowFrontend, setAllowFrontend] = useState(integrations?.ai?.allowFrontendModifications ?? true);
  const [allowBackend, setAllowBackend] = useState(integrations?.ai?.allowBackendModifications ?? false);
  const [requireHighRiskApproval, setRequireHighRiskApproval] = useState(integrations?.ai?.requireApprovalForHighRisk ?? true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateIntegrations((p) => ({
      ...p,
      ai: {
        ...p.ai,
        provider,
        model,
        allowFrontendModifications: allowFrontend,
        allowBackendModifications: allowBackend,
        requireApprovalForHighRisk: requireHighRiskApproval,
      },
    }));
    setSaved(true);
    logAudit('INTEGRATION_SYNCED', { metadata: { provider: 'ai', model } });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout
      title="AI Guardrails & Model Settings"
      subtitle="Configure AST translation models, patch generation prompts, and autonomous safety boundaries."
    >
      <div className="space-y-6 max-w-4xl">
        <SettingsNav currentTab="ai guardrails" />

        <form onSubmit={handleSave} className="space-y-6">
          {/* Model Card */}
          <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1B133C]">AST Synthesis Model</h3>
                  <p className="text-xs text-muted-foreground">The reasoning engine that transforms visual DOM manipulations into clean JSX diffs.</p>
                </div>
              </div>
              {saved && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Model Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white/90 text-sm focus:outline-none"
                >
                  <option value="anthropic">Anthropic (Claude 3.5 Sonnet) - Recommended</option>
                  <option value="openai">OpenAI (GPT-4o)</option>
                  <option value="deepseek">DeepSeek (DeepSeek V3 / R1)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Model Checkpoint</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white/90 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Safety Guardrails Card */}
          <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-black/5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1B133C]">Autonomous Safety Boundaries</h3>
                <p className="text-xs text-muted-foreground">Hard rules enforced before any patch diff can be committed to GitHub.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-black/5 bg-white/60 hover:bg-white cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={allowFrontend}
                  onChange={(e) => setAllowFrontend(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-[#1B133C]">Allow Frontend & Style Modifications</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Permit AI to update Tailwind classes, CSS modules, JSX text, and visual component props.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-black/5 bg-white/60 hover:bg-white cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={allowBackend}
                  onChange={(e) => setAllowBackend(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-[#1B133C]">Allow API & Route Handler Modifications</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Permit AI to touch API endpoints or data-fetching logic (Requires 2 peer approvals).
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-black/5 bg-white/60 hover:bg-white cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={requireHighRiskApproval}
                  onChange={(e) => setRequireHighRiskApproval(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-xs font-bold text-[#1B133C]">Require Mandatory Human Sign-off for High-Risk Files</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Locks down auth routes, package.json dependencies, and database migrations from auto-deploy.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Guardrail Rules</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
