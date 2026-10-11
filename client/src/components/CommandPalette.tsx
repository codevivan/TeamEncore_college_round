import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { usePatchworkStore } from '@/lib/patchworkStore';
import {
  Sparkles,
  GitPullRequest,
  FolderGit2,
  Rocket,
  ShieldCheck,
  History,
  RotateCcw,
  Users,
  Settings,
  Puzzle,
  ExternalLink,
  PlusCircle,
  FileCode,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { projects, patches, deployments, versions } = usePatchworkStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search projects, patches, versions (Ctrl+K)..." />
      <CommandList className="max-h-[380px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Navigation Commands */}
        <CommandGroup heading="Actions & Tools">
          {patches[0] ? (
            <CommandItem onSelect={() => navigate(`/patches/${patches[0].id}`)}>
              <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Open Active Patch {patches[0].id} ({patches[0].title})</span>
            </CommandItem>
          ) : (
            <CommandItem onSelect={() => navigate('/patches')}>
              <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Explore Visual Patches Studio</span>
            </CommandItem>
          )}
          <CommandItem onSelect={() => navigate('/patches')}>
            <PlusCircle className="mr-2 h-4 w-4 text-emerald-600" />
            <span>Create / View All Patches</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/verification')}>
            <ShieldCheck className="mr-2 h-4 w-4 text-blue-600" />
            <span>Run Automated Verification Suite</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/deployments')}>
            <Rocket className="mr-2 h-4 w-4 text-amber-600" />
            <span>View Deployments & Previews</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/rollback')}>
            <RotateCcw className="mr-2 h-4 w-4 text-rose-600" />
            <span>Instant Rollback Control Plane</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/extension-connect')}>
            <Puzzle className="mr-2 h-4 w-4 text-purple-600" />
            <span>Pair Axon Chrome Extension</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Projects */}
        <CommandGroup heading="Projects">
          {projects.map((proj) => (
            <CommandItem key={proj.id} onSelect={() => navigate(`/projects/${proj.id}`)}>
              <FolderGit2 className="mr-2 h-4 w-4 text-slate-500" />
              <span>{proj.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">{proj.framework} • {proj.deploymentProvider}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Patches */}
        <CommandGroup heading="Patches">
          {patches.slice(0, 5).map((patch) => (
            <CommandItem key={patch.id} onSelect={() => navigate(`/patches/${patch.id}`)}>
              <GitPullRequest className="mr-2 h-4 w-4 text-indigo-500" />
              <span>{patch.id}: {patch.title}</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-slate-100 font-mono">{patch.status}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Settings & System */}
        <CommandGroup heading="Settings & Integrations">
          <CommandItem onSelect={() => navigate('/settings/integrations/github')}>
            <FileCode className="mr-2 h-4 w-4" />
            <span>GitHub App Integration</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/settings/integrations/vercel')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Vercel Integration</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/settings/integrations/netlify')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Netlify Integration</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/collaboration')}>
            <Users className="mr-2 h-4 w-4" />
            <span>Realtime Multiplayer Collaboration</span>
          </CommandItem>
          <CommandItem onSelect={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Workspace & AI Provider Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
