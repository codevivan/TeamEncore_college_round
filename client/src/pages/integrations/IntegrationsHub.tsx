import React from 'react';
import { Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SettingsNav } from '@/components/SettingsNav';
import {
  GitHubIcon,
  VercelIcon,
  NetlifyIcon,
  SupabaseIcon
} from '@/components/BrandIcons';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function IntegrationsHubPage() {
  const { integrations } = usePatchworkStore();

  const githubReposCount = (integrations?.github?.repositories || []).length;
  const vercelProjectsCount = (integrations?.vercel?.projects || []).length;
  const netlifySitesCount = (integrations?.netlify?.sites || []).length;

  const integrationList = [
    {
      id: 'github',
      name: 'GitHub App',
      description: 'Create branches, commit visual AST modifications, and open Pull Requests directly from live website edits.',
      icon: GitHubIcon,
      iconBg: 'bg-black text-white',
      connected: Boolean(integrations?.github?.connected),
      meta: `Org: ${integrations?.github?.org || 'axon-team'} • ${githubReposCount} repos`,
      href: '/settings/integrations/github',
      tag: 'Source of Truth'
    },
    {
      id: 'vercel',
      name: 'Vercel Previews',
      description: 'Spin up instant preview environments for visual patches and trigger zero-downtime production promotions.',
      icon: VercelIcon,
      iconBg: 'bg-black text-white',
      connected: Boolean(integrations?.vercel?.connected),
      meta: `Team: ${integrations?.vercel?.team || 'axon-prod'} • ${vercelProjectsCount} projects`,
      href: '/settings/integrations/vercel',
      tag: 'Cloud Edge Hosting'
    },
    {
      id: 'netlify',
      name: 'Netlify Sites',
      description: 'Branch deploy previews, edge handlers, and automated webhook notifications on patch merge.',
      icon: NetlifyIcon,
      iconBg: 'bg-[#00AD9F] text-white',
      connected: Boolean(integrations?.netlify?.connected),
      meta: `Team: ${integrations?.netlify?.team || 'Not Configured'} • ${netlifySitesCount} sites`,
      href: '/settings/integrations/netlify',
      tag: 'Edge Handlers'
    },
    {
      id: 'supabase',
      name: 'Supabase Realtime',
      description: 'PostgreSQL relational storage with Row Level Security (RLS) and multi-cursor real-time broadcast channels.',
      icon: SupabaseIcon,
      iconBg: 'bg-[#3ECF8E] text-black',
      connected: Boolean(integrations?.supabase?.connected),
      meta: 'PostgreSQL • Realtime Channels Active',
      href: '/settings/integrations/supabase',
      tag: 'Database & Presence'
    },
  ];

  return (
    <DashboardLayout
      title="Integrations Hub"
      subtitle="Connect source control, deployment clouds, and real-time multiplayer backends."
    >
      <div className="space-y-6 max-w-5xl">
        <SettingsNav currentTab="integrations" />

        {/* Informative Banner */}
        <div className="p-4 rounded-2xl bg-white/80 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-[#1B133C]">
              <strong>4 of 4 Core Integrations Connected.</strong> All webhooks and OAuth tokens are active and verified.
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Zero Credentials In Browser
          </span>
        </div>

        {/* 4 Clean Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="glass-card p-6 md:p-7 border border-white/80 flex flex-col justify-between hover:shadow-lg transition-all space-y-5 group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-xs`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-[#1B133C]">{item.name}</h3>
                          <span className="text-[10px] font-mono text-muted-foreground bg-black/5 px-2 py-0.5 rounded">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.meta}</p>
                      </div>
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
                    </span>
                  </div>

                  <p className="text-xs text-[#1B133C]/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Configured & Healthy</span>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black transition-all shadow-2xs group-hover:translate-x-0.5"
                  >
                    <span>Configure</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
