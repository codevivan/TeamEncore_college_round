import React from 'react';
import { useRoute, Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import { GitHubIcon, VercelIcon, NetlifyIcon } from '@/components/BrandIcons';
import {
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  GitPullRequest,
  History,
  Settings,
  ArrowLeft,
  Puzzle,
  AlertTriangle,
  ArrowUpRight,
  GitBranch
} from 'lucide-react';

export default function ProjectDetailPage() {
  const [, params] = useRoute('/projects/:id');
  const { projects, patches, deployments, verifyProjectOwnership } = usePatchworkStore();

  const project = projects.find((p) => p.id === params?.id) || projects[0];
  const projectPatches = patches.filter((p) => p.projectId === project?.id);
  const projectDeployments = deployments.filter((d) => d.projectId === project?.id);
  const isVercel = project?.deploymentProvider.toLowerCase() === 'vercel';

  if (!project) {
    return (
      <DashboardLayout title="Project Not Found">
        <p className="text-sm text-muted-foreground">The requested project could not be found.</p>
        <Link href="/projects" className="text-indigo-600 underline text-xs mt-2 inline-block">
          Return to Projects
        </Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={project.name}
      subtitle={`Repository: ${project.repositoryName} • Managed by ${project.deploymentProvider.toUpperCase()}`}
      actions={
        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
          </Link>
          <a
            href={project.productionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black shadow-xs"
          >
            <span>Visit Production</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      }
    >
      <div className="space-y-6 max-w-5xl">
        {/* Project Overview Card */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#1B133C]">{project.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Ownership
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                <GitHubIcon size={14} className="text-black/80" />
                <span className="font-mono">{project.repositoryName}</span>
                <span>•</span>
                <span className="font-mono">Branch: {project.defaultBranch}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/settings/extension"
                className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-100 transition-colors"
              >
                <Puzzle className="w-3.5 h-3.5" /> Pair Extension
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Framework</span>
              <p className="font-bold text-sm text-[#1B133C]">{project.framework}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Cloud Provider</span>
              <p className="font-bold text-sm text-[#1B133C] capitalize flex items-center gap-1.5">
                {isVercel ? <VercelIcon size={13} /> : <NetlifyIcon size={13} />}
                <span>{project.deploymentProvider}</span>
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Active Patches</span>
              <p className="font-bold text-sm text-indigo-700">{projectPatches.length} Patches</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-black/5 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Deployments</span>
              <p className="font-bold text-sm text-purple-700">{projectDeployments.length} Releases</p>
            </div>
          </div>
        </div>

        {/* Patches in this project */}
        <div className="glass-card p-6 md:p-8 border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <h3 className="font-bold text-base text-[#1B133C] flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-indigo-600" /> Patches in {project.name}
            </h3>
            <Link href="/patches" className="text-xs text-indigo-600 font-semibold hover:underline">
              View All
            </Link>
          </div>

          {projectPatches.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4">No active patches for this project.</p>
          ) : (
            <div className="space-y-3">
              {projectPatches.map((patch) => (
                <div
                  key={patch.id}
                  className="p-4 rounded-xl border border-black/5 bg-white/70 hover:bg-white flex items-center justify-between gap-3 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {patch.id}
                      </span>
                      <Link href={`/patches/${patch.id}`} className="text-sm font-bold text-[#1B133C] hover:text-indigo-600">
                        {patch.title}
                      </Link>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{patch.branchName} • by {patch.author.name}</p>
                  </div>

                  <Link
                    href={`/patches/${patch.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#1B133C] text-white hover:bg-black text-xs font-semibold"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
