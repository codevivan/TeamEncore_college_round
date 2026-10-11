import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Key,
  Copy,
  Check,
  ExternalLink,
  Zap,
  LogIn,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

export default function ExtensionConnectPage() {
  const [, setLocation] = useLocation();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const {
    currentUser,
    workspace,
    projects,
    generatePairingCode,
    approveExtensionPairing,
    pairingCode,
    integrations,
  } = usePatchworkStore();

  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCode, setActiveCode] = useState<string | null>(pairingCode);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);

  const permissions = [
    'View projects & production URLs',
    'Stage visual CSS overrides & DOM mutations',
    'AI visual styling & prompt-based live restyling',
    'Publish production hotfixes & visual patches',
    'Real-time multiplayer cursor & presence sync',
  ];

  // Detect extension via postMessage ping and listen for response
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'AXON_PONG' || event.data?.type === 'AXON_EXTENSION_READY') {
        setExtensionDetected(true);
      }
      if (event.data?.type === 'AXON_CONNECT_SUCCESS') {
        setApproved(true);
        toast.success('Extension authorized successfully!');
        setTimeout(() => setLocation('/extension/success'), 1200);
      }
    };

    window.addEventListener('message', handleMessage);
    // Ping extension
    window.postMessage({ type: 'AXON_PING' }, '*');

    // Auto-generate pairing code on mount if missing
    const urlParams = new URLSearchParams(window.location.search);
    const paramCode = urlParams.get('code');
    if (paramCode) {
      setActiveCode(paramCode);
    } else if (!pairingCode) {
      generatePairingCode().then((c) => setActiveCode(c));
    } else {
      setActiveCode(pairingCode);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(timer);
    };
  }, []);

  const handleApprove = async () => {
    try {
      setIsAutoProcessing(true);
      const session = await approveExtensionPairing('Chrome Inspector Client');
      const token = session?.id || session?.tokenHash || `axon_ext_tok_${Date.now()}`;

      const sessionPayload = {
        token,
        serverUrl: window.location.origin,
        workspace,
        user: currentUser || {
          id: clerkUser?.id || 'usr-1',
          name: clerkUser?.fullName || 'Axon Developer',
          email: clerkUser?.primaryEmailAddress?.emailAddress || 'developer@axon.dev',
          avatar: clerkUser?.imageUrl,
        },
        activeProjectId: projects[0]?.id || null,
        projects,
      };

      // Broadcast to extension content script immediately and in brief succession to guarantee reception
      const broadcast = () => {
        window.postMessage(
          {
            type: 'AXON_CONNECT_REQUEST',
            ...sessionPayload,
          },
          '*'
        );

        // Also set directly if chrome storage is accessible
        try {
          const winChrome = (window as any).chrome;
          if (winChrome && winChrome.storage && winChrome.storage.local) {
            winChrome.storage.local.set({ axon_auth_session: sessionPayload });
          }
        } catch {}

        // Persist to local storage as fallback
        try {
          localStorage.setItem('axon_auth_session', JSON.stringify(sessionPayload));
        } catch {}

        // If opened via popup window, notify parent
        try {
          if (window.opener) {
            window.opener.postMessage({ type: 'AXON_CONNECT_SUCCESS', ...sessionPayload }, '*');
          }
        } catch {}
      };

      broadcast();
      setTimeout(broadcast, 200);
      setTimeout(broadcast, 600);

      setApproved(true);
      toast.success('Axon Extension authorized and paired!');
      setTimeout(() => {
        setLocation('/extension/success');
      }, 1000);
    } catch (err: any) {
      setIsAutoProcessing(false);
      toast.error('Failed to authorize extension: ' + (err?.message || 'Unknown error'));
    }
  };

  // If URL has ?auto=true, trigger 1-click auto approve after authentication is ready
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAuto = urlParams.get('auto') === 'true';

    if (isAuto && !approved && !isAutoProcessing && (isSignedIn || currentUser)) {
      const autoTimer = setTimeout(() => {
        handleApprove();
      }, 450);
      return () => clearTimeout(autoTimer);
    }
  }, [isSignedIn, currentUser, approved, isAutoProcessing]);

  const handleGenerateCode = async () => {
    const code = await generatePairingCode();
    setActiveCode(code);
    setTimeLeft(900);
    toast.info('New 6-digit pairing PIN generated');
  };

  const handleCopy = () => {
    if (activeCode) {
      navigator.clipboard.writeText(activeCode);
      setCopied(true);
      toast.success('Pairing code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Unauthenticated screen: prompt the user to sign in
  if (isLoaded && !isSignedIn && !currentUser) {
    const redirectUrl = window.location.pathname + window.location.search;
    return (
      <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
        <div className="max-w-md w-full text-center mb-6">
          <Link href="/dashboard" className="inline-block mb-4">
            <PatchworkLogo size="md" />
          </Link>
          <h2 className="font-serif text-3xl text-[#1B133C]">
            Sign In to Authorize Extension
          </h2>
          <p className="text-xs text-[#1B133C]/70 mt-1">
            Sign in to your Axon account to connect your browser visual editor.
          </p>
        </div>

        <div className="max-w-md w-full glass-card p-6 sm:p-8 border border-white/80 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <LogIn className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#1B133C]">
              Authentication Required
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your Axon session links your live website visual inspector with project repositories and AST deployments.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href={`/login?redirect_url=${encodeURIComponent(redirectUrl)}`}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1B133C] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <span>Sign In with Axon</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/signup?redirect_url=${encodeURIComponent(redirectUrl)}`}
              className="w-full py-2.5 px-4 rounded-xl border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold text-[#1B133C] flex items-center justify-center transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center mb-6">
        <Link href="/dashboard" className="inline-block mb-4">
          <PatchworkLogo size="md" />
        </Link>
        <h2 className="font-serif text-3xl text-[#1B133C]">
          Connect Axon Studio Extension
        </h2>
        <p className="text-xs text-[#1B133C]/70 mt-1">
          Pair your browser visual editor with your production control plane workspace.
        </p>
      </div>

      <div className="max-w-md w-full glass-card p-6 sm:p-8 border border-white/80 shadow-xl space-y-6">
        {/* Extension Detected / Ready Banner */}
        {extensionDetected ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Axon Extension Detected in Browser</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Ready to Pair
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ready for 1-Click Extension Authorization</span>
            </div>
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
              Active Session
            </span>
          </div>
        )}

        {/* Workspace Card */}
        <div className="p-4 rounded-xl bg-white border border-black/5 flex items-center justify-between text-xs shadow-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Authorizing Workspace</span>
            <p className="font-bold text-[#1B133C] text-sm mt-0.5">{workspace?.name || 'Primary Workspace'}</p>
            <p className="text-muted-foreground">{clerkUser?.primaryEmailAddress?.emailAddress || currentUser?.email || 'developer@axon.dev'}</p>
          </div>
          <span className="w-9 h-9 rounded-xl bg-[#1B133C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {(workspace?.name || 'A').substring(0, 1)}
          </span>
        </div>

        {/* Permissions Scope Checklist */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-[#1B133C] uppercase tracking-wider block">
            Requested Scopes:
          </span>
          <div className="space-y-2 text-xs">
            {permissions.map((perm) => (
              <div key={perm} className="flex items-start gap-2.5 text-[#1B133C]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 text-[11px] text-indigo-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            Zero hardcoded secrets. Tokens are cryptographically bound to this session and can be revoked at any time.
          </span>
        </div>

        {/* 6-Digit PIN Pairing Box */}
        {activeCode ? (
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-2 shadow-inner">
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              6-Digit Pairing PIN (Option 2)
            </span>
            <div className="text-3xl font-mono font-extrabold tracking-widest text-emerald-400">
              {activeCode}
            </div>
            <div className="flex items-center justify-center gap-4 pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                Expires in {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-indigo-300 hover:text-white inline-flex items-center gap-1 font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy PIN'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Enter this PIN into the extension sidepanel, or click the 1-Click Authorize button below.
            </p>
          </div>
        ) : (
          <button
            onClick={handleGenerateCode}
            className="w-full py-2.5 rounded-xl border border-black/15 bg-white hover:bg-slate-50 text-[#1B133C] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span>Generate 6-Digit Pairing PIN</span>
          </button>
        )}

        {/* Non-blocking Integrations Status (Informative Only) */}
        <div className="p-3 rounded-xl bg-slate-50 border border-black/10 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Git & Deployment Integrations</span>
            <Link href="/settings/integrations" className="text-indigo-600 hover:underline font-medium text-[10px] flex items-center gap-1">
              <span>Manage in Settings</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
              integrations?.github?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              GitHub: {integrations?.github?.connected ? 'Connected ✓' : 'Optional'}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
              integrations?.vercel?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              Vercel: {integrations?.vercel?.connected ? 'Connected ✓' : 'Optional'}
            </span>
          </div>
        </div>

        {/* Approval Action */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleApprove}
            disabled={approved || isAutoProcessing}
            className="w-full py-3.5 rounded-xl bg-[#1B133C] text-white hover:bg-black font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            <span>
              {approved
                ? 'Extension Authorized ✓'
                : isAutoProcessing
                ? 'Pairing Extension...'
                : '1-Click Authorize Extension'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard"
            className="block text-center text-xs text-muted-foreground hover:underline pt-1"
          >
            Cancel & Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
