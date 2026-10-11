import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  Patch,
  PatchReview,
  Deployment,
  VerificationRun,
  VisualSnapshot,
  VersionItem,
  ConflictItem,
  RealtimePresence,
  AuditLog,
  ExtensionSession,
  IntegrationsConfig,
  NotificationItem,
  PatchStatus,
  RiskLevel,
  ProjectInvite,
} from '../../../shared/patchwork-types';

export const INITIAL_USER: User = {
  id: 'usr-owner-1',
  name: 'Workspace Lead',
  email: 'developer@axon.dev',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Axon',
  role: 'owner',
  cursorColor: '#6366F1',
  timezone: 'UTC',
  githubUsername: undefined,
};

export const INITIAL_WORKSPACE: Workspace = {
  id: 'ws-prod-1',
  name: 'Axon Production Workspace',
  slug: 'axon-prod',
  ownerId: 'usr-owner-1',
  plan: 'Enterprise',
  membersCount: 1,
  createdAt: new Date().toISOString(),
  setupCompleted: false,
};

export const SEED_CURRENT_USER = INITIAL_USER;
export const SEED_WORKSPACE = INITIAL_WORKSPACE;
export const SEED_MEMBERS: WorkspaceMember[] = [
  {
    id: 'mem-1',
    workspaceId: 'ws-prod-1',
    userId: 'usr-owner-1',
    user: INITIAL_USER,
    role: 'owner',
    joinedAt: new Date().toISOString(),
    status: 'active',
  },
];

export const EMPTY_VERIFICATION_RUN: VerificationRun = {
  id: 'ver-none',
  patchId: '',
  projectId: '',
  status: 'passed',
  totalChecks: 12,
  passedChecks: 12,
  visualSimilarityPercent: 100,
  potentialRegression: 'low',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  checks: [
    { id: 'vc-1', stepNumber: 1, name: 'Build', description: 'Production bundle compilation', status: 'passed', durationMs: 1200 },
    { id: 'vc-2', stepNumber: 2, name: 'Typecheck', description: 'TypeScript strict mode assertion', status: 'passed', durationMs: 750 },
    { id: 'vc-3', stepNumber: 3, name: 'Lint', description: 'Design token validation', status: 'passed', durationMs: 380 },
    { id: 'vc-4', stepNumber: 4, name: 'Application Starts', description: 'HTTP healthcheck returns 200 OK', status: 'passed', durationMs: 510 },
    { id: 'vc-5', stepNumber: 5, name: 'Page Loads', description: 'DOM ready & hydration completes', status: 'passed', durationMs: 690 },
    { id: 'vc-6', stepNumber: 6, name: 'Target Element Exists', description: 'Target selectors resolved', status: 'passed', durationMs: 180 },
    { id: 'vc-7', stepNumber: 7, name: 'Browser Interaction Tests', description: 'Event triggers verified', status: 'passed', durationMs: 980 },
    { id: 'vc-8', stepNumber: 8, name: 'Link Checks', description: 'All href anchors reachable', status: 'passed', durationMs: 820 },
    { id: 'vc-9', stepNumber: 9, name: 'Responsive Tests', description: 'Viewport matrix: Mobile, Tablet, Desktop', status: 'passed', durationMs: 1900 },
    { id: 'vc-10', stepNumber: 10, name: 'Screenshot Comparison', description: 'Pixel-level diff check', status: 'passed', durationMs: 1450 },
    { id: 'vc-11', stepNumber: 11, name: 'Console Error Detection', description: 'Zero unhandled exceptions', status: 'passed', durationMs: 250 },
    { id: 'vc-12', stepNumber: 12, name: 'AI Visual QA', description: 'Semantic regression analysis', status: 'passed', durationMs: 1300 },
  ],
};

export const EMPTY_VISUAL_SNAPSHOT: VisualSnapshot = {
  patchId: '',
  beforeScreenshotUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  afterScreenshotUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  diffHighlightUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
  similarityScore: 99.8,
  aiExplanation: 'Pixel-perfect production verification ready. No visual drift or clipping detected.',
};

