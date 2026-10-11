import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Users2,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useUser } from '@clerk/clerk-react';

export default function TeamSettingsPage() {
  const { user: clerkUser } = useUser();
  const { members, currentUser, switchUser, logAudit, projects, createProjectInvite } = usePatchworkStore();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const targetProjId = projects?.[0]?.id || 'axon-workspace';
    const res = await createProjectInvite(targetProjId, inviteRole, inviteEmail);
    if (res && res.code) {
      const fullUrl = `${window.location.origin}/invite/${res.code}`;
      setGeneratedLink(fullUrl);
      try {
        navigator.clipboard.writeText(fullUrl);
      } catch {}
    }
    setInviteSuccess(true);
    logAudit('INVITATION_SENT', { metadata: { email: inviteEmail, role: inviteRole } });
  };

  return (
    <DashboardLayout
      title="Team & Members"
      subtitle="Manage collaborators, visual editor permissions, and role-based access control."
      actions={
        <button
          onClick={() => setInviteModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Invite Member</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-4xl">
        <SettingsNav currentTab="team & members" />

        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div>
              <h3 className="font-bold text-base text-[#1B133C]">Workspace Members ({members.length})</h3>
              <p className="text-xs text-muted-foreground">Collaborators can author patches, inspect diffs, and approve deployments.</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Role-Based Access (RBAC)
            </span>
          </div>

          <div className="divide-y divide-black/5">
            {(() => {
              const uniqueMembers = members.filter((m, idx, arr) => {
                const email = m.user.email?.toLowerCase().trim();
                return arr.findIndex((x) => (email && x.user.email?.toLowerCase().trim() === email) || x.userId === m.userId) === idx;
              });

              return uniqueMembers.map((member) => {
                const isSelf = Boolean(
                  (currentUser?.id && member.userId === currentUser.id) ||
                  (currentUser?.email && member.user.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
                  (clerkUser?.primaryEmailAddress?.emailAddress && member.user.email?.toLowerCase().trim() === clerkUser.primaryEmailAddress.emailAddress.toLowerCase().trim())
                );
                const displayName = (isSelf && (clerkUser?.fullName || clerkUser?.firstName))
                  ? (clerkUser.fullName || clerkUser.firstName || '')
                  : (isSelf && currentUser?.name ? currentUser.name : member.user.name);
                const displayEmail = (isSelf && clerkUser?.primaryEmailAddress?.emailAddress)
                  ? clerkUser.primaryEmailAddress.emailAddress
                  : (isSelf && currentUser?.email ? currentUser.email : (member.user.email || ''));
                const displayAvatar = (isSelf && clerkUser?.imageUrl)
                  ? clerkUser.imageUrl
                  : (isSelf && currentUser?.avatar ? currentUser.avatar : (member.user.avatar || ''));

              return (
                <div key={member.userId} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={displayAvatar}
                      alt={displayName || 'Member Avatar'}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1B133C]">{displayName}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                            You (Clerk)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{displayEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold capitalize ${
                        member.role === 'owner'
                          ? 'bg-purple-100 text-purple-800'
                          : member.role === 'admin'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {member.role}
                    </span>

                    <button
                      onClick={() => switchUser(member.user)}
                      className="px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50 shadow-2xs"
                    >
                      Impersonate
                    </button>
                  </div>
                </div>
              );
            });
          })()}
          </div>
        </div>

        {/* Invite Dialog */}
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogContent className="sm:max-w-md glass-card border border-white/80">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-[#1B133C]">Invite Team Member</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                An invitation email will be sent with workspace access and Chrome extension pairing instructions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendInvite} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Email Address</label>
                <div className="flex items-center rounded-xl border border-black/10 bg-white px-3 py-2">
                  <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full text-xs bg-transparent focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
                >
                  <option value="developer">Developer (Can create patches, trigger previews)</option>
                  <option value="admin">Admin (Can manage repositories and approve releases)</option>
                  <option value="viewer">Viewer (Can inspect diffs and comment)</option>
                </select>
              </div>

              {inviteSuccess && (
                <div className="space-y-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Invitation generated & copied to clipboard!</span>
                  </div>
                  {generatedLink && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-[11px] font-mono text-[#1B133C] select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(generatedLink);
                          } catch {}
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-[11px] hover:bg-emerald-800 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInviteModalOpen(false);
                    setInviteSuccess(false);
                    setGeneratedLink('');
                    setInviteEmail('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1B133C] hover:bg-black/5"
                >
                  {inviteSuccess ? 'Done' : 'Cancel'}
                </button>
                {!inviteSuccess && (
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black shadow-xs"
                  >
                    Send Invitation
                  </button>
                )}
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
