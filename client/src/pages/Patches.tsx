import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Plus,
  Filter,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Search
} from 'lucide-react';
import type { PatchStatus } from '../../../shared/patchwork-types';

export default function PatchesPage() {
  const { patches, projects } = usePatchworkStore();
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filterTabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Ready to Deploy', value: 'READY_TO_DEPLOY' },
    { label: 'Deployed', value: 'DEPLOYED' },
    { label: 'Rolled Back', value: 'ROLLED_BACK' },
  ];

  const filteredPatches = patches.filter((p) => {
    const matchesFilter = filter === 'ALL' || p.status === filter;
    const matchesSearch =
      search === '' ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.author.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: PatchStatus) => {
    switch (status) {
      case 'READY_TO_DEPLOY':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEPLOYED':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'ROLLED_BACK':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'CHANGES_REQUESTED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <DashboardLayout
      title="Patches Studio"
      subtitle="Review, verify, and promote visual git patches before production deployment."
      actions={
        patches.length > 0 ? (
          <Link
            href={`/patches/${patches[0].id}`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold shadow-xs hover:bg-black transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Patch ({patches[0].id})</span>
          </Link>
        ) : (
          <Link
            href="/extension-connect"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs hover:bg-indigo-700 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Stage Patch in Extension</span>
          </Link>
        )
      }
    >
      <div className="space-y-6">
        {/* Filter bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                  filter === tab.value
                    ? 'bg-[#1B133C] text-white font-semibold shadow-xs'
                    : 'bg-white/70 border border-black/5 text-[#1B133C]/70 hover:bg-white hover:text-[#1B133C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patches, ID, author..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 bg-white/80 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Patch List Cards */}
        <div className="space-y-3">
          {filteredPatches.length === 0 ? (
            <div className="glass-card p-12 text-center border border-white/80 space-y-3">
              <GitPullRequest className="w-8 h-8 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-bold text-[#1B133C]">No patches match filter</h4>
              <p className="text-xs text-muted-foreground">Try clearing filters or search criteria.</p>
            </div>
          ) : (
            filteredPatches.map((patch) => {
              const project = projects.find((p) => p.id === patch.projectId);
              return (
                <div
                  key={patch.id}
                  className="glass-card p-5 border border-white/80 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                        {patch.id}
                      </span>
                      <Link
                        href={`/patches/${patch.id}`}
                        className="text-base font-bold text-[#1B133C] hover:text-indigo-600 transition-colors"
                      >
                        {patch.title}
                      </Link>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/5 text-[#1B133C]/70">
                        {project?.name || 'Production Site'}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">{patch.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>Author: <strong className="text-[#1B133C]">{patch.author.name}</strong></span>
                      <span>•</span>
                      <span>{patch.files.length} files modified</span>
                      <span>•</span>
                      <span className="font-mono">{patch.branchName}</span>
                      <span>•</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        patch.riskLevel === 'LOW' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        Risk: {patch.riskLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/5">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadge(patch.status)}`}
                    >
                      {patch.status.replace(/_/g, ' ')}
                    </span>
                    <Link
                      href={`/patches/${patch.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#1B133C] text-white hover:bg-black font-semibold text-xs shadow-2xs transition-all flex items-center gap-1"
                    >
                      <span>Review & Diff</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