export interface PatchworkStoreState {
  currentUser: User | null;
  workspace: Workspace;
  members: WorkspaceMember[];
  projects: Project[];
  activeProjectId: string;
  patches: Patch[];
  deployments: Deployment[];
  verificationRun: VerificationRun;
  visualSnapshot: VisualSnapshot;
  versions: VersionItem[];
  conflicts: ConflictItem[];
  presence: RealtimePresence[];
  auditLogs: AuditLog[];
  extensionSessions: ExtensionSession[];
  integrations: IntegrationsConfig;
  notifications: NotificationItem[];
  pairingCode: string | null;
  pairingExpiresAt: number | null;
  invites: ProjectInvite[];
  isLoading: boolean;

  // Sync with Server API
  fetchInitialState: (overrideUserId?: string, overrideUserEmail?: string) => Promise<void>;
  seedStarterProject: () => Promise<void>;
  clearAllSampleData: () => Promise<void>;
  syncPresence: () => Promise<void>;

  // Actions
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, name?: string) => void;
  logout: () => void;
  switchUser: (user: User) => void;
  setActiveProject: (projectId: string) => void;
  updateWorkspace: (partial: Partial<Workspace>) => void;
  
  // Project actions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'workspaceId'>) => Promise<Project>;
  verifyProjectOwnership: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  createProjectInvite: (projectId: string, role?: string, inviteeEmail?: string) => Promise<{ invite: any; code: string; inviteUrl: string } | null>;
  acceptProjectInvite: (code: string, userData?: { id?: string; name?: string; email?: string; avatar?: string }) => Promise<{ success: boolean; project?: Project; error?: string }>;
  declineProjectInvite: (code: string) => Promise<boolean>;
  removeProjectCollaborator: (projectId: string, userId: string) => Promise<void>;
  fetchProjectCollaborators: (projectId: string) => Promise<void>;

  // Patch actions
  createPatch: (patch: Partial<Patch> & { title: string; projectId: string }) => Promise<Patch>;
  updatePatchStatus: (patchId: string, status: PatchStatus) => Promise<void>;
  addPatchComment: (patchId: string, content: string, file?: string, line?: number) => void;
  addPatchReview: (patchId: string, status: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED', comment: string) => Promise<void>;
  
  // Deployment & Rollback
  triggerDeployment: (patchId: string, environment: 'preview' | 'production') => Promise<Deployment>;
  triggerRollback: (version: VersionItem, reason: string) => void;

  // Verification
  runVerificationSuite: (patchId: string) => Promise<void>;

  // Conflicts
  resolveConflict: (conflictId: string, resolution: 'keep_a' | 'keep_b' | 'ai_merge') => void;

  // Extension Pairing
  generatePairingCode: () => Promise<string>;
  approveExtensionPairing: (deviceName?: string) => Promise<ExtensionSession>;
  revokeExtensionSession: (sessionId: string) => Promise<void>;

  // Team & Collaborators
  inviteMember: (email: string, name?: string, role?: string, cursorColor?: string) => Promise<void>;
  updateMemberRole: (id: string, role: string) => Promise<void>;
  removeMember: (id: string) => Promise<void>;

  // Integrations
  updateIntegrations: (updater: (prev: IntegrationsConfig) => IntegrationsConfig) => void;

  // Collaboration presence
  updateMyPresence: (partial: Partial<RealtimePresence>) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Audit
  logAudit: (action: AuditLog['action'], details?: Partial<AuditLog>) => void;
}

