import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import { useUser } from '@clerk/clerk-react';
import { GitHubIcon, VercelIcon, NetlifyIcon } from '@/components/BrandIcons';
import {
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Plus,
  GitPullRequest,
  AlertCircle,
  ArrowUpRight,
  GitBranch,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function ProjectsPage() {
  const { user: clerkUser } = useUser();
  const { projects, createProject, verifyProjectOwnership, patches, integrations, currentUser, fetchInitialState } = usePatchworkStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    const userId = clerkUser?.id || currentUser?.id || currentUser?.clerkId;
    const email = clerkUser?.primaryEmailAddress?.emailAddress || currentUser?.email;
    fetchInitialState(userId, email);
  }, [clerkUser?.id, clerkUser?.primaryEmailAddress?.emailAddress]);

  // Detect connected GitHub account from Clerk or store or localStorage (strictly per-user)
  const clerkGithub = clerkUser?.externalAccounts?.find(
    (acc: any) =>
      acc.provider === 'github' ||
      acc.provider === 'oauth_github' ||
      acc.providerSlug === 'github' ||
      (typeof acc.provider === 'string' && acc.provider.toLowerCase().includes('github'))
  );

  const detectedUsername =
    (clerkGithub as any)?.username ||
    (clerkGithub as any)?.label ||
    (clerkGithub as any)?.externalUsername ||
    (clerkUser?.username && !clerkUser.username.includes('@') ? clerkUser.username : '') ||
    currentUser?.githubUsername ||
    (typeof window !== 'undefined' ? localStorage.getItem('axon_github_username') || '' : '') ||
    '';

  const [activeGithubUsername, setActiveGithubUsername] = useState<string>(detectedUsername);
  const [manualGithubInput, setManualGithubInput] = useState<string>('');
  const [isChangingAccount, setIsChangingAccount] = useState<boolean>(false);

  const [reposList, setReposList] = useState<Array<{ name: string; fullName: string; defaultBranch: string; htmlUrl: string; homepage?: string }>>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);

  const [manualRepoMode, setManualRepoMode] = useState<boolean>(false);

  // Keep active username in sync if Clerk loads later
  useEffect(() => {
    if (detectedUsername && !activeGithubUsername) {
      setActiveGithubUsername(detectedUsername.replace(/^@+/, '').trim());
    }
  }, [detectedUsername, activeGithubUsername]);

  const loadRepos = (usernameToFetch?: string) => {
    const cleanUser = usernameToFetch ? usernameToFetch.replace(/^@+/, '').trim() : '';
    setLoadingRepos(true);
    setReposError(null);
    const userId = clerkUser?.id || currentUser?.id || currentUser?.clerkId || '';
    const userEmail = clerkUser?.primaryEmailAddress?.emailAddress || currentUser?.email || '';

    const query = new URLSearchParams();
    if (cleanUser) query.set('username', cleanUser);
    if (userId) query.set('userId', userId);
    if (userEmail) query.set('email', userEmail);

    fetch(`/api/github/repos?${query.toString()}`, {
      headers: {
        ...(userId ? { 'x-user-id': userId } : {}),
        ...(userEmail ? { 'x-user-email': userEmail } : {}),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setActiveGithubUsername(data.username);
          if (typeof window !== 'undefined') {
            localStorage.setItem('axon_github_username', data.username);
          }
        }
        if (data.success && Array.isArray(data.repositories) && data.repositories.length > 0) {
          setReposList(data.repositories);
          setManualRepoMode(false);
        } else {
          setReposList(data.repositories || []);
          if (data.message && (!data.repositories || data.repositories.length === 0)) {
            setReposError(data.message);
          }
          if (!repoName) {
            setManualRepoMode(true);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load GitHub repos:', err);
        setReposError('Could not auto-fetch GitHub repos. You can enter your repository name below.');
        setManualRepoMode(true);
      })
      .finally(() => setLoadingRepos(false));
  };

  useEffect(() => {
    if (createModalOpen) {
      loadRepos(activeGithubUsername || detectedUsername);
    }
  }, [createModalOpen]);

  const handleApplyCustomUsername = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = manualGithubInput.replace(/^@+/, '').trim();
    if (!trimmed) return;
    setActiveGithubUsername(trimmed);
    setIsChangingAccount(false);
    loadRepos(trimmed);
  };

  // New Project Form
  const [name, setName] = useState('');
  const [repoName, setRepoName] = useState('');
  const [framework, setFramework] = useState<'Next.js' | 'React (Vite)'>('Next.js');
  const [provider, setProvider] = useState<'vercel' | 'netlify'>('vercel');
  const [productionUrl, setProductionUrl] = useState('');

  const handleRepoSelect = (selectedFullName: string) => {
    setRepoName(selectedFullName);
    const selected = reposList.find((r) => r.fullName === selectedFullName);
    const short = selected ? selected.name : (selectedFullName.includes('/') ? selectedFullName.split('/')[1] : selectedFullName);
    const cleanName = short
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    setName(cleanName);

    // Autofetch production URL if repository has a homepage configured
    if (selected?.homepage && (selected.homepage.startsWith('http://') || selected.homepage.startsWith('https://'))) {
      setProductionUrl(selected.homepage);
    } else {
      // Empty so user can type manually
      setProductionUrl('');
    }

    if (short.toLowerCase().includes('vite') || short.toLowerCase().includes('react')) {
      setFramework('React (Vite)');
    } else {
      setFramework('Next.js');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !repoName) return;
    createProject({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      productionUrl,
      framework,
      repositoryId: `repo-${Date.now()}`,
      repositoryName: repoName,
      repositoryUrl: `https://github.com/${repoName}`,
      deploymentProvider: provider,
      deploymentProjectId: `deploy_${Date.now()}`,
      defaultBranch: 'main',
      status: 'production_healthy',
      ownershipStatus: 'verified',
    });
    setCreateModalOpen(false);
    setName('');
    setRepoName('');
  };

  return (
    <DashboardLayout
      title="Projects"
      subtitle="Connected web repositories, deployment pipelines, and live domain environments."
      actions={
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-6xl">
        {projects.length === 0 ? (
          <div className="glass-card p-12 text-center border border-white/80 space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1B133C]">No Projects Connected</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Connect your web repository to start staging visual hotfixes and multiplayer team reviews.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Project</span>
              </button>
            </div>
          </div>
        ) : (
          /* Project Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const projectPatches = patches.filter((p) => p.projectId === project.id);
              const isVercel = project.deploymentProvider.toLowerCase() === 'vercel';

              return (
                <div
                  key={project.id}
                  className="glass-card p-6 border border-white/80 flex flex-col justify-between hover:shadow-lg transition-all space-y-5"
                >
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-[#1B133C]">{project.name}</h3>
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#1B133C] mt-1"
                      >
                        <GitHubIcon size={14} className="text-black/80" />
                        <span className="font-mono">{project.repositoryName}</span>
                      </a>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                        project.ownershipStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {project.ownershipStatus === 'verified' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-black/5 font-medium text-[#1B133C]">
                      {project.framework}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/5 font-medium text-[#1B133C] inline-flex items-center gap-1.5 capitalize">
                      {isVercel ? <VercelIcon size={11} /> : <NetlifyIcon size={11} />}
                      <span>{project.deploymentProvider}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/5 font-mono text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                      <GitBranch className="w-3 h-3" />
                      <span>{project.defaultBranch}</span>
                    </span>
                  </div>

                  {/* Production URL */}
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Production:</span>
                    <a
                      href={project.productionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-indigo-600 hover:underline inline-flex items-center gap-1 truncate max-w-[190px]"
                    >
                      <span>{project.productionUrl.replace('https://', '')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Patch count */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>Active Patches:</span>
                    <span className="font-bold text-[#1B133C]">{projectPatches.length} patches</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex-1 py-2 px-3 rounded-xl border border-black/10 bg-white hover:bg-black/5 font-semibold text-center text-xs text-[#1B133C] transition-all shadow-2xs"
                  >
                    Open Project
                  </Link>
                  <Link
                    href={`/patches?projectId=${project.id}`}
                    className="py-2 px-3 rounded-xl bg-[#1B133C] text-white hover:bg-black font-semibold text-center text-xs transition-all shadow-2xs"
                  >
                    View Patches
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* CREATE PROJECT MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md glass-card border border-white/80">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#1B133C]">Add New Project</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Link a GitHub repository to enable visual DOM patching and preview environments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            {/* GitHub Account Selector / Switcher */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitHubIcon size={16} />
                  {activeGithubUsername ? (
                    <span className="flex items-center gap-1.5 font-mono text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      @{activeGithubUsername}
                    </span>
                  ) : (
                    <span className="font-semibold text-[#1B133C]">GitHub Connected</span>
                  )}
                  {reposList.length > 0 && (
                    <span className="text-[10px] text-muted-foreground bg-white px-2 py-0.5 rounded-md border border-black/5">
                      {reposList.length} repos
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingAccount(!isChangingAccount)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2"
                >
                  {isChangingAccount ? 'Cancel' : (activeGithubUsername ? 'Switch' : 'Enter username')}
                </button>
              </div>

              {isChangingAccount && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={manualGithubInput}
                    onChange={(e) => setManualGithubInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCustomUsername();
                      }
                    }}
                    placeholder="Enter any GitHub username or org"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCustomUsername()}
                    disabled={!manualGithubInput.trim() || loadingRepos}
                    className="px-3.5 py-1.5 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold disabled:opacity-50 transition-all"
                  >
                    {loadingRepos ? 'Loading...' : 'Load'}
                  </button>
                </div>
              )}
            </div>

            {/* Repository Input Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1B133C]">GitHub Repository</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setManualRepoMode(!manualRepoMode)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2"
                  >
                    {manualRepoMode ? 'Select from list' : 'Type repo manually'}
                  </button>
                </div>
              </div>

              {!manualRepoMode && reposList.length > 0 ? (
                <div className="relative">
                  <select
                    value={repoName}
                    onChange={(e) => {
                      if (e.target.value === '__manual__') {
                        setManualRepoMode(true);
                      } else {
                        handleRepoSelect(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
                    required
                    disabled={loadingRepos}
                  >
                    <option value="" disabled>
                      {loadingRepos
                        ? `-- Fetching repositories... --`
                        : '-- Select repository from your GitHub account --'}
                    </option>
                    {reposList.map((r) => (
                      <option key={r.fullName} value={r.fullName}>
                        {r.fullName} (branch: {r.defaultBranch || 'main'})
                      </option>
                    ))}
                    <option value="__manual__">✏️ + Enter custom or private repo manually...</option>
                  </select>
                  {loadingRepos && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRepoName(val);
                      if (val && (!name || name === '')) {
                        const parts = val.split('/');
                        const short = parts[parts.length - 1];
                        setName(
                          short
                            .split(/[-_]/)
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(' ')
                        );
                      }
                    }}
                    placeholder={activeGithubUsername ? `e.g. ${activeGithubUsername}/my-app or repo-name` : 'e.g. owner/my-app or repo-name'}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                      Enter owner/repo or repository name directly.
                    </p>
                    {reposList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setManualRepoMode(false)}
                        className="text-[11px] text-indigo-600 hover:underline font-medium"
                      >
                        Pick from loaded list ({reposList.length})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {loadingRepos && reposList.length === 0 && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground p-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Loading repositories from your connected GitHub account...</span>
                </div>
              )}

              {reposError && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start justify-between gap-2">
                  <span>{reposError}</span>
                  <button
                    type="button"
                    onClick={() => loadRepos(activeGithubUsername)}
                    className="text-amber-800 underline font-semibold shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1B133C]">Project Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marketing Storefront"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1B133C]">Framework</label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
                  >
                    <option value="Next.js">Next.js</option>
                    <option value="React (Vite)">React (Vite)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1B133C]">Cloud Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
                  >
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1B133C]">Production Website URL</label>
                  <span className="text-[10px] text-muted-foreground">Autofetched or enter manually</span>
                </div>
                <input
                  type="text"
                  value={productionUrl}
                  onChange={(e) => setProductionUrl(e.target.value)}
                  placeholder="https://your-domain.com (autofetched from repo or type manually)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-mono focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  The live URL where the Axon Chrome Extension will inject the Visual DOM Inspector.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1B133C] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!repoName || !name}
                  className="px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Connect Project
                </button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}