import React, { useState } from 'react';
import { usePatchworkStore } from '@/lib/patchworkStore';
import { AxonLogo, AxonIcon } from './PatchworkLogo';
import { Building2, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

interface WorkspaceSetupModalProps {
  forceOpen?: boolean;
}

export function WorkspaceSetupModal({ forceOpen = false }: WorkspaceSetupModalProps) {
  const { user: clerkUser } = useUser();
  const { workspace, updateWorkspace, logAudit, currentUser } = usePatchworkStore();
  
  // Checks both store setupCompleted flag and browser localStorage
  const isSetupDone = Boolean(
    workspace?.setupCompleted ||
    (typeof window !== 'undefined' && localStorage.getItem('axon_workspace_setup_done') === 'true')
  );

  const [isOpen, setIsOpen] = useState(!isSetupDone || forceOpen);
  const [name, setName] = useState(workspace?.name === 'Axon Production Workspace' ? '' : workspace?.name || '');
  const [slug, setSlug] = useState(workspace?.slug === 'axon-prod' ? '' : workspace?.slug || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already completed and not forced, don't show
  if (!isOpen && !forceOpen) {
    return null;
  }

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'My Production Workspace';
    const finalSlug = slug.trim() || finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    setIsSubmitting(true);
    try {
      // 1. Mark as permanently completed in browser storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('axon_workspace_setup_done', 'true');
      }

      // 2. Update in local store
      updateWorkspace({
        name: finalName,
        slug: finalSlug,
        setupCompleted: true,
      });

      // 3. Persist to server
      try {
        await fetch('/api/workspace', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: finalName,
            slug: finalSlug,
            setupCompleted: true,
          }),
        });
      } catch (err) {
        console.warn('Workspace server sync notice:', err);
      }

      logAudit('WORKSPACE_UPDATED', { metadata: { name: finalName, slug: finalSlug, source: 'onboarding_modal' } });
      toast.success(`Workspace "${finalName}" created successfully! Welcome to AXON.`);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to initialize workspace. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Subtle accent glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-[#1B133C] to-purple-500" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#1B133C] text-white flex items-center justify-center shadow-sm">
                <AxonIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-xl text-[#1B133C] tracking-tight">AXON</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              First Time Setup
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1B133C]">
              Create your Workspace
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Welcome, <strong className="text-[#1B133C]">{clerkUser?.fullName || clerkUser?.firstName || currentUser?.name || 'Developer'}</strong>! Name your organization workspace to unlock the visual patch control plane and start hotfixing projects.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1B133C]">
                Workspace Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Studio, Nova Labs, My Team"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 bg-slate-50/50 hover:bg-white text-xs sm:text-sm text-[#1B133C] placeholder:text-muted-foreground/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                This workspace organizes your visual patches, team members, and deployments.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1B133C]">
                Workspace Slug URL
              </label>
              <div className="flex items-center rounded-xl border border-black/15 bg-slate-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <span className="px-3 text-xs text-muted-foreground bg-black/[0.03] border-r border-black/10 py-2.5 font-mono select-none">
                  axon.dev/
                </span>
                <input
                  type="text"
                  required
                  placeholder="my-workspace"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full px-3 py-2 text-xs sm:text-sm text-[#1B133C] bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Security guarantee */}
            <div className="p-3.5 rounded-2xl bg-black/[0.02] border border-black/5 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-snug">
                Authenticated via Clerk Enterprise SSO • Zero sample projects will be created, giving you a clean slate.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="w-full py-3 px-4 rounded-xl bg-[#1B133C] hover:bg-black text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isSubmitting ? 'Creating Workspace...' : 'Create Workspace & Launch Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
