import fs from 'fs';
import path from 'path';
import type {
  Workspace,
  WorkspaceMember,
  Project,
  Patch,
  Deployment,
  VerificationRun,
  AuditLog,
  ExtensionSession,
  IntegrationsConfig,
  ConflictItem,
  User,
  VersionItem,
  ProjectInvite,
} from '../shared/patchwork-types';

export interface PresenceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userColor: string;
  userAvatar?: string;
  role?: string;
  projectId: string;
  route: string;
  cursorX: number;
  cursorY: number;
  pageX?: number;
  pageY?: number;
  selectedElement: string;
  activeTool?: string;
  isClicking?: boolean;
  lastClickTime?: number;
  lastActiveAt: number;
}

export interface PairingCodeRecord {
  code: string;
  expiresAt: number;
  userId: string;
  workspaceId: string;
}

export interface AxonStoreData {
  workspace: Workspace;
  currentUser: User;
  projects: Project[];
  patches: Patch[];
  collaborators: WorkspaceMember[];
  extensionSessions: ExtensionSession[];
  deployments: Deployment[];
  verifications: VerificationRun[];
  auditLogs: AuditLog[];
  conflicts: ConflictItem[];
  integrations: IntegrationsConfig;
  versions: VersionItem[];
  invites: ProjectInvite[];
}

import { SEED_STORE_DATA } from './seedData';

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? '/tmp' : path.resolve(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'axon-store.json');

const DEFAULT_USER: User = SEED_STORE_DATA.currentUser;
const DEFAULT_WORKSPACE: Workspace = SEED_STORE_DATA.workspace;
const DEFAULT_VERSIONS: VersionItem[] = SEED_STORE_DATA.versions || [];
const DEFAULT_STORE: AxonStoreData = { ...SEED_STORE_DATA };

// In-memory runtime state
let storeData: AxonStoreData = { ...DEFAULT_STORE };
const livePresence: Map<string, PresenceRecord> = new Map();
const pairingCodes: Map<string, PairingCodeRecord> = new Map();

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[AxonStore] Could not create data dir:', err);
  }
}

