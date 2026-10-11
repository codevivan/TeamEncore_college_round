export type Role = 'owner' | 'admin' | 'developer' | 'reviewer' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  cursorColor: string;
  timezone: string;
  githubUsername?: string;
  clerkId?: string;
  isEmailVerified?: boolean;
  connectedProviders?: string[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  membersCount: number;
  createdAt: string;
  setupCompleted?: boolean;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  user: User;
  role: Role;
  joinedAt: string;
  status: 'active' | 'invited' | 'disabled';
}

export type Framework = 'Next.js' | 'React (Vite)' | 'Vue / Nuxt' | 'SvelteKit' | 'Astro' | 'Remix';
export type DeploymentProviderType = 'vercel' | 'netlify' | 'custom';
export type ProjectStatus = 'production_healthy' | 'degraded' | 'building' | 'unverified';
export type OwnershipStatus = 'verified' | 'pending' | 'failed';

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  role: Role;
  joinedAt: string;
}

export interface ProjectInvite {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail?: string;
  role: Role;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  acceptedAt?: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  productionUrl: string;
  framework: Framework;
  repositoryId: string;
  repositoryName: string;
  repositoryUrl: string;
  deploymentProvider: DeploymentProviderType;
  deploymentProjectId: string;
  defaultBranch: string;
  status: ProjectStatus;
  ownershipStatus: OwnershipStatus;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
  collaborators?: ProjectMember[];
  verifiedAt?: string;
  txtVerificationToken?: string;
  createdAt: string;
  updatedAt: string;
}

export type PatchStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PREVIEW_BUILDING'
  | 'PREVIEW_READY'
  | 'VERIFYING'
  | 'VERIFICATION_FAILED'
  | 'VERIFIED'
  | 'READY_TO_DEPLOY'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'DEPLOY_FAILED'
  | 'ROLLED_BACK';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PatchFile {
  filename: string;
  category: 'frontend' | 'backend' | 'config';
  changeType: 'modified' | 'added' | 'deleted';
  additions: number;
  deletions: number;
  oldContent: string;
  newContent: string;
  diffSummary: string;
}

export interface PatchComment {
  id: string;
  patchId: string;
  author: User;
  file?: string;
  line?: number;
  content: string;
  createdAt: string;
  replies?: PatchComment[];
}

export interface PatchReview {
  id: string;
  patchId: string;
  author: User;
  status: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED';
  comment: string;
  createdAt: string;
}

export interface PatchAISummary {
  explanation: string;
  why: string;
  affectedComponents: string[];
  potentialRisks: string[];
  dependencies: string[];
}

export interface Patch {
  id: string; // e.g. PW-104
  projectId: string;
  workspaceId: string;
  author: User;
  title: string;
  description: string;
  status: PatchStatus;
  riskLevel: RiskLevel;
  branchName: string;
  commitSha: string;
  previewUrl: string;
  productionDeploymentId?: string;
  files: PatchFile[];
  comments: PatchComment[];
  reviews: PatchReview[];
  aiSummary?: PatchAISummary;
  source: 'extension' | 'web' | 'cli';
  createdAt: string;
  updatedAt: string;
}

export type DeploymentStatus = 'QUEUED' | 'BUILDING' | 'READY' | 'FAILED' | 'CANCELLED' | 'ROLLED_BACK';
export type Environment = 'preview' | 'production';

export interface Deployment {
  id: string; // e.g. DEP-89
  projectId: string;
  patchId?: string;
  environment: Environment;
  provider: DeploymentProviderType;
  commitSha: string;
  branch: string;
  author: User;
  status: DeploymentStatus;
  previewUrl: string;
  durationSeconds: number;
  createdAt: string;
  logs?: string[];
}

export interface VerificationCheckItem {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  durationMs: number;
  errorDetails?: string;
}

export interface VerificationRun {
  id: string;
  patchId: string;
  projectId: string;
  status: 'passed' | 'failed' | 'running';
  totalChecks: number;
  passedChecks: number;
  visualSimilarityPercent: number;
  potentialRegression: 'low' | 'medium' | 'high';
  checks: VerificationCheckItem[];
  startedAt: string;
  completedAt?: string;
}

export interface VisualSnapshot {
  patchId: string;
  beforeScreenshotUrl: string;
  afterScreenshotUrl: string;
  diffHighlightUrl: string;
  similarityScore: number;
  aiExplanation: string;
}

