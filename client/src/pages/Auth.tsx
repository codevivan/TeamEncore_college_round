import React, { useEffect } from 'react';
import { useLocation, Link, Redirect } from 'wouter';
import { SignIn, SignUp, useUser, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { isSignedIn, isLoaded } = useUser();

  const isCallback =
    location.includes('sso-callback') ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.includes('sso-callback') ||
        window.location.search.includes('sso_callback') ||
        window.location.pathname.endsWith('/callback')));

  const isSignUp =
    !isCallback && (location.includes('signup') || location.includes('sign-up'));

  // If already signed in and not performing an OAuth callback exchange, go straight to dashboard
  if (isLoaded && isSignedIn && !isCallback) {
    return <Redirect to="/dashboard" />;
  }

  // Handle SSO OAuth Callback seamlessly (e.g. GitHub, Google, Vercel SSO)
  if (isCallback) {
    return (
      <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] flex flex-col justify-center items-center py-12 px-4 relative selection:bg-indigo-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-purple-50/30 pointer-events-none" />
        <div className="w-full max-w-md text-center z-10 bg-white/90 backdrop-blur-md border border-black/10 shadow-xl rounded-2xl p-8 flex flex-col items-center">
          <PatchworkLogo size="md" />
          <div className="my-6 flex flex-col items-center">
            <Loader2 className="w-9 h-9 text-[#1B133C] animate-spin mb-3" />
            <h2 className="font-serif text-2xl font-normal text-[#1B133C]">
              Verifying Authentication
            </h2>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs">
              Synchronizing verified credentials with Clerk & preparing your Axon workspace...
            </p>
          </div>
          <AuthenticateWithRedirectCallback
            signInForceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
            continueSignUpUrl="/signup"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500/20">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-transparent to-purple-50/30 pointer-events-none" />

      {/* Top Bar Back Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4 z-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-[#1B133C] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <Link href="/" className="inline-block">
          <PatchworkLogo size="sm" />
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1B133C] tracking-tight">
          {isSignUp ? 'Create your Axon Studio Account' : 'Welcome back to Axon'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          {isSignUp
            ? 'Start staging visual patches and browser hotfixes in seconds.'
            : 'Sign in to access your projects, visual patches, and team presence.'}
        </p>
      </div>

      {/* Clerk Auth Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 z-10 flex justify-center">
        {isSignUp ? (
          <SignUp
            routing="path"
            path={location.includes('sign-up') ? '/sign-up' : '/signup'}
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full max-w-md shadow-2xl rounded-2xl overflow-hidden',
                card: 'border border-black/10 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl p-6 sm:p-8',
                headerTitle: 'font-serif text-2xl text-[#1B133C]',
                headerSubtitle: 'text-xs text-muted-foreground',
                formButtonPrimary:
                  'bg-[#1B133C] hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.01]',
                socialButtonsBlockButton:
                  'border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl py-2.5 shadow-2xs transition-all hover:scale-[1.01]',
                formFieldInput:
                  'rounded-xl border border-black/10 text-xs py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
                footerActionLink: 'text-indigo-600 font-semibold hover:underline',
              },
            }}
          />
        ) : (
          <SignIn
            routing="path"
            path={location.includes('sign-in') ? '/sign-in' : '/login'}
            signUpUrl="/signup"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full max-w-md shadow-2xl rounded-2xl overflow-hidden',
                card: 'border border-black/10 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl p-6 sm:p-8',
                headerTitle: 'font-serif text-2xl text-[#1B133C]',
                headerSubtitle: 'text-xs text-muted-foreground',
                formButtonPrimary:
                  'bg-[#1B133C] hover:bg-black text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.01]',
                socialButtonsBlockButton:
                  'border border-black/10 bg-white hover:bg-slate-50 text-xs font-semibold rounded-xl py-2.5 shadow-2xs transition-all hover:scale-[1.01]',
                formFieldInput:
                  'rounded-xl border border-black/10 text-xs py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
                footerActionLink: 'text-indigo-600 font-semibold hover:underline',
              },
            }}
          />
        )}
      </div>

      {/* Security attestation */}
      <div className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 z-10">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Enterprise authentication powered by Clerk • SOC2 Type II Certified</span>
      </div>
    </div>
  );
}
