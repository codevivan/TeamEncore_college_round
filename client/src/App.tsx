import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { usePatchworkStore } from "@/lib/patchworkStore";

// Pages
import Home from "./pages/Home";
import AuthPage from "./pages/Auth";
import OnboardingPage from "./pages/Onboarding";
import DashboardPage from "./pages/Dashboard";
import ProjectsPage from "./pages/Projects";
import ProjectDetailPage from "./pages/ProjectDetail";
import PatchesPage from "./pages/Patches";
import PatchDetailPage from "./pages/PatchDetail";
import DeploymentsPage from "./pages/Deployments";
import VerificationPage from "./pages/Verification";
import ConflictsPage from "./pages/Conflicts";
import CollaborationPage from "./pages/Collaboration";
import VersionsPage from "./pages/Versions";
import RollbackPage from "./pages/Rollback";
import AuditLogsPage from "./pages/AuditLogs";

// Dedicated Settings & Integration Pages
import WorkspaceSettingsPage from "./pages/settings/WorkspaceSettings";
import TeamSettingsPage from "./pages/settings/TeamSettings";
import ExtensionSettingsPage from "./pages/settings/ExtensionSettings";
import AiSettingsPage from "./pages/settings/AiSettings";
import SecuritySettingsPage from "./pages/settings/SecuritySettings";
import IntegrationsHubPage from "./pages/integrations/IntegrationsHub";
import GitHubIntegrationPage from "./pages/integrations/GitHubIntegration";
import VercelIntegrationPage from "./pages/integrations/VercelIntegration";
import NetlifyIntegrationPage from "./pages/integrations/NetlifyIntegration";
import SupabaseIntegrationPage from "./pages/integrations/SupabaseIntegration";

// Extension Auth
import ExtensionConnectPage from "./pages/ExtensionConnect";
import ExtensionSuccessPage from "./pages/ExtensionSuccess";
import InviteAcceptPage from "./pages/InviteAccept";
import NotFound from "./pages/NotFound";

const CLERK_PUBLISHABLE_KEY =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_CLERK_PUBLISHABLE_KEY ||
      import.meta.env?.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)) ||
  "";

// Automatically synchronizes Clerk profile with Axon workspace store
function ClerkUserSync() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { switchUser, currentUser, fetchInitialState } = usePatchworkStore();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        "developer@axon.dev";
      const name =
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        (email ? email.split("@")[0] : "Axon User");
      const avatar =
        user.imageUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      const githubAccount = user.externalAccounts?.find(
        (acc: any) =>
          acc.provider === "github" ||
          acc.provider === "oauth_github" ||
          acc.providerSlug === "github" ||
          (typeof acc.provider === "string" && acc.provider.toLowerCase().includes("github"))
      );
      const githubUsername =
        (githubAccount as any)?.username ||
        (githubAccount as any)?.label ||
        (githubAccount as any)?.externalUsername ||
        (user.username && !user.username.includes("@") ? user.username : undefined) ||
        (typeof window !== "undefined" ? localStorage.getItem("axon_github_username") || undefined : undefined);

      const connectedProviders = user.externalAccounts?.map((acc: any) => acc.provider) || [];
      const isEmailVerified = user.primaryEmailAddress?.verification?.status === "verified";

      const needsUpdate =
        !currentUser ||
        currentUser.clerkId !== user.id ||
        currentUser.email !== email ||
        currentUser.name !== name ||
        currentUser.avatar !== avatar ||
        currentUser.githubUsername !== githubUsername;

      if (needsUpdate) {
        if (githubUsername && typeof window !== "undefined") {
          localStorage.setItem("axon_github_username", githubUsername);
        }
        switchUser({
          id: user.id,
          clerkId: user.id,
          name,
          email,
          avatar,
          role: "owner",
          cursorColor: currentUser?.cursorColor || "#6366F1",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          githubUsername,
          isEmailVerified,
          connectedProviders,
        });
        fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            clerkId: user.id,
            name,
            email,
            avatar,
            githubUsername,
          }),
        }).catch(() => {});
      }

      // Always synchronize fresh state for the verified Clerk user
      fetchInitialState(user.id, email);
    }
  }, [isLoaded, isSignedIn, user?.id, user?.primaryEmailAddress?.emailAddress]);

  return null;
}