export interface VersionItem {
  version: string; // e.g. v1.4
  commitSha: string;
  patchId?: string;
  title: string;
  author: User;
  deployedAt: string;
  status: 'active' | 'superseded' | 'reverted';
  deploymentId: string;
  rollbackPossible: boolean;
}

export interface ConflictItem {
  id: string;
  patchAId: string;
  patchBId: string;
  file: string;
  line: number;
  description: string;
  snippetA: string;
  snippetB: string;
  aiResolutionProposal: string;
  resolutionStatus: 'unresolved' | 'resolved';
  chosenResolution?: 'keep_a' | 'keep_b' | 'ai_merge' | 'manual';
}

export interface RealtimePresence {
  userId: string;
  name: string;
  avatar: string;
  cursorColor: string;
  currentProject: string;
  currentRoute: string;
  currentActivity?: string;
  cursorX?: number;
  cursorY?: number;
  pageX?: number;
  pageY?: number;
  selectedElement?: string | null;
  isClicking?: boolean;
  lastClickTime?: number;
  cursorPosition?: { x: number; y: number };
  role?: string;
  lastSeen?: string;
  lastSeenAt?: string;
  status: 'online' | 'idle' | 'offline';
}

export type AuditAction =
  | 'USER_LOGGED_IN'
  | 'GITHUB_CONNECTED'
  | 'GITHUB_DISCONNECTED'
  | 'VERCEL_CONNECTED'
  | 'NETLIFY_CONNECTED'
  | 'SUPABASE_CONNECTED'
  | 'INTEGRATION_SYNCED'
  | 'PROJECT_CREATED'
  | 'PROJECT_OWNERSHIP_VERIFIED'
  | 'PATCH_CREATED'
  | 'PATCH_UPDATED'
  | 'PATCH_SUBMITTED'
  | 'PATCH_APPROVED'
  | 'PATCH_REJECTED'
  | 'DEPLOYMENT_STARTED'
  | 'DEPLOYMENT_COMPLETED'
  | 'DEPLOYMENT_FAILED'
  | 'VERIFICATION_PASSED'
  | 'VERIFICATION_FAILED'
  | 'ROLLBACK_TRIGGERED'
  | 'COLLABORATOR_INVITED'
  | 'INVITATION_SENT'
  | 'EXTENSION_PAIRED'
  | 'EXTENSION_REVOKED'
  | 'EXTENSION_SESSION_REVOKED'
  | 'WORKSPACE_UPDATED'
  | 'AI_CONFIG_UPDATED';

export interface AuditLog {
  id: string;
  timestamp: string;
  user: User;
  action: AuditAction;
  projectId?: string;
  projectName?: string;
  patchId?: string;
  ip: string;
  userAgent: string;
  result: 'success' | 'failure' | 'warning';
  metadata: Record<string, any>;
}

export interface ExtensionSession {
  id: string;
  userId: string;
  workspaceId: string;
  deviceName: string;
  browser: string;
  pairingCode?: string;
  tokenHash: string;
  permissions: string[];
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  revokedAt?: string;
  token?: string;
  user?: any;
  deviceInfo?: string;
  version?: string;
  ipAddress?: string;
}

export interface IntegrationsConfig {
  github: {
    connected: boolean;
    org: string;
    accountType: 'organization' | 'user';
    appInstalled: boolean;
    repositories: string[];
    permissions: string[];
    lastSync: string;
  };
  vercel: {
    connected: boolean;
    team: string;
    projects: string[];
    domains: string[];
    lastSync: string;
  };
  netlify: {
    connected: boolean;
    team: string;
    sites: string[];
    lastSync: string;
  };
  supabase: {
    connected: boolean;
    projectUrl: string;
    anonKeyConfigured: boolean;
    serviceRoleConfigured: boolean;
    realtimeEnabled: boolean;
    lastSync: string;
  };
  ai: {
    provider: 'gemini' | 'openai' | 'anthropic';
    model: string;
    temperature: number;
    allowFrontendModifications: boolean;
    allowBackendModifications: boolean;
    requireApprovalForBackend: boolean;
    requireApprovalForHighRisk: boolean;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'patch' | 'deployment' | 'verification' | 'rollback' | 'team' | 'conflict';
  link?: string;
  timestamp: string;
  read: boolean;
}
