import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { DashboardLayout } from '@/components/DashboardLayout';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Rocket,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  FileCode,
  Check,
  X,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  GitBranch,
  GitCommit,
  UserCheck
} from 'lucide-react';
import type { PatchStatus } from '../../../shared/patchwork-types';

export default function PatchDetailPage() {
  const [, params] = useRoute('/patches/:id');
  const {
    patches,
    projects,
    addPatchComment,
    addPatchReview,
    triggerDeployment,
    runVerificationSuite,
    verificationRun,
  } = usePatchworkStore();

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [deploySuccess, setDeploySuccess] = useState(false);

  const patchId = params?.id || 'PW-104';
  const patch = patches.find((p) => p.id === patchId) || patches[0];
  const project = projects.find((pr) => pr.id === patch?.projectId) || projects[0];

  if (!patch) {
    return (
      <DashboardLayout title="Patch Not Found">
        <p className="text-xs text-muted-foreground">The requested patch was not found.</p>
        <Link href="/patches" className="text-xs text-indigo-600 underline mt-2 inline-block">
          Return to Patches Studio
        </Link>
      </DashboardLayout>
    );
  }

  const activeFile = patch.files[activeFileIndex] || patch.files[0];

  // Pipeline step order
  const pipelineSteps: { label: string; status: PatchStatus[] }[] = [
    { label: 'Draft', status: ['DRAFT'] },
    { label: 'Review', status: ['IN_REVIEW', 'CHANGES_REQUESTED'] },
    { label: 'Preview', status: ['PREVIEW_BUILDING', 'PREVIEW_READY'] },
    { label: 'Verification', status: ['VERIFYING', 'VERIFIED'] },
    { label: 'Approved', status: ['APPROVED', 'READY_TO_DEPLOY'] },
    { label: 'Deployed', status: ['DEPLOYING', 'DEPLOYED'] },
  ];

  const getCurrentStepIndex = () => {
    if (patch.status === 'DEPLOYED') return 5;
    if (patch.status === 'READY_TO_DEPLOY' || patch.status === 'APPROVED') return 4;
    if (patch.status === 'VERIFIED' || patch.status === 'VERIFYING') return 3;
    if (patch.status === 'PREVIEW_READY' || patch.status === 'PREVIEW_BUILDING') return 2;
    if (patch.status === 'IN_REVIEW' || patch.status === 'CHANGES_REQUESTED') return 1;
    return 0;
  };

  const handleApprove = () => {
    addPatchReview(patch.id, 'APPROVED', reviewComment || 'Visual diff looks pristine. Approved for production.');
    setReviewComment('');
  };

  const handleRequestChanges = () => {
    addPatchReview(patch.id, 'CHANGES_REQUESTED', reviewComment || 'Please adjust button alignment on mobile.');
    setReviewComment('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addPatchComment(patch.id, commentText, activeFile?.filename, 8);
    setCommentText('');
  };

  const handlePromoteToProduction = () => {
    triggerDeployment(patch.id, 'production');
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 4000);
  };

  return (
    <DashboardLayout
      title={`${patch.id}: ${patch.title}`}
      subtitle={`Created by ${patch.author.name} • Project: ${project.name}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/patches"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#1B133C] hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <a
            href={patch.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {patch.status === 'READY_TO_DEPLOY' || patch.status === 'APPROVED' ? (
            <button
              onClick={handlePromoteToProduction}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Promote to Production</span>
            </button>
          ) : patch.status === 'DEPLOYED' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Production Live
            </span>
          ) : null}
        </div>
      }
    >
      <div className="space-y-6">
        {/* SUCCESS BANNER */}
        {deploySuccess && (
          <div className="p-4 rounded-xl bg-emerald-500 text-white text-xs font-semibold flex items-center justify-between shadow-md">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Production deployment initialized! Live on {project.productionUrl}
            </span>
            <Link href="/deployments" className="underline">View in Deployments</Link>
          </div>
        )}

        {/* STATUS PIPELINE PROGRESS */}
        <div className="glass-card p-5 border border-white/80">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Patch Promotion Pipeline
          </p>
          <div className="grid grid-cols-6 gap-2">
            {pipelineSteps.map((step, idx) => {
              const currentIdx = getCurrentStepIndex();
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={step.label} className="text-center space-y-1.5">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPast
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-indigo-600 ring-2 ring-indigo-200 animate-pulse'
                        : 'bg-black/10'
                    }`}
                  />
                  <p
                    className={`text-[11px] font-medium truncate ${
                      isCurrent ? 'font-bold text-[#1B133C]' : isPast ? 'text-emerald-700' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* METADATA STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="glass-card p-3 border border-white/80">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Author</span>
            <p className="font-bold text-[#1B133C] mt-0.5">{patch.author.name}</p>
          </div>
          <div className="glass-card p-3 border border-white/80">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Git Branch</span>
            <p className="font-mono text-[#1B133C] truncate mt-0.5">{patch.branchName}</p>
          </div>
          <div className="glass-card p-3 border border-white/80">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Commit SHA</span>
            <p className="font-mono text-indigo-700 font-bold mt-0.5">{patch.commitSha}</p>
          </div>
          <div className="glass-card p-3 border border-white/80">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Risk Level</span>
            <p className="font-bold text-emerald-700 mt-0.5">{patch.riskLevel}</p>
          </div>
          <div className="glass-card p-3 border border-white/80">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Verification</span>
            <p className="font-bold text-emerald-700 mt-0.5">12/12 Passed ✓</p>
          </div>
          <div className="glass-card p-3 border border-white/80">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Source</span>
            <p className="font-bold text-[#1B133C] capitalize mt-0.5">{patch.source} Client</p>
          </div>
        </div>

        {/* AI EXPLANATION & RISK ANALYSIS */}
        {patch.aiSummary && (
          <div className="glass-card p-5 border border-indigo-200/60 bg-gradient-to-r from-indigo-50/40 to-white/70 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-[#1B133C] uppercase tracking-wider">
                AI Semantic Patch Analysis
              </h3>
            </div>
            <p className="text-xs text-[#1B133C] leading-relaxed">
              <strong>Why this patch changed:</strong> {patch.aiSummary.why}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-white/80 border border-black/5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Affected Components</span>
                <p className="font-mono text-[#1B133C] mt-0.5">{patch.aiSummary.affectedComponents.join(', ')}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-black/5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Potential Risks</span>
                <p className="text-amber-800 font-medium mt-0.5">{patch.aiSummary.potentialRisks.join('; ')}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/80 border border-black/5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Dependencies</span>
                <p className="text-slate-700 mt-0.5">{patch.aiSummary.dependencies.join(', ') || 'Zero runtime deps'}</p>
              </div>
            </div>
          </div>
        )}

        {/* CODE DIFF VIEWER */}
        <div className="glass-card p-5 border border-white/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-[#1B133C]">Code Diff</h3>
            </div>

            {/* File Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {patch.files.map((file, idx) => (
                <button
                  key={file.filename}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    activeFileIndex === idx
                      ? 'bg-[#1B133C] text-white font-semibold'
                      : 'bg-black/5 text-[#1B133C]/70 hover:bg-black/10'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>
          </div>

          {/* Unified / Side-by-Side Diff Display */}
          {activeFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono font-semibold text-[#1B133C]">{activeFile.filename}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-emerald-600 font-bold">+{activeFile.additions}</span>
                  <span className="text-rose-600 font-bold">-{activeFile.deletions}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs font-mono">
                {/* Before */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/30 overflow-hidden">
                  <div className="px-3 py-1.5 bg-rose-100 text-rose-800 font-semibold text-[11px] border-b border-rose-200">
                    Baseline (Production)
                  </div>
                  <pre className="p-4 text-rose-950 overflow-x-auto leading-relaxed">
                    {activeFile.oldContent}
                  </pre>
                </div>

                {/* After */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 overflow-hidden">
                  <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-semibold text-[11px] border-b border-emerald-200">
                    Patch Proposed (patchwork/{patch.id.toLowerCase()})
                  </div>
                  <pre className="p-4 text-emerald-950 overflow-x-auto leading-relaxed">
                    {activeFile.newContent}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TEAM REVIEW & COMMENT PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Review Decision Actions */}
          <div className="glass-card p-5 border border-white/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider">
                Team Sign-off & Reviews
              </span>
              <span className="text-xs text-muted-foreground">{patch.reviews.length} reviews</span>
            </div>

            <div className="space-y-2">
              {patch.reviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-xl bg-white border border-black/5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1B133C]">{rev.author.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rev.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Quick Review Buttons */}
            <div className="space-y-2 pt-2">
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Optional review notes or QA findings..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Approve Patch
                </button>
                <button
                  onClick={handleRequestChanges}
                  className="flex-1 py-2 rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Request Changes
                </button>
              </div>
            </div>
          </div>

          {/* Inline Thread Comments */}
          <div className="glass-card p-5 border border-white/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Inline Comments
              </span>
              <span className="text-xs text-muted-foreground">{patch.comments.length} comments</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {patch.comments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No inline comments on this patch yet.</p>
              ) : (
                patch.comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-xl bg-white border border-black/5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1B133C]">{comment.author.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {comment.file}:{comment.line || 1}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Leave feedback on this file or line..."
                className="flex-1 px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black"
              >
                Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
