import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  FolderGit2,
  GitPullRequest,
  Rocket,
  ShieldCheck,
  Users,
  History,
  FileText,
  Settings,
  Boxes,
  Puzzle,
  Search,
  ChevronDown,
  LogOut,
  ExternalLink,
  Plus,
  AlertTriangle,
  Menu,
  X,
  CheckCircle2,
  User as UserIcon,
} from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { PatchworkLogo } from './PatchworkLogo';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { WorkspaceSetupModal } from './WorkspaceSetupModal';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    currentUser,
    workspace,
    projects,
    activeProjectId,
    setActiveProject,
    extensionSessions,
    switchUser,
    logout,
    integrations,
  } = usePatchworkStore();
  const clerk = useClerk();
  const { isSignedIn, user: clerkUser } = useUser();

  const displayName =
    clerkUser?.fullName ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') ||
    clerkUser?.username ||
    clerkUser?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    currentUser?.name ||
    'Developer';

  const displayEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    currentUser?.email ||
    '';

  const displayAvatar =
    clerkUser?.imageUrl ||
    currentUser?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const handleLogout = async () => {
    logout();
    if (isSignedIn) {
      try {
        await clerk.signOut();
      } catch (err) {
        console.error('Clerk signout:', err);
      }
    }
    setLocation('/login');
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const platformNav = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/projects', icon: FolderGit2, badge: projects.length },
    { label: 'Visual Patches', href: '/patches', icon: GitPullRequest, badge: 'Live' },
    { label: 'Deployments', href: '/deployments', icon: Rocket },
    { label: 'Multiplayer', href: '/collaboration', icon: Users, badge: 'Realtime' },
    { label: 'Versions & Rollback', href: '/versions', icon: History },
    { label: 'Audit Logs', href: '/audit', icon: FileText },
  ];

  const secondaryNav: Array<{ label: string; href: string; icon: any; badge?: string | number }> = [
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f1ec] text-[#1B133C] antialiased">
      <CommandPalette />
      <WorkspaceSetupModal />

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#1B133C]/10 bg-white/75 backdrop-blur-xl shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1B133C]/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <PatchworkLogo size="md" />
          </Link>
        </div>

        {/* Workspace Selector */}
        <div className="p-3 border-b border-[#1B133C]/10 bg-black/[0.02]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-2 rounded-xl bg-white/90 border border-[#1B133C]/10 shadow-2xs hover:bg-white transition-all text-left">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[#1B133C] text-white flex items-center justify-center font-bold text-xs">
                    {workspace.name.substring(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1B133C] truncate">{workspace.name}</p>
                    <p className="text-[10px] text-muted-foreground">{workspace.plan} Plan</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 glass-dropdown border border-white/60">
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Workspaces</DropdownMenuLabel>
              <DropdownMenuItem className="text-xs font-semibold text-[#1B133C]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                {workspace.name} (Active)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/onboarding')} className="text-xs text-indigo-600">
                <Plus className="w-3.5 h-3.5 mr-2" /> Create New Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Platform Group */}
          <div>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1B133C]/50">Platform</p>
            <nav className="space-y-0.5">
              {platformNav.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1B133C] text-white shadow-xs font-semibold'
                        : 'text-[#1B133C]/80 hover:bg-black/5 hover:text-[#1B133C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1B133C]/60'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-black/5 text-[#1B133C]/70'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Configuration Group */}
          <div>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#1B133C]/50">Configuration</p>
            <nav className="space-y-0.5">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location === item.href ||
                  (item.href === '/settings/integrations' && location.startsWith('/settings/integrations')) ||
                  (item.href === '/settings' && location.startsWith('/settings') && !location.startsWith('/settings/integrations'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1B133C] text-white shadow-xs font-semibold'
                        : 'text-[#1B133C]/80 hover:bg-black/5 hover:text-[#1B133C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#1B133C]/60'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>



        {/* User Profile Footer - Clerk Auth Only */}
        <div className="p-3 border-t border-[#1B133C]/10 bg-white/90">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-black/5 transition-all text-left group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-black/10 shrink-0"
                    />
                    {isSignedIn && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1B133C] truncate">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 group-hover:text-[#1B133C] transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 glass-dropdown border border-white/60">
              <div className="p-2.5 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 rounded-t-lg border-b border-black/5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Clerk Authenticated</span>
                </div>
                <p className="text-xs font-bold text-[#1B133C] truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
              </div>

              {isSignedIn && (
                <DropdownMenuItem
                  onClick={() => {
                    if (clerk.openUserProfile) {
                      clerk.openUserProfile();
                    } else {
                      setLocation('/settings/security');
                    }
                  }}
                  className="text-xs text-indigo-700 font-medium py-2"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-2 text-indigo-600" /> Manage Clerk Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setLocation('/settings/workspace')} className="text-xs py-2">
                <Settings className="w-3.5 h-3.5 mr-2" /> Workspace Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/settings/security')} className="text-xs py-2">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" /> Security & Connected Accounts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-xs text-rose-600 font-medium py-2 focus:text-rose-600">
                <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/70 backdrop-blur-md border-b border-[#1B133C]/10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#1B133C] hover:bg-black/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Active Project Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/10 bg-white/80 hover:bg-white text-xs font-semibold text-[#1B133C] shadow-2xs transition-all">
                  <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {projects.length > 0 && activeProject
                      ? activeProject.name
                      : (projects.length > 0 ? 'Select Project' : 'Projects (0)')}
                  </span>
                  {activeProject && projects.length > 0 && (
                    <span className="text-[10px] font-mono font-normal text-muted-foreground">({activeProject.framework})</span>
                  )}
                  <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 glass-dropdown border border-white/60">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Your Projects</DropdownMenuLabel>
                {projects.length > 0 ? (
                  projects.map((p) => {
                    const collabCount = p.collaborators ? p.collaborators.length : 1;
                    return (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => setActiveProject(p.id)}
                        className="text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {p.repositoryName} • {collabCount} {collabCount === 1 ? 'member' : 'members'}
                          </p>
                        </div>
                        {p.id === activeProjectId && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </DropdownMenuItem>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    No projects yet. Create a project to get started.
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Project-Scoped Multiplayer Presence & Member Badges */}
            {activeProject && projects.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-black/10">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {(activeProject.collaborators && activeProject.collaborators.length > 0
                    ? activeProject.collaborators
                    : [
                        {
                          id: 'owner',
                          user: {
                            name: activeProject.ownerName || displayName,
                            avatar: displayAvatar,
                          },
                          role: 'owner',
                        },
                      ]
                  )
                    .slice(0, 4)
                    .map((c: any, i: number) => (
                      <img
                        key={c.id || i}
                        src={
                          c.user?.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            c.user?.name || 'Member'
                          )}`
                        }
                        alt={c.user?.name || 'Member'}
                        title={`${c.user?.name || 'Member'} (${c.role || 'Member'})`}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                      />
                    ))}
                </div>
                <Link
                  href="/collaboration"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-black/5 transition-colors"
                  title="Multiplayer roster for this project"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {activeProject.collaborators ? activeProject.collaborators.length : 1} in project
                  </span>
                  <span className="text-indigo-600 font-semibold ml-0.5">+ Invite</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Button */}
            <button
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
                document.dispatchEvent(event);
              }}
              className="hidden sm:inline-flex items-center gap-3 px-3 py-1.5 rounded-xl border border-black/10 bg-white/70 hover:bg-white text-xs text-muted-foreground shadow-2xs transition-all"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Search or jump to...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-black/5 rounded text-[#1B133C]/60">Ctrl+K</kbd>
            </button>

            {/* Quick Extension Pair Action */}
            <Link
              href="/extension/connect"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all bg-white border-[#1B133C]/10 text-[#1B133C] hover:bg-black/5"
            >
              <Puzzle className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden md:inline">Connect Extension</span>
            </Link>

            {/* Notification Center */}
            <NotificationCenter />
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-4 bg-white/95 border-b border-black/10 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Platform</p>
            <div className="grid grid-cols-2 gap-2">
              {platformNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl border border-black/5 text-xs font-medium text-[#1B133C] hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pt-2">Configuration</p>
            <div className="grid grid-cols-2 gap-2">
              {secondaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl border border-black/5 text-xs font-medium text-[#1B133C] hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Page Header (if title specified) */}
        {title && (
          <div className="px-4 lg:px-8 pt-6 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#1B133C]">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-[#1B133C]/70 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