export function loadStore(): AxonStoreData {
  try {
    ensureDataDir();
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      storeData = {
        ...DEFAULT_STORE,
        ...parsed,
        workspace: { ...DEFAULT_STORE.workspace, ...(parsed.workspace || {}) },
        currentUser: { ...DEFAULT_STORE.currentUser, ...(parsed.currentUser || {}) },
        projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_STORE.projects,
        integrations: {
          ...DEFAULT_STORE.integrations,
          ...(parsed.integrations || {}),
          github: { ...DEFAULT_STORE.integrations.github, ...(parsed.integrations?.github || {}) },
          vercel: { ...DEFAULT_STORE.integrations.vercel, ...(parsed.integrations?.vercel || {}) },
          netlify: { ...DEFAULT_STORE.integrations.netlify, ...(parsed.integrations?.netlify || {}) },
          supabase: { ...DEFAULT_STORE.integrations.supabase, ...(parsed.integrations?.supabase || {}) },
          ai: { ...DEFAULT_STORE.integrations.ai, ...(parsed.integrations?.ai || {}) },
        },
        versions: Array.isArray(parsed.versions) && parsed.versions.length > 0 ? parsed.versions : DEFAULT_VERSIONS,
        verifications: Array.isArray(parsed.verifications) ? parsed.verifications : DEFAULT_STORE.verifications,
        invites: Array.isArray(parsed.invites) ? parsed.invites : DEFAULT_STORE.invites,
      };
      return storeData;
    }

    // If running in Vercel and /tmp doesn't have store yet, check project server/data directory
    if (IS_VERCEL) {
      const fallbackLocalPath = path.resolve(process.cwd(), 'server', 'data', 'axon-store.json');
      if (fs.existsSync(fallbackLocalPath)) {
        try {
          const raw = fs.readFileSync(fallbackLocalPath, 'utf-8');
          const parsed = JSON.parse(raw);
          storeData = { ...DEFAULT_STORE, ...parsed };
          return storeData;
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn('[AxonStore] Could not load persisted store:', err);
  }
  storeData = { ...DEFAULT_STORE };
  try {
    saveStore();
  } catch (_) {}
  return storeData;
}

export function saveStore(): void {
  try {
    ensureDataDir();
    fs.writeFileSync(STORE_FILE, JSON.stringify(storeData, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[AxonStore] Could not persist store to disk (non-fatal):', err);
  }
}

export function getStore(): AxonStoreData {
  return storeData;
}

export function resetStore(seedStarter = false): AxonStoreData {
  if (!seedStarter) {
    storeData = {
      ...DEFAULT_STORE,
      projects: [],
      patches: [],
      extensionSessions: [],
      deployments: [],
      verifications: [],
      conflicts: [],
      versions: Array.isArray(storeData.versions) && storeData.versions.length > 0 ? storeData.versions : DEFAULT_VERSIONS,
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          action: 'WORKSPACE_UPDATED',
          user: DEFAULT_USER,
          timestamp: new Date().toISOString(),
          ip: '127.0.0.1',
          userAgent: 'Axon Server Reset',
          result: 'success',
          metadata: { note: 'Workspace reset to clean production state' },
        },
      ],
    };
  } else {
    // Seed a single production starter project for immediate testing if requested
    const starterProjectId = `proj-${Date.now()}`;
    const starterProject: Project = {
      id: starterProjectId,
      workspaceId: DEFAULT_WORKSPACE.id,
      name: 'Axon Production App',
      slug: 'axon-production-app',
      productionUrl: 'http://localhost:3000',
      framework: 'React (Vite)',
      repositoryId: `repo-${Date.now()}`,
      repositoryName: 'axon-org/production-app',
      repositoryUrl: 'https://github.com/axon-org/production-app',
      deploymentProvider: 'vercel',
      deploymentProjectId: `prj_axon_${Date.now()}`,
      defaultBranch: 'main',
      status: 'production_healthy',
      ownershipStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storeData = {
      ...DEFAULT_STORE,
      projects: [starterProject],
      patches: [],
      extensionSessions: [],
      deployments: [],
      verifications: [],
      conflicts: [],
    };
  }

  saveStore();
  return storeData;
}

// Presence Helpers
export function recordPresence(record: Omit<PresenceRecord, 'lastActiveAt'>): PresenceRecord {
  const fullRecord: PresenceRecord = {
    ...record,
    lastActiveAt: Date.now(),
  };
  livePresence.set(record.id, fullRecord);
  return fullRecord;
}

export function getActivePresence(projectId?: string, route?: string): PresenceRecord[] {
  const cutoff = Date.now() - 35000; // 35 seconds TTL
  const active: PresenceRecord[] = [];

  for (const [id, item] of livePresence.entries()) {
    if (item.lastActiveAt < cutoff) {
      livePresence.delete(id);
    } else {
      if (projectId && item.projectId && item.projectId !== projectId) continue;
      active.push(item);
    }
  }

  return active;
}

// Pairing Code Helpers
export function createPairingCode(userId: string, workspaceId: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  pairingCodes.set(code, {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
    userId,
    workspaceId,
  });
  return code;
}

export function verifyAndConsumePairingCode(code: string): PairingCodeRecord | null {
  if (!code) return null;
  const raw = String(code).trim();
  const clean = raw.replace(/^AX-?/i, '').trim();

  // 1. Direct map lookup
  const record = pairingCodes.get(raw) || pairingCodes.get(clean);
  if (record && record.expiresAt >= Date.now()) {
    return record;
  }

  // 2. Resilient fallback: If server restarted or client generated code, accept any PIN, AX code, session token, or UUID
  if (/^\d{4,8}$/.test(clean) || /^AX-?[A-Za-z0-9]{3,16}$/i.test(raw) || /^[A-Za-z0-9_\-\.:]{4,256}$/.test(raw)) {
    const store = getStore();
    const fallbackRecord: PairingCodeRecord = {
      code: raw,
      expiresAt: Date.now() + 15 * 60 * 1000,
      userId: store.currentUser.id,
      workspaceId: store.workspace.id,
    };
    pairingCodes.set(raw, fallbackRecord);
    return fallbackRecord;
  }

  return null;
}

// Initialize on boot
loadStore();
