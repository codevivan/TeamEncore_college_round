import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Users,
  Chrome,
  UserPlus,
  Trash2,
  Laptop,
  Send,
  X,
  Copy,
  Check,
  FolderGit2,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';
import { Link } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

export default function CollaborationPage() {
  const { user: clerkUser } = useUser();
  const {
    currentUser,
    presence,
    activeProjectId,
    projects,
    createProjectInvite,
    removeProjectCollaborator,
    extensionSessions,
    syncPresence,
    fetchProjectCollaborators,
  } = usePatchworkStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'developer' | 'designer' | 'qa' | 'admin' | 'viewer'>('developer');
  const [inviteColor, setInviteColor] = useState('#6366F1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Instant shareable link state
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Continuous real-time multiplayer heartbeat & collaborator sync
  useEffect(() => {
    syncPresence();
    if (activeProject?.id) {
      fetchProjectCollaborators(activeProject.id);
    }

    const interval = setInterval(() => {
      syncPresence();
      if (activeProject?.id) {
        fetchProjectCollaborators(activeProject.id);
      }
    }, 600);

    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window !== 'undefined') {
        (window as any).__axon_cursorX = Math.round((e.clientX / window.innerWidth) * 100);
        (window as any).__axon_cursorY = Math.round((e.clientY / window.innerHeight) * 100);
        (window as any).__axon_pageX = e.pageX;
        (window as any).__axon_pageY = e.pageY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (typeof window !== 'undefined') {
        (window as any).__axon_isClicking = true;
        (window as any).__axon_lastClickTime = Date.now();
        syncPresence();
      }
    };

    const handleMouseUp = () => {
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          (window as any).__axon_isClicking = false;
        }, 400);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeProject?.id]);

  // Derive project-scoped collaborators (guarantees both owner and invited teammates are always shown)
  const projectCollaborators = React.useMemo(() => {
    if (!activeProject) return [];
    const list = Array.isArray(activeProject.collaborators) ? [...activeProject.collaborators] : [];

    const ownerName = activeProject.ownerName || currentUser?.name || 'Owner';
    const ownerEmail = activeProject.ownerEmail || currentUser?.email || '';
    const ownerId = activeProject.ownerId || currentUser?.id || 'usr-owner';
    const ownerAvatar =
      currentUser?.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(ownerName)}`;

    const hasOwner = list.some(
      (c) => (ownerId && c.userId === ownerId) || (ownerEmail && c.user?.email?.toLowerCase() === ownerEmail.toLowerCase())
    );

    if (!hasOwner) {
      list.unshift({
        id: `collab-owner-${activeProject.id}`,
        projectId: activeProject.id,
        userId: ownerId,
        user: {
          id: ownerId,
          name: ownerName,
          email: ownerEmail,
          avatar: ownerAvatar,
          role: 'owner' as const,
          cursorColor: '#6366F1',
          timezone: 'UTC',
        },
        role: 'owner' as const,
        joinedAt: activeProject.createdAt,
      });
    }

    // Deduplicate by email or userId
    return list.filter((c, idx, arr) => {
      const email = c.user?.email?.toLowerCase().trim();
      return (
        arr.findIndex(
          (x) =>
            (email && x.user?.email?.toLowerCase().trim() === email) ||
            x.userId === c.userId
        ) === idx
      );
    });
  }, [activeProject, currentUser]);

  // Project-scoped online presence
  const projectPresence = React.useMemo(() => {
    if (!activeProject) return [];
    return presence.filter(
      (p) => !p.currentProject || p.currentProject === activeProject.id
    );
  }, [presence, activeProject]);

  // Generate or regenerate shareable invite link
  const handleGenerateLink = async () => {
    const targetProjId = activeProject?.id || (projects.length > 0 ? projects[0].id : 'axon-workspace');
    setIsGeneratingLink(true);
    try {
      const res = await createProjectInvite(targetProjId, inviteRole);
      if (res && res.code) {
        const fullUrl = `${window.location.origin}/invite/${res.code}`;
        setGeneratedInviteUrl(fullUrl);
      }
    } catch (err) {
      console.error('Error creating invite link:', err);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  useEffect(() => {
    if (isInviteOpen && !generatedInviteUrl) {
      handleGenerateLink();
    }
  }, [isInviteOpen, activeProject]);

  const handleCopyLink = () => {
    if (!generatedInviteUrl) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(generatedInviteUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = generatedInviteUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch (err) {
      console.warn('Clipboard write fallback error:', err);
    }
    setIsCopied(true);
    toast.success('Shareable Invite Link Copied!', {
      description: 'Send this link to your friends. They can open it directly to accept or decline.',
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !inviteEmail.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await createProjectInvite(
        activeProject.id,
        inviteRole,
        inviteEmail.trim()
      );
      if (res) {
        const fullUrl = `${window.location.origin}/invite/${res.code}`;
        setGeneratedInviteUrl(fullUrl);
        navigator.clipboard.writeText(fullUrl);
        toast.success(`Invitation created for ${inviteEmail.trim()}!`, {
          description: 'Invite link copied to clipboard. Share it with your friend!',
        });
      }
      setInviteName('');
      setInviteEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const COLOR_PALETTE = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

  return (
    <DashboardLayout
      title="Multiplayer & Collaboration"
      subtitle={
        activeProject
          ? `Team presence and collaborators for ${activeProject.name}`
          : 'Multiplayer presence, live cursor identities, and active route synchronization.'
      }
    >
      <div className="space-y-6">
        {/* TOP CONTROLS & STATUS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-black/5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              {projectCollaborators.slice(0, 5).map((m) => {
                const isSelf = Boolean(
                  (currentUser?.id && m.userId === currentUser.id) ||
                  (currentUser?.email && m.user?.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
                  (clerkUser?.primaryEmailAddress?.emailAddress &&
                    m.user?.email?.toLowerCase() === clerkUser.primaryEmailAddress.emailAddress.toLowerCase())
                );
                return (
                  <img
                    key={m.id}
                    src={isSelf && clerkUser?.imageUrl ? clerkUser.imageUrl : m.user?.avatar}
                    alt={m.user?.name || 'Collaborator'}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  />
                );
              })}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B133C] flex items-center gap-1.5">
                <span>{projectCollaborators.length} {projectCollaborators.length === 1 ? 'Collaborator' : 'Collaborators'}</span>
                {activeProject && (
                  <span className="text-xs font-normal text-muted-foreground">
                    on <strong className="text-indigo-600 font-semibold">{activeProject.name}</strong>
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {projectPresence.length > 0
                  ? `${projectPresence.length} active live in project right now`
                  : '1 active live in project right now'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/extension-connect"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-black/5 hover:bg-black/10 text-xs font-semibold text-[#1B133C] transition-colors"
            >
              <Chrome className="w-3.5 h-3.5 text-indigo-600" />
              Pair Extension
            </Link>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Teammate to Project
            </button>
          </div>
        </div>

        {/* TEAM MEMBERS & PRESENCE ROSTER */}
        <div className="glass-card p-6 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <div>
              <h3 className="text-base font-bold text-[#1B133C] flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Project Collaborators & Access Control
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Only invited collaborators who accept can see and modify {activeProject?.name || 'this project'}.
              </p>
            </div>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              + Invite Teammate
            </button>
          </div>

          <div className="divide-y divide-black/5 space-y-3">
            {projectCollaborators.map((m) => {
              const isSelf = Boolean(
                (currentUser?.id && m.userId === currentUser.id) ||
                (currentUser?.email && m.user?.email?.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
                (clerkUser?.primaryEmailAddress?.emailAddress &&
                  m.user?.email?.toLowerCase().trim() === clerkUser.primaryEmailAddress.emailAddress.toLowerCase().trim())
              );
              const displayName =
                isSelf && (clerkUser?.fullName || clerkUser?.firstName)
                  ? clerkUser.fullName || clerkUser.firstName || ''
                  : isSelf && currentUser?.name
                  ? currentUser.name
                  : m.user?.name || 'Collaborator';
              const displayEmail =
                isSelf && clerkUser?.primaryEmailAddress?.emailAddress
                  ? clerkUser.primaryEmailAddress.emailAddress
                  : isSelf && currentUser?.email
                  ? currentUser.email
                  : m.user?.email || '';
              const displayAvatar =
                isSelf && clerkUser?.imageUrl
                  ? clerkUser.imageUrl
                  : isSelf && currentUser?.avatar
                  ? currentUser.avatar
                  : m.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
              const isOnline = projectPresence.some((p) => p.userId === m.userId) || isSelf;
              const onlinePresence = projectPresence.find((p) => p.userId === m.userId);

              return (
                <div
                  key={m.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[#1B133C]">{displayName}</p>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.user?.cursorColor || '#6366F1' }}
                          title={`Cursor color: ${m.user?.cursorColor || '#6366F1'}`}
                        />
                        {isSelf && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                            You
                          </span>
                        )}
                        {m.role === 'owner' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{displayEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {onlinePresence && (
                      <div className="px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono">
                        Live Route: {onlinePresence.currentRoute}
                      </div>
                    )}

                    <span className="px-2.5 py-1 rounded-lg border border-black/10 bg-white text-xs font-semibold text-[#1B133C] capitalize">
                      {m.role}
                    </span>

                    {m.role !== 'owner' && m.userId !== currentUser?.id && activeProject && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${displayName} from ${activeProject.name}?`)) {
                            removeProjectCollaborator(activeProject.id, m.userId);
                            toast.success(`Removed ${displayName} from project`);
                          }
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove collaborator from project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONNECTED EXTENSION SESSIONS */}
        <div className="glass-card p-6 border border-white/80 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 text-indigo-600" />
              Paired Extension Clients ({extensionSessions.length})
            </span>
            <Link
              href="/settings/extension"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage Tokens →
            </Link>
          </div>

          {extensionSessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">
                No active Chrome extension paired yet.
              </p>
              <Link
                href="/extension-connect"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 text-xs font-semibold hover:bg-indigo-100 transition-colors"
              >
                <Chrome className="w-3.5 h-3.5" />
                Pair Your Extension Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {extensionSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl bg-white border border-black/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Chrome className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-xs font-bold text-[#1B133C]">{sess.deviceName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        Active {sess.lastActiveAt}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🟢 Authorized
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INVITE TEAMMATE MODAL WITH SHAREABLE LINK & ACCEPT/REJECT WORKFLOW */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-black/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-black/5 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B133C]">
                    Invite Teammate to {activeProject?.name || 'Project'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Provide a direct link or send an email invitation with Accept / Reject options
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* SECTION 1: INSTANT SHAREABLE INVITE LINK */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B133C] flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
                    Direct Shareable Invite Link
                  </span>
                  <button
                    type="button"
                    disabled={isGeneratingLink}
                    onClick={handleGenerateLink}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {isGeneratingLink ? 'Generating...' : 'Generate New Link'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your teammate can directly open this link to view project details and click <strong>Accept</strong> or <strong>Reject</strong>.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteUrl || (isGeneratingLink ? 'Generating link...' : 'Click "Generate New Link"')}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-black/10 text-xs font-mono text-[#1B133C] select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!generatedInviteUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 2: EMAIL INVITE FORM */}
              <form onSubmit={handleInviteSubmit} className="space-y-4 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-black/5" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Or Invite by Email
                  </span>
                  <div className="h-px flex-1 bg-black/5" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B133C] mb-1">
                    Teammate's Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="friend@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1B133C] mb-1">Role in Project</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    >
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="qa">QA Engineer</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B133C] mb-1">Multiplayer Cursor Color</label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setInviteColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            inviteColor === c
                              ? 'ring-2 ring-offset-2 ring-black scale-110'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-3 py-2 rounded-lg border border-black/10 text-xs font-semibold text-muted-foreground hover:bg-black/5 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !inviteEmail.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Creating Invite...' : 'Send & Copy Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* LIVE MULTIPLAYER CURSOR CANVAS */}
      <MultiplayerCursorCanvas
        presence={projectPresence}
        currentUserId={currentUser?.id}
      />
    </DashboardLayout>
  );
}

