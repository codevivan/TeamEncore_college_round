import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  Building2,
  Users2,
  Boxes,
  Puzzle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface SettingsNavProps {
  currentTab?: string;
}

export function SettingsNav({ currentTab }: SettingsNavProps) {
  const [location] = useLocation();

  const tabs = [
    { label: 'Workspace', href: '/settings/workspace', icon: Building2 },
    { label: 'Team & Members', href: '/settings/team', icon: Users2 },
    { label: 'Integrations', href: '/settings/integrations', icon: Boxes, badge: '4' },
    { label: 'Chrome Extension', href: '/settings/extension', icon: Puzzle },
    { label: 'AI Guardrails', href: '/settings/ai', icon: Sparkles },
    { label: 'Security & Audit', href: '/settings/security', icon: ShieldCheck },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-[#1B133C]/10 pb-px overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          (currentTab && currentTab === tab.label.toLowerCase()) ||
          location === tab.href ||
          (tab.href === '/settings/integrations' && location.startsWith('/settings/integrations')) ||
          (tab.href === '/settings/workspace' && location === '/settings');

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap border-b-2 ${
              isActive
                ? 'border-[#1B133C] text-[#1B133C] bg-white/70'
                : 'border-transparent text-[#1B133C]/60 hover:text-[#1B133C] hover:bg-black/[0.02]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-[#1B133C] text-white' : 'bg-black/5 text-[#1B133C]/70'
              }`}>
                {tab.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
