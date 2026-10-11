import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import {
  Sparkles,
  GitPullRequest,
  ShieldCheck,
  Rocket,
  RotateCcw,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Terminal,
  Layers,
  Laptop,
  Puzzle,
  AlertTriangle,
  Lock,
  Zap,
  Cpu,
  Github,
  Play
} from 'lucide-react';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { usePatchworkStore } from '@/lib/patchworkStore';

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea.mp4";

const navigationLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Security', href: '#security' },
  { label: 'Developers', href: '#developers' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

export default function Home() {
  const { patches, deployments, verificationRun } = usePatchworkStore();
  const [activeTab, setActiveTab] = useState<'preview' | 'diff' | 'verification' | 'git'>('preview');

  useEffect(() => {
    const scrollToTarget = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      const targetId = hash ? hash.slice(1) : path === '/pricing' ? 'pricing' : null;
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    };
    scrollToTarget();
    window.addEventListener('hashchange', scrollToTarget);
    return () => window.removeEventListener('hashchange', scrollToTarget);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f3f1ec] text-[#1B133C] selection:bg-indigo-500/20 selection:text-[#1B133C]">
      {/* Background Video Veil */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover object-top"
          loop
          muted
          playsInline
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
        <div className="patchwork-video-veil absolute inset-0" />
      </div>

      {/* Floating Pill Header */}
      <header className="sticky top-4 z-50 mx-auto flex w-full max-w-5xl justify-center px-4">
        <nav
          aria-label="Main navigation"
          className="glass-pill flex w-full items-center justify-between px-4 py-2.5 shadow-sm md:px-6"
        >
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <PatchworkLogo size="sm" />
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {navigationLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith('#')) {
                      e.preventDefault();
                      const target = document.querySelector(link.href);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, '', link.href);
                      }
                    }
                  }}
                  className="text-xs font-medium text-[#1B133C]/75 transition-colors hover:text-[#1B133C]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SignedOut>
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-[#1B133C] hover:text-black transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1B133C] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-900 transition-all hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1B133C] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-900 transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-xs font-medium text-[#1B133C] shadow-2xs backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">Git-native visual patching</span>
          <span className="text-[#1B133C]/40">•</span>
          <span className="text-[#1B133C]/70">No rebuild required</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-[#1B133C] leading-[0.98] max-w-4xl mx-auto">
          Hotfix the Internet.
          <span className="block italic text-[#1B133C]/85">Without rebuilding everything.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="mt-8 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#1B133C]/75 leading-relaxed font-normal">
          PATCHWORK lets teams safely modify live websites through visual patches, preview every change in isolation, verify it automatically, and roll back in one click when something goes wrong.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <SignedOut>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B133C] px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-black transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B133C] px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-black transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </SignedIn>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#1B133C] shadow-2xs backdrop-blur-md hover:bg-white transition-all"
          >
            <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>See How It Works</span>
          </a>
        </div>

        {/* Trust Bar */}
        <div className="mt-14 pt-8 border-t border-black/5 flex flex-wrap items-center justify-center gap-8 text-xs font-medium text-[#1B133C]/60">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> GitHub App Native
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Vercel & Netlify Sync
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 12-Step Automated QA
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Safe Git Revert Rollback
          </span>
        </div>

        {/* INTERACTIVE PRODUCT PREVIEW WINDOW */}
        <div className="mt-12 glass-card p-2 sm:p-4 text-left shadow-2xl border border-white/80 overflow-hidden">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between border-b border-black/5 pb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-3 text-xs font-mono text-muted-foreground hidden sm:inline">
                axon.dev/patches/preview
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center rounded-lg bg-black/5 p-1 gap-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'preview' ? 'bg-white shadow-xs text-[#1B133C]' : 'text-[#1B133C]/60 hover:text-[#1B133C]'
                  }`}
              >
                Visual Preview
              </button>
              <button
                onClick={() => setActiveTab('diff')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'diff' ? 'bg-white shadow-xs text-[#1B133C]' : 'text-[#1B133C]/60 hover:text-[#1B133C]'
                  }`}
              >
                Git Diff
              </button>
              <button
                onClick={() => setActiveTab('verification')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'verification' ? 'bg-white shadow-xs text-[#1B133C]' : 'text-[#1B133C]/60 hover:text-[#1B133C]'
                  }`}
              >
                Verification (12/12)
              </button>
              <button
                onClick={() => setActiveTab('git')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'git' ? 'bg-white shadow-xs text-[#1B133C]' : 'text-[#1B133C]/60 hover:text-[#1B133C]'
                  }`}
              >
                History & Deploy
              </button>
            </div>
          </div>

          {/* Interactive Tab Contents */}
          <div className="p-3 sm:p-6 bg-white/70 rounded-xl mt-3 min-h-[360px]">
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-mono font-bold">
                      PW-104
                    </span>
                    <h3 className="text-sm font-semibold text-[#1B133C]">
                      Update hero CTA & glassmorphism badge
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ready to Deploy
                  </span>
                </div>

                {/* Side-by-Side Comparison Mock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-black/10 bg-slate-50/70">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="font-semibold uppercase tracking-wider">Production Baseline</span>
                      <span className="text-[10px] font-mono">v1.3 • live-storefront.com</span>
                    </div>
                    <div className="p-6 bg-white rounded-lg border border-slate-200 text-center space-y-3">
                      <span className="text-xs text-slate-500 uppercase tracking-widest">New Release</span>
                      <h4 className="font-serif text-2xl text-slate-700">Hotfix the Internet</h4>
                      <button className="px-5 py-2 bg-blue-600 text-white rounded text-xs opacity-70">
                        Get Started
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-indigo-500/40 bg-indigo-50/30 relative">
                    <div className="flex items-center justify-between text-xs text-indigo-900 mb-3">
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> PATCHWORK Preview
                      </span>
                      <span className="text-[10px] font-mono text-indigo-600">patchwork/PW-104</span>
                    </div>
                    <div className="p-6 bg-white rounded-lg border border-indigo-200 text-center space-y-3 shadow-sm">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-[#1B133C] border border-black/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Git-native visual patching
                      </div>
                      <h4 className="font-serif text-2xl text-[#1B133C]">Hotfix the Internet</h4>
                      <button className="px-6 py-2.5 bg-[#1B133C] text-white rounded-xl text-xs font-semibold shadow-md transform scale-105">
                        Start Patching Free
                      </button>
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] bg-indigo-600 text-white font-mono px-2 py-0.5 rounded-full">
                      98.7% Visual Match
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-black/5">
                  <div className="flex items-center gap-3">
                    <span>Author: <strong>Shreyas</strong></span>
                    <span>Review: <strong>Arnav (Approved ✓)</strong></span>
                  </div>
                  <Link href="/patches" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                    Open Patch Studio <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'diff' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600 font-semibold">src/components/Hero.tsx</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    +12 lines / -4 lines
                  </span>
                </div>
                <div className="font-mono text-xs p-4 rounded-lg bg-slate-900 text-slate-100 overflow-x-auto space-y-1">
                  <div className="text-slate-500">@@ -82,6 +82,14 @@ export function Hero() &#123;</div>
                  <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded">-  &lt;span className="text-xs uppercase"&gt;New Release&lt;/span&gt;</div>
                  <div className="text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded">-  &lt;button className="px-6 py-2.5 bg-blue-600 text-white"&gt;Get Started&lt;/button&gt;</div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">+  &lt;div className="glass-pill inline-flex items-center gap-2 px-3 py-1.5"&gt;</div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">+    &lt;span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /&gt;</div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">+    Git-native visual patching v2.4</div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">+  &lt;/div&gt;</div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">+  &lt;button className="mt-8 px-8 py-3.5 bg-[#1B133C] text-white rounded-xl shadow-md"&gt;</div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">+    Start Patching Free</div>
                  <div className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">+  &lt;/button&gt;</div>
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Automated 12-Step Test Suite</span>
                  <span className="text-emerald-600">12 / 12 Checks Passed ✓</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {verificationRun.checks.slice(0, 9).map((check) => (
                    <div key={check.id} className="p-2.5 rounded-lg border border-black/5 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{check.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{check.durationMs}ms</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <span>Visual Regression Score: <strong>98.7% identical layout</strong></span>
                  <span className="text-[10px] font-semibold uppercase bg-emerald-200/80 px-2 py-0.5 rounded">Risk: Low</span>
                </div>
              </div>
            )}

            {activeTab === 'git' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span>Git Timeline & Deployment Pipeline</span>
                  <span className="text-muted-foreground">Branch: axon/hero-cta-hotfix</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-black/10 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-[#1B133C]">DEP-89 Preview Live</p>
                        <p className="text-[10px] text-muted-foreground font-mono">store-git-axon-preview.vercel.app</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Ready
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-black/5 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="font-semibold text-slate-700">Production Baseline (v1.3)</p>
                        <p className="text-[10px] text-muted-foreground font-mono">commit f4b1e90</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">Active</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1: THE PROBLEM */}
      <section id="features" className="relative z-10 mx-auto max-w-5xl px-4 py-20 border-t border-black/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">The Problem</span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1B133C] mt-2">
            Why rebuild the whole ship to adjust a single sail?
          </h2>
          <p className="text-sm text-[#1B133C]/70 mt-4 leading-relaxed">
            In modern frontend workflows, changing a headline, updating a button CTA, or adjusting spacing requires full git branch dance, CI pipeline compilation, staging environment redeploys, and endless QA ping-pong.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border border-white/70">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1B133C]">Rebuild Latency</h3>
            <p className="text-xs text-[#1B133C]/70 mt-2 leading-relaxed">
              Waiting 12 minutes for a full Docker/Next.js container build just to hotfix a typo or padding discrepancy wastes valuable engineering hours.
            </p>
          </div>

          <div className="glass-card p-6 border border-white/70">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1B133C]">Branch Drift & Merges</h3>
            <p className="text-xs text-[#1B133C]/70 mt-2 leading-relaxed">
              Dozens of staging PRs accumulating merge conflicts, while product marketers wait days just to launch a simple seasonal promo banner.
            </p>
          </div>

          <div className="glass-card p-6 border border-white/70">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1B133C]">Terrifying Rollbacks</h3>
            <p className="text-xs text-[#1B133C]/70 mt-2 leading-relaxed">
              When a release causes unexpected regressions, rolling back with destructive git resets often wipes out unrelated fixes and corrupts CI state.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3: HOW PATCHWORK WORKS & VISUAL PATCHING */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-5xl px-4 py-20 border-t border-black/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">The Architecture</span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1B133C] mt-2">
            A visual layer over your existing repository
          </h2>
          <p className="text-sm text-[#1B133C]/70 mt-4 leading-relaxed">
            PATCHWORK does not force you to migrate to a proprietary CMS. Your codebase stays 100% on GitHub, Vercel, or Netlify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1B133C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1B133C]">Connect GitHub & Deployment Provider</h4>
                <p className="text-xs text-[#1B133C]/70 mt-1 leading-relaxed">
                  Authenticate your workspace with our GitHub App and link your Vercel or Netlify project. We verify project ownership cryptographically.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1B133C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1B133C]">Edit Visually in Chrome Extension</h4>
                <p className="text-xs text-[#1B133C]/70 mt-1 leading-relaxed">
                  Open your live website with the companion extension. Click any DOM element, adjust styles or invoke AI copy rewrites. The extension emits atomic patches.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#1B133C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1B133C]">Control Plane Review & 12-Step QA</h4>
                <p className="text-xs text-[#1B133C]/70 mt-1 leading-relaxed">
                  The PATCHWORK dashboard spins up an isolated preview, executes automated build, lint, typecheck, and visual regression tests before team sign-off.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                4
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1B133C]">Instant Deploy & Safe Revert</h4>
                <p className="text-xs text-[#1B133C]/70 mt-1 leading-relaxed">
                  Approve and promote to production in seconds. If a metric dips, restore the previous stable version immediately with a clean revert commit.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-white/80 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <span className="text-xs font-semibold text-[#1B133C]">Two Products. One Unified Flow.</span>
              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Native Pair</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-black/5 space-y-3">
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-[#1B133C]">1. PATCHWORK Web Control Plane</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Central command dashboard for repos, patch lifecycle, review, verification, deployments, audit logs, and conflict resolution.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-black/5 space-y-3">
              <div className="flex items-center gap-2">
                <Puzzle className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-[#1B133C]">2. PATCHWORK Chrome Extension</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                First-class visual editing client connecting via short-lived pairing tokens to inspect DOM elements, tweak styles, and push patches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5: AI & AUTOMATED VERIFICATION */}
      <section id="developers" className="relative z-10 mx-auto max-w-5xl px-4 py-20 border-t border-black/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 border border-white/80">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-[#1B133C]">AI Patch Plans with Guardrails</h3>
            <p className="text-xs text-[#1B133C]/75 mt-3 leading-relaxed">
              AI shouldn&apos;t run arbitrary code in production. When you ask AI to modify an element, PATCHWORK constructs a structured <strong>PatchPlan</strong> detailing affected files, risk factors, and dependencies for human approval.
            </p>
            <div className="mt-5 p-3 rounded-lg bg-black/5 text-[11px] font-mono space-y-1 text-slate-800">
              <div>// Structured AI Proposal</div>
              <div>&#123; risk: "LOW", affected: ["HeroCTA"], match: 98.7% &#125;</div>
            </div>
          </div>

          <div className="glass-card p-8 border border-white/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl text-[#1B133C]">12-Step Automated Verification</h3>
            <p className="text-xs text-[#1B133C]/75 mt-3 leading-relaxed">
              Every patch undergoes automated compilation, TypeScript checks, ESLint, hydration tests, link validation, multi-viewport responsive checks, and perceptual visual regression comparisons before deploy.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {['Build', 'Typecheck', 'Lint', 'Hydration', 'Visual Diff', 'Console QA'].map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 & 7: SECURITY & ROLLBACK */}
      <section id="security" className="relative z-10 mx-auto max-w-5xl px-4 py-20 border-t border-black/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Enterprise Ready</span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1B133C] mt-2">
            Security & Zero-Regret Rollbacks
          </h2>
          <p className="text-sm text-[#1B133C]/70 mt-4 leading-relaxed">
            Never trust "this is my website". PATCHWORK validates repository ownership, enforces RBAC, keeps tokens server-side, and records every mutation in immutable audit logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-card p-6 border border-white/80">
            <Lock className="w-5 h-5 text-indigo-600 mb-3" />
            <h4 className="text-sm font-bold text-[#1B133C]">Server-Side Secrets Only</h4>
            <p className="text-xs text-[#1B133C]/70 mt-2 leading-relaxed">
              GitHub tokens, Vercel credentials, and AI keys are never sent to the browser extension. The extension communicates via scoped short-lived pairing tokens.
            </p>
          </div>

          <div className="glass-card p-6 border border-white/80">
            <RotateCcw className="w-5 h-5 text-rose-600 mb-3" />
            <h4 className="text-sm font-bold text-[#1B133C]">Non-Destructive Rollback</h4>
            <p className="text-xs text-[#1B133C]/70 mt-2 leading-relaxed">
              Rollbacks never use destructive <code className="font-mono text-[10px]">git reset --hard</code>. We create an atomic revert commit and trigger a clean redeploy.
            </p>
          </div>

          <div className="glass-card p-6 border border-white/80">
            <Users className="w-5 h-5 text-blue-600 mb-3" />
            <h4 className="text-sm font-bold text-[#1B133C]">Multiplayer Presence</h4>
            <p className="text-xs text-[#1B133C]/70 mt-2 leading-relaxed">
              Realtime cursor identities, active routes, and element collision prevention ensure team members never overwrite each other&apos;s patches.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: PRICING */}
      <section id="pricing" className="scroll-mt-24 relative z-10 mx-auto max-w-6xl px-4 py-20 border-t border-black/10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Transparent Pricing</span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#1B133C] mt-2">
            Predictable plans for every scale
          </h2>
          <p className="text-sm text-[#1B133C]/70 mt-4 leading-relaxed">
            Start free and upgrade as your team grows. Flexible plans for individual developers, small agencies, and enterprise organizations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* PLAN 1: FREE */}
          <div className="glass-card flex flex-col justify-between p-6 sm:p-7 border border-white/80 rounded-2xl bg-white/70 backdrop-blur-md shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-medium text-[#1B133C]">Free</h3>
              </div>
              <p className="text-xs text-[#1B133C]/70 mt-2 min-h-[36px] leading-relaxed">
                For students and developers getting started with AXON.
              </p>
              <div className="mt-5 pb-5 border-b border-black/5">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-normal text-[#1B133C]">₹0</span>
                  <span className="text-xs text-[#1B133C]/60 font-medium">/month</span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-semibold text-[#1B133C]/80 uppercase tracking-wider mb-3">
                  Features:
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Access to the core AXON experience.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Basic visual editing, where currently supported.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Basic patch management, where currently supported.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Suitable for trying the platform.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-black/5">
              <Link
                href="/signup"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-[#1B133C] hover:bg-slate-50 transition-all shadow-2xs"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* PLAN 2: PRO */}
          <div className="glass-card flex flex-col justify-between p-6 sm:p-7 border border-white/80 rounded-2xl bg-white/70 backdrop-blur-md shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-medium text-[#1B133C]">Pro</h3>
              </div>
              <p className="text-xs text-[#1B133C]/70 mt-2 min-h-[36px] leading-relaxed">
                For individual developers managing regular website changes.
              </p>
              <div className="mt-5 pb-5 border-b border-black/5">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-normal text-[#1B133C]">₹499</span>
                  <span className="text-xs text-[#1B133C]/60 font-medium">/month</span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-semibold text-[#1B133C]/80 uppercase tracking-wider mb-3">
                  Features:
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Everything in Free.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Higher project and patch limits, if supported.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Extended patch history, if supported.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>AI-assisted editing suggestions, when available.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>More advanced editing and change-management tools as they become available.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-black/5">
              <Link
                href="/signup?plan=pro"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-[#1B133C] hover:bg-slate-50 transition-all shadow-2xs"
              >
                <span>Choose Pro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* PLAN 3: TEAM (RECOMMENDED) */}
          <div className="glass-card flex flex-col justify-between p-6 sm:p-7 border-2 border-[#1B133C] rounded-2xl bg-white/95 shadow-xl relative scale-[1.02] transition-all">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1B133C] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              RECOMMENDED
            </span>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-medium text-[#1B133C]">Team</h3>
              </div>
              <p className="text-xs text-[#1B133C]/70 mt-2 min-h-[36px] leading-relaxed">
                For development teams and small agencies managing multiple websites.
              </p>
              <div className="mt-5 pb-5 border-b border-black/5">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl sm:text-4xl font-normal text-[#1B133C]">₹2,499</span>
                  <span className="text-xs text-[#1B133C]/60 font-medium">/month</span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-semibold text-[#1B133C]/80 uppercase tracking-wider mb-3">
                  Features:
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Everything in Pro.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Shared team workspaces, when available.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Patch review and approval workflows, when available.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Team activity history, when available.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Conflict detection and change tracking, when available.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-black/5">
              <Link
                href="/signup?plan=team"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1B133C] px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-black transition-all hover:scale-[1.01]"
              >
                <span>Choose Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* PLAN 4: ENTERPRISE */}
          <div className="glass-card flex flex-col justify-between p-6 sm:p-7 border border-white/80 rounded-2xl bg-white/70 backdrop-blur-md shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-medium text-[#1B133C]">Enterprise</h3>
              </div>
              <p className="text-xs text-[#1B133C]/70 mt-2 min-h-[36px] leading-relaxed">
                For organizations with advanced workflow and management requirements.
              </p>
              <div className="mt-5 pb-5 border-b border-black/5">
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl sm:text-3xl font-normal text-[#1B133C]">Custom pricing</span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-[11px] font-semibold text-[#1B133C]/80 uppercase tracking-wider mb-3">
                  Features:
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Custom project and team requirements.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Advanced access controls, where available.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Audit and reporting capabilities, where available.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Integration options, subject to technical feasibility.</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs text-[#1B133C]/75 leading-snug">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Customized onboarding and support, when available.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-black/5">
              <a
                href="mailto:sales@axon.dev"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/15 bg-white px-4 py-2.5 text-xs font-semibold text-[#1B133C] hover:bg-slate-50 transition-all shadow-2xs"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="glass-card p-10 sm:p-14 border border-white/90 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs font-semibold text-indigo-700 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Start patching in under 2 minutes
          </div>
          <h2 className="font-serif text-4xl sm:text-6xl text-[#1B133C] leading-tight">
            Stop waiting on rebuilds.
            <span className="block italic text-[#1B133C]/80">Start shipping visual patches.</span>
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-xs sm:text-sm text-[#1B133C]/70 leading-relaxed">
            Connect your GitHub and Vercel/Netlify repository today. Preview every modification, verify with automated QA, and hotfix your production website with confidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1B133C] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-black transition-all hover:scale-[1.02]"
            >
              <span>Get Started with Axon</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-black/15 bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#1B133C] shadow-2xs hover:bg-white transition-all"
            >
              <span>Explore Demo Workspace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-black/10 py-10 text-center text-xs text-[#1B133C]/60">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PatchworkLogo size="sm" />
            <span>© {new Date().getFullYear()} PATCHWORK, Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-[#1B133C]">Dashboard</Link>
            <Link href="/extension/connect" className="hover:text-[#1B133C]">Chrome Extension</Link>
            <Link href="/settings" className="hover:text-[#1B133C]">Settings</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1B133C]">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