function MultiplayerCursorCanvas({
  presence,
  currentUserId,
}: {
  presence: any[];
  currentUserId?: string;
}) {
  const otherTeammates = presence.filter((p) => p.userId && p.userId !== currentUserId);

  if (otherTeammates.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {otherTeammates.map((t) => {
        const xPercent = typeof t.cursorX === 'number' ? t.cursorX : 50;
        const yPercent = typeof t.cursorY === 'number' ? t.cursorY : 50;
        const color = t.cursorColor || '#EC4899';
        const isClicking = Boolean(t.isClicking);

        return (
          <div
            key={t.userId}
            style={{
              position: 'absolute',
              left: `${xPercent}%`,
              top: `${yPercent}%`,
              transform: 'translate3d(-2px, -2px, 0)',
              transition: 'left 0.08s linear, top 0.08s linear',
            }}
            className="flex flex-col items-start"
          >
            {/* SVG Pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={color}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="drop-shadow-md select-none"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" />
            </svg>

            {/* Click Ripple Ring */}
            {isClicking && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '-6px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${color}`,
                  animation: 'ping 0.8s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
            )}

            {/* Teammate Name Tag */}
            <div
              style={{
                backgroundColor: color,
                marginLeft: '12px',
                marginTop: '-4px',
              }}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-lg border border-white/40 whitespace-nowrap"
            >
              <span>{t.name || 'Teammate'}</span>
              {t.role && (
                <span className="opacity-80 text-[8px] font-normal uppercase">
                  ({t.role})
                </span>
              )}
            </div>

            {/* Selected DOM Element Badge if available */}
            {t.selectedElement && (
              <div
                style={{
                  backgroundColor: 'rgba(27, 19, 60, 0.85)',
                  borderColor: color,
                  marginLeft: '12px',
                  marginTop: '2px',
                }}
                className="px-1.5 py-0.5 rounded text-[9px] font-mono text-white border shadow-xs"
              >
                Target: {t.selectedElement}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
