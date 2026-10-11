import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Building2,
  Check,
  Save,
  Globe,
  CreditCard,
  ShieldAlert,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export default function WorkspaceSettingsPage() {
  const { workspace, updateWorkspace, logAudit } = usePatchworkStore();
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspace({ name, slug });
    setSaved(true);
    logAudit('WORKSPACE_UPDATED', { metadata: { name, slug } });
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout
      title="Workspace Settings"
      subtitle="Manage your organization profile, default project settings, and billing tier."
    >
      <div className="space-y-6 max-w-4xl">
        <SettingsNav currentTab="workspace" />

        {/* General Details Card */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1B133C] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                {name.substring(0, 1)}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1B133C]">General Profile</h3>
                <p className="text-xs text-muted-foreground">This name is visible to your team and in Git commits.</p>
              </div>
            </div>
            {saved && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved successfully
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Workspace Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B133C]/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Workspace URL Slug</label>
                <div className="flex items-center rounded-xl border border-black/10 bg-white/90 overflow-hidden focus-within:ring-2 focus-within:ring-[#1B133C]/20">
                  <span className="px-3 text-xs text-muted-foreground bg-black/[0.02] border-r border-black/5 py-2.5">
                    axon.dev/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Plan & Subscription Card */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#1B133C]">Active Plan</h3>
                <p className="text-xs text-muted-foreground">Current tier: <strong className="text-[#1B133C]">{workspace.plan} Tier</strong></p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Active Subscription
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/60 border border-black/5 space-y-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Visual Patches</p>
              <p className="text-xl font-bold text-[#1B133C]">Unlimited</p>
              <p className="text-[11px] text-muted-foreground">Automated AST verification included</p>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-black/5 space-y-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Seats Included</p>
              <p className="text-xl font-bold text-[#1B133C]">Up to 15 Members</p>
              <p className="text-[11px] text-muted-foreground">Realtime multi-cursor collaboration</p>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-black/5 space-y-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Deploy Speed</p>
              <p className="text-xl font-bold text-[#1B133C]">Sub-second</p>
              <p className="text-[11px] text-muted-foreground">Native Vercel & Netlify webhooks</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h4 className="font-bold text-sm">Danger Zone</h4>
          </div>
          <p className="text-xs text-rose-700/90 leading-relaxed">
            Deleting this workspace will immediately revoke access to all connected GitHub repositories, remove preview branches, and invalidate paired Chrome extensions.
          </p>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => alert('Demo Workspace deletion is protected in this sandbox.')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Workspace</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
