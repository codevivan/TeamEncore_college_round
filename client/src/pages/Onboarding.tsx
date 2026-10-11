import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  CheckCircle2,
  Github,
  Rocket,
  ExternalLink,
  ShieldCheck,
  Puzzle,
  ArrowRight,
  FolderGit2,
  Sparkles,
  Layers,
  Check,
  ChevronRight
} from 'lucide-react';

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { createProject, updateIntegrations, integrations } = usePatchworkStore();
  const [step, setStep] = useState(1);

  // Form states
  const [githubConnected, setGithubConnected] = useState(integrations.github.connected);
  const [selectedProvider, setSelectedProvider] = useState<'vercel' | 'netlify'>('vercel');
  const [projectName, setProjectName] = useState('My Storefront');
  const [repoName, setRepoName] = useState('org/storefront-web');
  const [framework, setFramework] = useState<'Next.js' | 'React (Vite)'>('Next.js');
  const [productionUrl, setProductionUrl] = useState('https://my-app.com');
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  const handleFinish = () => {
    // Add project if needed
    createProject({
      name: projectName,
      slug: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      productionUrl,
      framework,
      repositoryId: `repo-${Date.now()}`,
      repositoryName: repoName,
      repositoryUrl: `https://github.com/${repoName}`,
      deploymentProvider: selectedProvider,
      deploymentProjectId: `deploy_${Date.now()}`,
      defaultBranch: 'main',
      status: 'production_healthy',
      ownershipStatus: 'verified',
    });
    setLocation('/dashboard');
  };

  const stepsList = [
    { num: 1, title: 'Welcome' },
    { num: 2, title: 'Connect GitHub' },
    { num: 3, title: 'Deployment' },
    { num: 4, title: 'Import' },
    { num: 5, title: 'Verify' },
    { num: 6, title: 'Extension' },
  ];

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] py-12 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-8 border-b border-black/10">
          <Link href="/">
            <PatchworkLogo size="md" />
          </Link>
          <span className="text-xs font-mono text-muted-foreground">
            Step {step} of 6
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mt-6 mb-10 overflow-x-auto pb-2">
          {stepsList.map((s) => (
            <div key={s.num} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-[#1B133C] text-white ring-4 ring-indigo-200'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black/10 text-[#1B133C]/50'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === s.num ? 'font-bold text-[#1B133C]' : 'text-muted-foreground'}`}>
                {s.title}
              </span>
              {s.num < 6 && <ChevronRight className="w-4 h-4 text-black/20 mx-1 hidden sm:inline" />}
            </div>
          ))}
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="glass-card p-8 border border-white/80 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1B133C]">
              Welcome to PATCHWORK
            </h2>
            <p className="text-sm text-[#1B133C]/70 max-w-lg mx-auto leading-relaxed">
              We&apos;re going to connect your existing repository, configure deployment previews, verify ownership, and prepare your workspace for git-native visual hotfixes.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B133C] text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-black transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONNECT GITHUB */}
        {step === 2 && (
          <div className="glass-card p-8 border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-[#1B133C]">Connect GitHub</h3>
                <p className="text-xs text-muted-foreground">Authorize PATCHWORK GitHub App for repository access.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-white/70 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#1B133C]">GitHub App Permissions</p>
                  <p className="text-[11px] text-muted-foreground">Branch creation, PR sync, commit write.</p>
                </div>
                <button
                  onClick={() => {
                    setGithubConnected(true);
                    updateIntegrations((prev) => ({
                      ...prev,
                      github: { ...prev.github, connected: true },
                    }));
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    githubConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#1B133C] text-white hover:bg-black'
                  }`}
                >
                  {githubConnected ? 'Connected ✓' : 'Authorize GitHub App'}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                We never store personal access tokens. All actions are performed using GitHub App installation tokens.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B133C] text-white font-semibold text-xs shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONNECT DEPLOYMENT PROVIDER */}
        {step === 3 && (
          <div className="glass-card p-8 border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-[#1B133C]">Connect Deployment Provider</h3>
                <p className="text-xs text-muted-foreground">Select where your production application is hosted.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedProvider('vercel')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedProvider === 'vercel'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-black/10 bg-white hover:border-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#1B133C]">Vercel</span>
                  {selectedProvider === 'vercel' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Native preview deployments, serverless functions, and instant rollbacks.
                </p>
              </div>

              <div
                onClick={() => setSelectedProvider('netlify')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedProvider === 'netlify'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-black/10 bg-white hover:border-black/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-[#1B133C]">Netlify</span>
                  {selectedProvider === 'netlify' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Deploy previews, Edge handlers, and webhook triggers.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep(2)} className="text-xs text-muted-foreground hover:underline">
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B133C] text-white font-semibold text-xs shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: IMPORT PROJECT */}
        {step === 4 && (
          <div className="glass-card p-8 border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-[#1B133C]">Import Project</h3>
                <p className="text-xs text-muted-foreground">Map repository and framework configuration.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1B133C] mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B133C] mb-1">GitHub Repository</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B133C] mb-1">Production URL</label>
                <input
                  type="url"
                  value={productionUrl}
                  onChange={(e) => setProductionUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Detected Framework: <strong>Next.js (App Router)</strong></span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep(3)} className="text-xs text-muted-foreground hover:underline">
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B133C] text-white font-semibold text-xs shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: VERIFY OWNERSHIP */}
        {step === 5 && (
          <div className="glass-card p-8 border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-[#1B133C]">Verify Project Ownership</h3>
                <p className="text-xs text-muted-foreground">Confirm that you are authorized to patch this domain.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#1B133C]">Cryptographic Mapping Attestation</p>
                  <p className="text-[11px] text-muted-foreground">
                    Matches GitHub Org ({repoName}) with {selectedProvider.toUpperCase()} Team.
                  </p>
                </div>
                <button
                  onClick={() => setOwnershipVerified(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    ownershipVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {ownershipVerified ? 'Verified ✓' : 'Run Verification'}
                </button>
              </div>
              {ownershipVerified && (
                <p className="text-xs text-emerald-700 font-medium">
                  Ownership verified ✓. Production patch deployment is now authorized.
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep(4)} className="text-xs text-muted-foreground hover:underline">
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                disabled={!ownershipVerified}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B133C] text-white font-semibold text-xs shadow-md disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: CHROME EXTENSION GUIDE */}
        {step === 6 && (
          <div className="glass-card p-8 border border-white/80 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Puzzle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-2xl text-[#1B133C]">Install PATCHWORK Chrome Extension</h3>
                <p className="text-xs text-muted-foreground">The visual editing client for your live website.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-black/10 bg-white space-y-3">
              <p className="text-xs text-[#1B133C] leading-relaxed">
                The Chrome extension lets you click elements on your live production or staging URL to make visual edits and AI refinements. It connects back to this control plane automatically.
              </p>
              <div className="pt-2">
                <Link
                  href="/extension/connect"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <span>Preview Extension Pairing Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button onClick={() => setStep(5)} className="text-xs text-muted-foreground hover:underline">
                Back
              </button>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B133C] text-white font-semibold text-xs shadow-md hover:bg-black"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