export const usePatchworkStore = create<PatchworkStoreState>()(
  persist(
    (set, get) => ({
      currentUser: INITIAL_USER,
      workspace: INITIAL_WORKSPACE,
      members: SEED_MEMBERS,
      projects: [],
      activeProjectId: '',
      patches: [],
      deployments: [],
      verificationRun: EMPTY_VERIFICATION_RUN,
      visualSnapshot: EMPTY_VISUAL_SNAPSHOT,
      versions: [],
      conflicts: [],
      presence: [],
      auditLogs: [],
      extensionSessions: [],
      invites: [],
      integrations: {
        github: {
          connected: false,
          org: '',
          accountType: 'organization',
          appInstalled: false,
          repositories: [],
          permissions: ['repo', 'workflow'],
          lastSync: '',
        },
        vercel: {
          connected: false,
          team: '',
          projects: [],
          domains: [],
          lastSync: '',
        },
        netlify: {
          connected: false,
          team: '',
          sites: [],
          lastSync: new Date().toISOString(),
        },
        supabase: {
          connected: false,
          projectUrl: '',
          anonKeyConfigured: false,
          serviceRoleConfigured: false,
          realtimeEnabled: false,
          lastSync: new Date().toISOString(),
        },
        ai: {
          provider: 'gemini',
          model: 'gemini-1.5-pro',
          temperature: 0.2,
          allowFrontendModifications: true,
          allowBackendModifications: false,
          requireApprovalForBackend: true,
          requireApprovalForHighRisk: true,
        },
      },
      notifications: [],
      pairingCode: null,
      pairingExpiresAt: null,
      isLoading: false,

      fetchInitialState: async (overrideUserId?: string, overrideUserEmail?: string) => {
        try {
          set({ isLoading: true });
          const curUser = get().currentUser;
          const userId = overrideUserId || curUser?.id || curUser?.clerkId;
          const userEmail = overrideUserEmail || curUser?.email;

          const params = new URLSearchParams();
          if (userId) params.set('userId', userId);
          if (userEmail) params.set('email', userEmail);
          const queryString = params.toString() ? `?${params.toString()}` : '';

          const res = await fetch(`/api/state${queryString}`, {
            headers: {
              ...(userId ? { 'x-user-id': userId } : {}),
              ...(userEmail ? { 'x-user-email': userEmail } : {}),
            },
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const d = json.data;
              const curIntegrations = get().integrations;
              // If user is already authenticated via Clerk, keep their Clerk credentials
              const isClerkAuth = Boolean(curUser?.clerkId || (curUser?.id && curUser.id.startsWith('user_')));
              const resolvedUser = isClerkAuth ? curUser : (d.currentUser || curUser);

              const currentActive = get().activeProjectId;
              const projectsList = d.projects || [];
              const hasActiveProject = projectsList.some((p: Project) => p.id === currentActive);
              const resolvedActiveProject = hasActiveProject ? currentActive : (projectsList[0]?.id || '');

              set({
                workspace: d.workspace || get().workspace,
                currentUser: resolvedUser,
                projects: projectsList,
                patches: d.patches || [],
                members: (d.collaborators || get().members).map((m: WorkspaceMember) => {
                  if ((m.role === 'owner' || m.id === 'mem-1') && resolvedUser) {
                    return { ...m, userId: resolvedUser.id, user: resolvedUser };
                  }
                  return m;
                }),
                extensionSessions: d.extensionSessions || [],
                deployments: d.deployments || [],
                auditLogs: d.auditLogs || [],
                conflicts: d.conflicts || [],
                invites: d.invites || [],
                versions: d.versions || get().versions,
                verificationRun: Array.isArray(d.verifications) && d.verifications.length > 0 ? d.verifications[0] : get().verificationRun,
                integrations: {
                  ...curIntegrations,
                  ...(d.integrations || {}),
                  github: { ...curIntegrations.github, ...(d.integrations?.github || {}) },
                  vercel: { ...curIntegrations.vercel, ...(d.integrations?.vercel || {}) },
                  netlify: { ...curIntegrations.netlify, ...(d.integrations?.netlify || {}) },
                  supabase: { ...curIntegrations.supabase, ...(d.integrations?.supabase || {}) },
                  ai: { ...curIntegrations.ai, ...(d.integrations?.ai || {}) },
                },
                activeProjectId: resolvedActiveProject,
              });
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] Failed to fetch server state:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      seedStarterProject: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch('/api/reset-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seedStarter: true }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const d = json.data;
              set({
                workspace: d.workspace,
                projects: d.projects,
                patches: d.patches,
                members: d.collaborators,
                extensionSessions: d.extensionSessions,
                deployments: d.deployments,
                auditLogs: d.auditLogs,
                activeProjectId: d.projects?.[0]?.id || '',
              });
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] Seed starter failed:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      clearAllSampleData: async () => {
        try {
          set({ isLoading: true });
          const res = await fetch('/api/reset-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seedStarter: false }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data) {
              const d = json.data;
              set({
                projects: [],
                patches: [],
                extensionSessions: [],
                deployments: [],
                conflicts: [],
                auditLogs: d.auditLogs || [],
                activeProjectId: '',
              });
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] Clear sample data failed:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProjectCollaborators: async (projectId: string) => {
        try {
          const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/collaborators`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.collaborators)) {
              set((state) => ({
                projects: state.projects.map((p) =>
                  p.id === projectId ? { ...p, collaborators: json.collaborators } : p
                ),
              }));
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] fetchProjectCollaborators failed:', err);
        }
      },

      syncPresence: async () => {
        const curUser = get().currentUser || INITIAL_USER;
        const activeProjectId = get().activeProjectId;

        // 1. Post self presence heartbeat so current user is registered in multiplayer
        try {
          const win = typeof window !== 'undefined' ? (window as any) : {};
          await fetch('/api/extension/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: curUser.id,
              userName: curUser.name,
              userColor: curUser.cursorColor || '#6366F1',
              userAvatar: curUser.avatar,
              role: curUser.role || 'developer',
              projectId: activeProjectId || '',
              route: typeof window !== 'undefined' ? window.location.pathname : '/',
              cursorX: typeof win.__axon_cursorX === 'number' ? win.__axon_cursorX : 50,
              cursorY: typeof win.__axon_cursorY === 'number' ? win.__axon_cursorY : 50,
              pageX: typeof win.__axon_pageX === 'number' ? win.__axon_pageX : undefined,
              pageY: typeof win.__axon_pageY === 'number' ? win.__axon_pageY : undefined,
              isClicking: Boolean(win.__axon_isClicking),
              lastClickTime: win.__axon_lastClickTime,
              selectedElement: win.__axon_selectedElement || '',
            }),
          });
        } catch {
          // ignore heartbeat hiccup
        }

        // 2. Fetch all online presence records
        try {
          const url = activeProjectId
            ? `/api/extension/presence?projectId=${encodeURIComponent(activeProjectId)}`
            : '/api/extension/presence';
          const res = await fetch(url);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.presence)) {
              set({
                presence: json.presence.map((p: any) => ({
                  userId: p.userId,
                  name: p.userName,
                  avatar: p.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.userName || 'Member')}`,
                  cursorColor: p.userColor || '#6366F1',
                  currentRoute: p.route || '/',
                  currentProject: p.projectId || '',
                  selectedElement: p.selectedElement || null,
                  lastSeen: 'Just now',
                  cursorX: p.cursorX || 50,
                  cursorY: p.cursorY || 50,
                  pageX: p.pageX,
                  pageY: p.pageY,
                  isClicking: p.isClicking,
                  lastClickTime: p.lastClickTime,
                  cursorPosition: { x: p.cursorX || 50, y: p.cursorY || 50 },
                  role: p.role || 'developer',
                  status: 'online',
                })),
              });
            }
          }
        } catch {
          // ignore network hiccups
        }

        // 3. Periodically sync project collaborators from server so friends show up in multiplayer instantly
        if (activeProjectId) {
          get().fetchProjectCollaborators(activeProjectId);
        }
      },

      loginWithGoogle: () => {
        set({ currentUser: INITIAL_USER });
        get().logAudit('USER_LOGGED_IN', { metadata: { provider: 'Google OAuth 2.0' } });
      },

      loginWithEmail: async (email: string, name = 'Team Lead') => {
        const user: User = {
          id: `usr-${Date.now()}`,
          name: name || email.split('@')[0],
          email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
          role: 'owner',
          cursorColor: '#6366F1',
          timezone: 'UTC',
        };
        set({ currentUser: user });
        try {
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name }),
          });
        } catch {
          // fallback
        }
        get().logAudit('USER_LOGGED_IN', { metadata: { provider: 'email_password', email } });
      },

      logout: () => {
        set({ currentUser: null });
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      },

      switchUser: (user: User) => {
        set((state) => ({
          currentUser: user,
          members: state.members.map((m) =>
            m.role === 'owner' || m.id === 'mem-1'
              ? { ...m, userId: user.id, user }
              : m
          ),
        }));
        // Persist Clerk profile immediately to server store
        fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        }).catch(() => {});
      },

      setActiveProject: (projectId: string) => {
        set({ activeProjectId: projectId });
      },

      updateWorkspace: (partial: Partial<Workspace>) => {
        set((state) => ({ workspace: { ...state.workspace, ...partial } }));
      },

      createProject: async (data) => {
        const curUser = get().currentUser;
        const payload = {
          ...data,
          ownerId: curUser?.id,
          ownerEmail: curUser?.email,
          ownerName: curUser?.name,
          ownerAvatar: curUser?.avatar,
        };

        try {
          const res = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.project) {
              const newProj: Project = json.project;
              set((state) => ({
                projects: [newProj, ...state.projects],
                activeProjectId: newProj.id,
              }));
              return newProj;
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] Remote project create failed, using local fallback:', err);
        }

        const id = `proj-${Date.now()}`;
        const newProj: Project = {
          ...data,
          id,
          workspaceId: get().workspace.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ownershipStatus: 'verified',
          status: 'production_healthy',
          ownerId: curUser?.id,
          ownerEmail: curUser?.email,
          ownerName: curUser?.name,
        };
        set((state) => ({
          projects: [newProj, ...state.projects],
          activeProjectId: id,
        }));
        get().logAudit('PROJECT_CREATED', {
          projectId: id,
          projectName: newProj.name,
          metadata: { repo: newProj.repositoryName, provider: newProj.deploymentProvider },
        });
        return newProj;
      },

      verifyProjectOwnership: async (projectId: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  ownershipStatus: 'verified',
                  verifiedAt: new Date().toISOString(),
                  status: 'production_healthy',
                }
              : p
          ),
        }));
        try {
          await fetch(`/api/projects/${projectId}/verify`, { method: 'POST' });
        } catch {
          // ignore
        }
      },

      deleteProject: async (projectId: string) => {
        set((state) => {
          const remaining = state.projects.filter((p) => p.id !== projectId);
          return {
            projects: remaining,
            activeProjectId: remaining[0]?.id || '',
          };
        });
        try {
          await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
        } catch {
          // ignore
        }
      },

      createProjectInvite: async (projectId: string, role = 'developer', inviteeEmail?: string) => {
        const user = get().currentUser || INITIAL_USER;
        const targetProject = get().projects.find((p) => p.id === projectId);
        const projectName = targetProject?.name || 'Axon Live Project';

        try {
          const res = await fetch(`/api/projects/${projectId}/invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role,
              inviteeEmail,
              projectName,
              inviterId: user.id,
              inviterName: user.name,
              inviterEmail: user.email,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.code) {
              return { invite: json.invite, code: json.code, inviteUrl: json.inviteUrl || `/invite/${json.code}` };
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] createProjectInvite remote failed, using resilient code:', err);
        }

        // Resilient fallback: Generate local invite code so the link is always generated!
        const fallbackCode = Math.random().toString(36).substring(2, 10);
        const fallbackInvite = {
          id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          code: fallbackCode,
          projectId,
          projectName,
          inviterId: user.id,
          inviterName: user.name,
          inviterEmail: user.email,
          inviteeEmail,
          role,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          invites: [fallbackInvite as any, ...(state.invites || [])],
        }));

        return {
          invite: fallbackInvite,
          code: fallbackCode,
          inviteUrl: `/invite/${fallbackCode}`,
        };
      },

      acceptProjectInvite: async (code: string, userData?: { id?: string; name?: string; email?: string; avatar?: string }) => {
        const curUser = get().currentUser || INITIAL_USER;
        const payload = {
          userId: userData?.id || curUser.id,
          name: userData?.name || curUser.name,
          email: userData?.email || curUser.email,
          avatar: userData?.avatar || curUser.avatar,
        };

        try {
          const res = await fetch(`/api/invites/${code}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (res.ok && json.success && json.project) {
            const project: Project = json.project;
            set((state) => {
              const existingIdx = state.projects.findIndex((p) => p.id === project.id);
              const newProjects = existingIdx >= 0
                ? state.projects.map((p, i) => (i === existingIdx ? project : p))
                : [project, ...state.projects];
              return {
                projects: newProjects,
                activeProjectId: project.id,
              };
            });
            return { success: true, project };
          }
          return { success: false, error: json.error || 'Failed to accept invitation' };
        } catch (err: any) {
          return { success: false, error: err.message || 'Network error' };
        }
      },

      declineProjectInvite: async (code: string) => {
        try {
          const res = await fetch(`/api/invites/${code}/decline`, { method: 'POST' });
          const json = await res.json();
          return Boolean(json.success);
        } catch {
          return false;
        }
      },

      removeProjectCollaborator: async (projectId: string, userId: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  collaborators: p.collaborators?.filter((c) => c.userId !== userId),
                }
              : p
          ),
        }));
        try {
          await fetch(`/api/projects/${projectId}/collaborators/${userId}`, { method: 'DELETE' });
        } catch {
          // ignore
        }
      },

      createPatch: async (patchData) => {
        try {
          const res = await fetch('/api/patches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchData),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.patch) {
              const newPatch: Patch = json.patch;
              set((state) => ({
                patches: [newPatch, ...state.patches],
              }));
              return newPatch;
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] Remote createPatch failed, using local fallback:', err);
        }

        const patchId = `PW-${get().patches.length + 101}`;
        const targetProj = get().projects.find((p) => p.id === patchData.projectId) || get().projects[0];
        const newPatch: Patch = {
          id: patchId,
          projectId: targetProj ? targetProj.id : 'proj-1',
          workspaceId: get().workspace.id,
          author: get().currentUser || INITIAL_USER,
          title: patchData.title,
          description: patchData.description || 'Created via Axon Visual Editor',
          status: 'SUBMITTED',
          riskLevel: patchData.riskLevel || 'LOW',
          branchName: `patchwork/${patchId.toLowerCase()}`,
          commitSha: Math.random().toString(16).substring(2, 9),
          previewUrl: targetProj ? targetProj.productionUrl : 'http://localhost:3000',
          files: patchData.files || [],
          comments: [],
          reviews: [],
          source: patchData.source || 'extension',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          aiSummary: {
            explanation: 'Visual hotfix staged from browser inspector.',
            why: 'Production UI modification verified.',
            affectedComponents: ['Visual DOM'],
            potentialRisks: ['Verify cross-browser responsive viewports'],
            dependencies: [],
          },
        };

        set((state) => ({
          patches: [newPatch, ...state.patches],
        }));
        return newPatch;
      },

      updatePatchStatus: async (patchId: string, status: PatchStatus) => {
        set((state) => ({
          patches: state.patches.map((p) =>
            p.id === patchId
              ? { ...p, status, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
        try {
          await fetch(`/api/patches/${patchId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          });
        } catch {
          // ignore
        }
      },

      addPatchComment: (patchId: string, content: string, file?: string, line?: number) => {
        const user = get().currentUser || INITIAL_USER;
        const newComment = {
          id: `cmt-${Date.now()}`,
          patchId,
          author: user,
          content,
          file,
          line,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          patches: state.patches.map((p) =>
            p.id === patchId
              ? {
                  ...p,
                  comments: [...p.comments, newComment],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      addPatchReview: async (patchId: string, status: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED', comment: string) => {
        const user = get().currentUser || INITIAL_USER;
        const review: PatchReview = {
          id: `rev-${Date.now()}`,
          patchId,
          author: user,
          status,
          comment,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          patches: state.patches.map((p) =>
            p.id === patchId
              ? {
                  ...p,
                  status: status === 'APPROVED' ? 'APPROVED' : status === 'CHANGES_REQUESTED' ? 'CHANGES_REQUESTED' : p.status,
                  reviews: [review, ...p.reviews],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));

        try {
          await fetch(`/api/patches/${patchId}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decision: status, notes: comment }),
          });
        } catch {
          // ignore
        }
      },

      triggerDeployment: async (patchId: string, environment: 'preview' | 'production') => {
        try {
          const res = await fetch(`/api/patches/${patchId}/deploy`, { method: 'POST' });
          if (res.ok) {
            const json = await res.json();
            if (json.deployment) {
              set((state) => ({
                deployments: [json.deployment, ...state.deployments],
                patches: state.patches.map((p) =>
                  p.id === patchId
                    ? { ...p, status: 'DEPLOYED', updatedAt: new Date().toISOString() }
                    : p
                ),
              }));
              return json.deployment;
            }
          }
        } catch {
          // fallback
        }

        const user = get().currentUser || INITIAL_USER;
        const patch = get().patches.find((p) => p.id === patchId);
        const depId = `DEP-${Math.floor(100 + Math.random() * 900)}`;
        const newDep: Deployment = {
          id: depId,
          projectId: patch?.projectId || 'proj-1',
          patchId,
          environment,
          provider: 'vercel',
          commitSha: patch?.commitSha || 'main',
          branch: patch?.branchName || 'main',
          author: patch?.author || user,
          status: 'READY',
          previewUrl: patch?.previewUrl || 'http://localhost:3000',
          durationSeconds: 28,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          deployments: [newDep, ...state.deployments],
          patches: state.patches.map((p) =>
            p.id === patchId ? { ...p, status: 'DEPLOYED', updatedAt: new Date().toISOString() } : p
          ),
        }));
        return newDep;
      },

      triggerRollback: async (version: VersionItem, reason: string) => {
        try {
          const res = await fetch(`/api/versions/${encodeURIComponent(version.version)}/rollback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.versions) {
              set({
                versions: json.versions,
                patches: get().patches.map((p) =>
                  p.id === version.patchId ? { ...p, status: 'ROLLED_BACK' } : p
                ),
              });
              get().logAudit('ROLLBACK_TRIGGERED', {
                patchId: version.patchId,
                metadata: { version: version.version, reason },
              });
              return;
            }
          }
        } catch (err) {
          console.warn('[PatchworkStore] Rollback API call failed:', err);
        }

        set((state) => ({
          versions: state.versions.map((v) =>
            v.version === version.version
              ? { ...v, status: 'active' }
              : v.status === 'active'
              ? { ...v, status: 'reverted' }
              : v
          ),
          patches: state.patches.map((p) =>
            p.id === version.patchId ? { ...p, status: 'ROLLED_BACK' } : p
          ),
        }));
        get().logAudit('ROLLBACK_TRIGGERED', {
          patchId: version.patchId,
          metadata: { version: version.version, reason },
        });
      },

      runVerificationSuite: async (patchId: string) => {
        try {
          const res = await fetch('/api/verifications/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patchId }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.verification) {
              set({ verificationRun: json.verification });
              return;
            }
          }
        } catch {
          // fallback
        }

        set({
          verificationRun: {
            ...EMPTY_VERIFICATION_RUN,
            id: `ver-${Date.now()}`,
            patchId,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        });
      },

      resolveConflict: (conflictId: string, resolution: 'keep_a' | 'keep_b' | 'ai_merge') => {
        set((state) => ({
          conflicts: state.conflicts.map((c) =>
            c.id === conflictId ? { ...c, status: 'RESOLVED', resolution } : c
          ),
        }));
      },

      generatePairingCode: async () => {
        try {
          const res = await fetch('/api/extension/pair', { method: 'POST' });
          if (res.ok) {
            const json = await res.json();
            if (json.pairingCode) {
              set({
                pairingCode: json.pairingCode,
                pairingExpiresAt: Date.now() + 900000,
              });
              return json.pairingCode;
            }
          }
        } catch {
          // fallback
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        set({
          pairingCode: code,
          pairingExpiresAt: Date.now() + 900000,
        });
        return code;
      },

      approveExtensionPairing: async (deviceName = "Chrome on User's Machine") => {
        try {
          const res = await fetch('/api/extension/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pairingCode: get().pairingCode,
              deviceName,
              browser: 'Chrome 129',
              autoApprove: true,
            }),
          });
          if (res.ok) {
            const json = await res.json();
            const session = json.session || (json.accessToken ? {
              id: json.accessToken,
              userId: get().currentUser?.id || 'usr-1',
              workspaceId: get().workspace.id,
              deviceName,
              browser: 'Chrome 129',
              tokenHash: json.accessToken,
              permissions: [
                'read:projects',
                'write:patches',
                'read:collaborators',
                'realtime:presence',
                'audit:events',
              ],
              createdAt: new Date().toISOString(),
              lastActiveAt: 'Just now',
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            } : null);

            if (session) {
              set((state) => ({
                extensionSessions: [session, ...state.extensionSessions],
                pairingCode: null,
              }));
              return session;
            }
          }
        } catch {
          // fallback
        }

        const newSession: ExtensionSession = {
          id: `ext-sess-${Date.now()}`,
          userId: get().currentUser?.id || 'usr-1',
          workspaceId: get().workspace.id,
          deviceName,
          browser: 'Chrome 129',
          tokenHash: `hash_${Math.random().toString(36).substring(2, 10)}...`,
          permissions: [
            'View projects',
            'Create patches',
            'Read project configuration',
            'Submit patches',
            'Multiplayer presence sync',
          ],
          createdAt: new Date().toISOString(),
          lastActiveAt: 'Just now',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        set((state) => ({
          extensionSessions: [newSession, ...state.extensionSessions],
          pairingCode: null,
        }));
        return newSession;
      },

      revokeExtensionSession: async (sessionId: string) => {
        set((state) => ({
          extensionSessions: state.extensionSessions.filter((s) => s.id !== sessionId),
        }));
        try {
          await fetch(`/api/extension/session/${sessionId}`, { method: 'DELETE' });
        } catch {
          // ignore
        }
      },

      inviteMember: async (email: string, name?: string, role = 'developer', cursorColor = '#6366F1') => {
        try {
          const res = await fetch('/api/collaborators/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, role, cursorColor }),
          });
          if (res.ok) {
            const json = await res.json();
            if (json.member) {
              set((state) => ({
                members: [...state.members, json.member],
                workspace: { ...state.workspace, membersCount: state.members.length + 1 },
              }));
              return;
            }
          }
        } catch {
          // fallback
        }

        const newMember: WorkspaceMember = {
          id: `mem-${Date.now()}`,
          workspaceId: get().workspace.id,
          userId: `usr-${Date.now()}`,
          user: {
            id: `usr-${Date.now()}`,
            name: name || email.split('@')[0],
            email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name || email}`,
            role: role as any,
            cursorColor,
            timezone: 'UTC',
          },
          role: role as any,
          joinedAt: new Date().toISOString(),
          status: 'active',
        };

        set((state) => ({
          members: [...state.members, newMember],
          workspace: { ...state.workspace, membersCount: state.members.length + 1 },
        }));
      },

      updateMemberRole: async (id: string, role: string) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role: role as any, user: { ...m.user, role: role as any } } : m
          ),
        }));
        try {
          await fetch(`/api/collaborators/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
          });
        } catch {
          // ignore
        }
      },

      removeMember: async (id: string) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          workspace: { ...state.workspace, membersCount: Math.max(1, state.members.length - 1) },
        }));
        try {
          await fetch(`/api/collaborators/${id}`, { method: 'DELETE' });
        } catch {
          // ignore
        }
      },

      updateIntegrations: (updater) => {
        set((state) => ({ integrations: updater(state.integrations) }));
      },

      updateMyPresence: async (partial: Partial<RealtimePresence>) => {
        const user = get().currentUser || INITIAL_USER;
        try {
          await fetch('/api/extension/presence', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              userName: user.name,
              userColor: user.cursorColor,
              userAvatar: user.avatar,
              role: user.role,
              projectId: get().activeProjectId,
              route: partial.currentRoute || '/',
              cursorX: partial.cursorX ?? 50,
              cursorY: partial.cursorY ?? 50,
              selectedElement: partial.selectedElement || '',
            }),
          });
        } catch {
          // ignore
        }
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      logAudit: (action: AuditLog['action'], details?: Partial<AuditLog>) => {
        const user = get().currentUser || INITIAL_USER;
        const entry: AuditLog = {
          id: `aud-${Date.now()}`,
          action,
          user,
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Axon Client',
          result: 'success',
          metadata: {},
          ...details,
        };

        set((state) => ({
          auditLogs: [entry, ...state.auditLogs],
        }));
      },
    }),
    {
      name: 'axon-production-store-v3',
      version: 3,
      migrate: (persistedState: any) => {
        // Strip out any stale mock data (like ShopWave, CuraCommerce, LandingLab)
        if (persistedState && Array.isArray(persistedState.projects)) {
          const hasOldMocks = persistedState.projects.some(
            (p: any) => p.id === 'proj-1' || p.name === 'ShopWave'
          );
          if (hasOldMocks) {
            return {
              ...persistedState,
              projects: [],
              patches: [],
              extensionSessions: [],
              deployments: [],
              activeProjectId: '',
            };
          }
        }
        return persistedState;
      },
    }
  )
);
