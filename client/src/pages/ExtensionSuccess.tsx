import React from 'react';
import { Link } from 'wouter';
import { PatchworkLogo } from '@/components/PatchworkLogo';
import { CheckCircle2, ArrowRight, Laptop, Sparkles, ExternalLink } from 'lucide-react';

export default function ExtensionSuccessPage() {
  return (
    <div className="min-h-screen bg-[#f3f1ec] text-[#1B133C] py-12 px-4 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center space-y-6">
        <Link href="/dashboard" className="inline-block">
          <PatchworkLogo size="lg" />
        </Link>

        <div className="glass-card p-8 border border-white/80 shadow-xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-3xl text-[#1B133C]">
            Extension Connected!
          </h2>

          <p className="text-xs text-[#1B133C]/70 leading-relaxed">
            Your Chrome extension is now linked with your active workspace. You can now open any deployed project URL and start making visual modifications.
          </p>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 text-left space-y-2">
            <span className="font-bold block">Next steps in your workflow:</span>
            <p className="text-[11px] leading-relaxed">
              1. Open your live website (e.g. your production web app)<br />
              2. Click the Axon extension icon in Chrome<br />
              3. Select any DOM element to edit visual styles or prompt AI<br />
              4. Submit the patch to review and deploy here on the control plane.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B133C] text-white text-xs font-semibold hover:bg-black shadow-md transition-all"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
