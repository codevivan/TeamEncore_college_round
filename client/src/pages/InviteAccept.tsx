import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import {
  FolderGit2,
  CheckCircle2,
  XCircle,
  Users,
  Shield,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { usePatchworkStore } from '@/lib/patchworkStore';
import { toast } from 'sonner';

interface InviteDetails {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail?: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface ProjectPreview {
  id: string;
  name: string;
  framework?: string;
  repositoryName?: string;
  productionUrl?: string;
  ownerName?: string;
  ownerEmail?: string;
}

export default function InviteAcceptPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/invite/:code');
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const { acceptProjectInvite, declineProjectInvite, currentUser } = usePatchworkStore();

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [project, setProject] = useState<ProjectPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusState, setStatusState] = useState<'pending' | 'accepted' | 'declined'>('pending');

  // Extract invite code from URL path or query params
  const inviteCode =
    params?.code ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('code')
      : null);

  useEffect(() => {
    const code = inviteCode;
    if (!code) {
      setErrorMessage('No invitation code provided.');
      setIsLoading(false);
      return;
    }

    async function fetchInvite() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch(`/api/invites/${encodeURIComponent(String(code))}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setInvite(json.invite);
          setProject(json.project);
          setStatusState(json.invite.status);
        } else {
          setErrorMessage(json.error || 'Invitation not found or has expired.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to load invitation.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvite();
  }, [inviteCode]);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const handleAccept = async (overrideUser?: { name?: string; email?: string }) => {
    if (!inviteCode) return;
    setIsProcessing(true);
    try {
      const gName = overrideUser?.name?.trim() || guestName.trim();
      const gEmail = overrideUser?.email?.trim() || guestEmail.trim();

      const activeUser = clerkUser
        ? {
            id: clerkUser.id,
            name:
              clerkUser.fullName ||
              [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
              clerkUser.username ||
              'Collaborator',
            email:
              clerkUser.primaryEmailAddress?.emailAddress ||
              clerkUser.emailAddresses?.[0]?.emailAddress ||
              '',
            avatar: clerkUser.imageUrl,
          }
        : gName || gEmail
        ? {
            id: `usr-${Date.now()}`,
            name: gName || (gEmail ? gEmail.split('@')[0] : 'Teammate'),
            email: gEmail || 'friend@axon.dev',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(gName || 'Teammate')}`,
          }
        : currentUser
        ? {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            avatar: currentUser.avatar,
          }
        : {
            id: `usr-${Date.now()}`,
            name: 'Teammate',
            email: 'teammate@axon.dev',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Teammate`,
          };

      const res = await acceptProjectInvite(inviteCode, activeUser);
      if (res.success) {
        setStatusState('accepted');
        toast.success(`Welcome to ${project?.name || 'the project'}!`, {
          description: 'You are now an authorized collaborator. Opening Multiplayer Space...',
        });
        setTimeout(() => {
          setLocation('/collaboration');
        }, 1200);
      } else {
        toast.error('Could not accept invitation', {
          description: res.error || 'Please try again.',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!inviteCode) return;
    setIsProcessing(true);
    try {
      const ok = await declineProjectInvite(inviteCode);
      if (ok) {
        setStatusState('declined');
        toast.info('Invitation declined', {
          description: 'You will not be added to this project.',
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const activeEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    currentUser?.email ||
    '';

  const activeName =
    clerkUser?.fullName ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
    clerkUser?.username ||
    currentUser?.name ||
    'Developer';

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] flex flex-col justify-between antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-black/5 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <PatchworkLogo size="md" />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Project Access & Collaboration Invitation
        </div>
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Loading State */}
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#1B133C]">Loading invitation details...</p>
            </div>
          ) : errorMessage ? (
            /* Error State */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1B133C]">Invitation Not Found</h2>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {errorMessage}
                </p>
              </div>
              <button
                onClick={() => setLocation('/')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black transition-colors"
              >
                Go to Home
              </button>
            </div>
          ) : statusState === 'accepted' ? (
            /* Accepted State */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 mb-2">
                  <Sparkles className="w-3 h-3" /> Invitation Accepted
                </span>
                <h2 className="text-xl font-bold text-[#1B133C]">
                  You have joined {project?.name}!
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  You now have collaborative access to this repository and live deployment workspace.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setLocation('/dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md hover:bg-indigo-700 transition-colors"
                >
                  Enter Workspace Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : statusState === 'declined' ? (
            /* Declined State */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1B133C]">Invitation Declined</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  You have declined access to {project?.name}. You can close this tab or return home.
                </p>
              </div>
              <button
                onClick={() => setLocation('/')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-black/5 transition-colors"
              >
                Return to Home
              </button>
            </div>
          ) : (
            /* Pending Invitation View */
            <div className="space-y-6">
              {/* Header Badge & Title */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs">
                  <Users className="w-3.5 h-3.5" /> Project Collaboration Invitation
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1B133C]">
                  Join <span className="text-indigo-600">{project?.name}</span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-[#1B133C]">{invite?.inviterName}</span>{' '}
                  ({invite?.inviterEmail}) invited you to collaborate on Axon Studio.
                </p>
              </div>

              {/* Project Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-black/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-black/10 flex items-center justify-center text-indigo-600 shadow-2xs">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1B133C]">{project?.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {project?.framework || 'Next.js App'}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-black/10 text-indigo-600 uppercase tracking-wider font-mono">
                    {invite?.role || 'Developer'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {project?.repositoryName && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Repository</span>
                      <span className="font-mono text-[#1B133C] font-semibold">
                        {project.repositoryName}
                      </span>
                    </div>
                  )}
                  {project?.productionUrl && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Live Site</span>
                      <a
                        href={project.productionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-medium inline-flex items-center gap-1 hover:underline truncate max-w-[200px]"
                      >
                        {project.productionUrl} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Role Granted</span>
                    <span className="capitalize font-semibold text-[#1B133C]">
                      {invite?.role || 'Developer'} (Full Studio & Visual Editing)
                    </span>
                  </div>
                </div>
              </div>

              {/* Auth Context & Actions */}
              {isLoaded && !isSignedIn ? (
                /* Unauthenticated View -> Instant Join Option + Clerk Sign In Option */
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-950 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Instant Join as Team Collaborator
                    </div>
                    <p className="text-xs text-indigo-800">
                      Enter your name to join <strong>{project?.name}</strong> immediately, or sign in below with your existing account.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Your Name (e.g. Alex, Sam)"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs text-[#1B133C] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                      <input
                        type="email"
                        placeholder="Your Email (optional)"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs text-[#1B133C] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAccept()}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Joining Project...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Join Project Directly (1-Click)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span>Have an Axon / Clerk account?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setLocation(
                            `/login?redirect_url=${encodeURIComponent(`/invite/${inviteCode}`)}`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-black/5 transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() =>
                          setLocation(
                            `/signup?redirect_url=${encodeURIComponent(`/invite/${inviteCode}`)}`
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#1B133C] text-white text-xs font-semibold hover:bg-black transition-colors"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Authenticated View -> Accept or Decline */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-100/80 border border-black/5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Accepting invitation as:</span>
                    <span className="font-semibold text-[#1B133C] truncate max-w-[220px]">
                      {activeName} ({activeEmail})
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAccept()}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Joining Project...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Invitation</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleDecline}
                      className="py-3 px-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground">
        Powered by Axon Studio Platform • Realtime Visual Code Collaboration
      </footer>
    </div>
  );
}