function Router() {
  return (
    <Switch>
      {/* Landing */}
      <Route path="/" component={Home} />
      <Route path="/features" component={Home} />
      <Route path="/security" component={Home} />
      <Route path="/pricing" component={Home} />
      <Route path="/about" component={Home} />

      {/* Clerk Auth - Login, Signup & SSO Callback Routing */}
      <Route path="/sso-callback" component={AuthPage} />
      <Route path="/signup/sso-callback" component={AuthPage} />
      <Route path="/sign-up/sso-callback" component={AuthPage} />
      <Route path="/login/sso-callback" component={AuthPage} />
      <Route path="/sign-in/sso-callback" component={AuthPage} />
      <Route path="/signup/:rest*" component={AuthPage} />
      <Route path="/signup" component={AuthPage} />
      <Route path="/sign-up/:rest*" component={AuthPage} />
      <Route path="/sign-up" component={AuthPage} />
      <Route path="/login/:rest*" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/sign-in/:rest*" component={AuthPage} />
      <Route path="/sign-in" component={AuthPage} />

      {/* Onboarding */}
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/onboarding/github" component={OnboardingPage} />
      <Route path="/onboarding/provider" component={OnboardingPage} />
      <Route path="/onboarding/project" component={OnboardingPage} />
      <Route path="/onboarding/verify" component={OnboardingPage} />
      <Route path="/onboarding/extension" component={OnboardingPage} />

      {/* Dashboard Core Control Plane */}
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/patches" component={PatchesPage} />
      <Route path="/patches/:id" component={PatchDetailPage} />
      <Route path="/deployments" component={DeploymentsPage} />
      <Route path="/verification" component={VerificationPage} />
      <Route path="/conflicts" component={ConflictsPage} />
      <Route path="/collaboration" component={CollaborationPage} />
      <Route path="/versions" component={VersionsPage} />
      <Route path="/rollback" component={RollbackPage} />
      <Route path="/audit" component={AuditLogsPage} />
      <Route path="/notifications" component={DashboardPage} />

      {/* Dedicated Settings Routes */}
      <Route path="/settings" component={WorkspaceSettingsPage} />
      <Route path="/settings/workspace" component={WorkspaceSettingsPage} />
      <Route path="/settings/team" component={TeamSettingsPage} />
      <Route path="/settings/extension" component={ExtensionSettingsPage} />
      <Route path="/settings/ai" component={AiSettingsPage} />
      <Route path="/settings/security" component={SecuritySettingsPage} />
      <Route path="/settings/profile" component={SecuritySettingsPage} />
      <Route path="/settings/billing" component={SecuritySettingsPage} />

      {/* Distinct Dedicated Integration Sub-Routes */}
      <Route path="/settings/integrations" component={IntegrationsHubPage} />
      <Route path="/settings/integrations/github" component={GitHubIntegrationPage} />
      <Route path="/settings/integrations/vercel" component={VercelIntegrationPage} />
      <Route path="/settings/integrations/netlify" component={NetlifyIntegrationPage} />
      <Route path="/settings/integrations/supabase" component={SupabaseIntegrationPage} />

      {/* Chrome Extension Pairing & Auth */}
      <Route path="/extension/connect" component={ExtensionConnectPage} />
      <Route path="/extension-connect" component={ExtensionConnectPage} />
      <Route path="/extension/success" component={ExtensionSuccessPage} />
      <Route path="/extension/revoke" component={ExtensionConnectPage} />

      {/* Project Collaboration Invitations */}
      <Route path="/invite/:code" component={InviteAcceptPage} />
      <Route path="/invite" component={InviteAcceptPage} />

      {/* 404 Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { fetchInitialState, syncPresence } = usePatchworkStore();

  useEffect(() => {
    // Load fresh state from server on startup
    fetchInitialState();

    // Live multiplayer presence sync
    const interval = setInterval(() => {
      syncPresence();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <ClerkUserSync />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </ClerkProvider>
  );
}

export default App;
