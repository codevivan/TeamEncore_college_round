import { getStore } from './store';

interface SupabaseConfig {
  url: string;
  key: string;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const store = getStore();
  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    store.integrations?.supabase?.projectUrl ||
    '';

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    '';

  if (!url || !key) {
    return null;
  }

  // Ensure url has https://
  const cleanUrl = url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`;
  return { url: cleanUrl, key };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseConfig());
}

/**
 * Generic Supabase REST client using standard fetch (PostgREST API)
 */
async function supabaseRest(endpoint: string, method: string = 'GET', body?: any) {
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    const res = await fetch(`${config.url}/rest/v1/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Prefer: 'return=representation, resolution=merge-duplicates',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Supabase REST] ${method} /${endpoint} notice (${res.status}):`, errText);
      return null;
    }

    return await res.json().catch(() => ({ success: true }));
  } catch (err: any) {
    console.warn(`[Supabase REST] Network warning for /${endpoint}:`, err?.message || err);
    return null;
  }
}

/**
 * Persists a Git commit version to Supabase
 */
export async function syncGitCommitToSupabase(data: {
  commitSha: string;
  branch: string;
  message: string;
  author: string;
  filesChanged: number;
  versionTag?: string;
  timestamp?: string;
  projectId?: string;
  workspaceId?: string;
}) {
  const config = getSupabaseConfig();
  if (!config) {
    console.log('[Supabase Sync] Ready for credentials. Data logged locally in Axon store.');
    return false;
  }

  const payload = {
    commit_sha: data.commitSha,
    branch: data.branch,
    message: data.message,
    author: data.author,
    files_changed: data.filesChanged,
    version_tag: data.versionTag || 'v1.0.0',
    created_at: data.timestamp || new Date().toISOString(),
    project_id: data.projectId || 'proj-default',
    workspace_id: data.workspaceId || 'ws-prod-1',
  };

  const res = await supabaseRest('axon_versions', 'POST', payload);
  if (res) {
    console.log(`[Supabase Sync] Commit ${data.commitSha.substring(0, 7)} successfully synced to Supabase.`);
    return true;
  }
  return false;
}

/**
 * Persists an audit log event to Supabase
 */
export async function syncAuditLogToSupabase(audit: {
  id: string;
  action: string;
  userName?: string;
  userEmail?: string;
  result?: string;
  metadata?: any;
  timestamp?: string;
}) {
  const config = getSupabaseConfig();
  if (!config) return false;

  const payload = {
    id: audit.id,
    action: audit.action,
    user_name: audit.userName || 'Lead Developer',
    user_email: audit.userEmail || 'developer@axon.dev',
    result: audit.result || 'success',
    metadata: audit.metadata || {},
    created_at: audit.timestamp || new Date().toISOString(),
  };

  return Boolean(await supabaseRest('axon_audit_logs', 'POST', payload));
}

/**
 * Persists workspace metadata to Supabase
 */
export async function syncWorkspaceToSupabase(workspace: {
  id: string;
  name: string;
  slug: string;
  plan?: string;
  setupCompleted?: boolean;
}) {
  const config = getSupabaseConfig();
  if (!config) return false;

  const payload = {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    plan: workspace.plan || 'Enterprise',
    setup_completed: Boolean(workspace.setupCompleted),
    updated_at: new Date().toISOString(),
  };

  return Boolean(await supabaseRest('axon_workspaces', 'POST', payload));
}

/**
 * Fetches Git commit history from Supabase (if available)
 */
export async function fetchGitHistoryFromSupabase(): Promise<any[] | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  return await supabaseRest('axon_versions?select=*&order=created_at.desc&limit=50', 'GET');
}
