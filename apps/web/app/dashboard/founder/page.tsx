"use client";

import { useEffect, useMemo, useState } from "react";

import type { ApiResponse, CampaignStatus } from "@earnify/shared";

import { CampaignCard } from "../../../components/CampaignCard";
import { EmptyState } from "../../../components/EmptyState";
import { Skeleton } from "../../../components/Skeleton";
import { useAuth } from "../../../components/auth/AuthProvider";
import { withAuth } from "../../../components/auth/withAuth";
import { useToast } from "../../../components/toast/ToastProvider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type DashboardCampaign = {
  id: string;
  title: string;
  description: string;
  totalBudget: number;
  remainingBudget: number;
  status: CampaignStatus;
  postCount: number;
  founderId: string;
};

function FounderDashboardPage() {
  const { user, switchRole } = useAuth();
  const { pushToast } = useToast();

  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [switchingRole, setSwitchingRole] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);
      setCampaignError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/campaigns`, {
          method: "GET",
          credentials: "include"
        });

        const payload = (await response.json()) as ApiResponse<DashboardCampaign[]>;

        if (!response.ok || !payload.success || !payload.data) {
          setCampaignError(payload.error ?? "Failed to load campaigns");
          return;
        }

        const ownCampaigns = payload.data.filter((campaign) => campaign.founderId === user?.id);
        setCampaigns(ownCampaigns);
      } catch {
        setCampaignError("Failed to load campaigns");
      } finally {
        setLoadingCampaigns(false);
      }
    };

    void fetchCampaigns();
  }, [user?.id]);

  const stats = useMemo(() => {
    const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.totalBudget, 0);
    const activeCount = campaigns.filter((campaign) => campaign.status === "ACTIVE").length;
    const endedCount = campaigns.filter((campaign) => campaign.status === "ENDED").length;
    const totalParticipants = campaigns.reduce((sum, campaign) => sum + campaign.postCount, 0);

    return {
      totalBudget,
      activeCount,
      endedCount,
      totalParticipants
    };
  }, [campaigns]);

  const handleSwitchToUser = async () => {
    setSwitchingRole(true);
    const ok = await switchRole("USER");

    if (!ok) {
      pushToast({
        type: "warning",
        title: "Role update failed",
        message: "Please try again."
      });
    } else {
      pushToast({
        type: "success",
        title: "User mode enabled",
        message: "Redirecting to creator dashboard."
      });
      window.location.href = "/dashboard";
    }

    setSwitchingRole(false);
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[#e2e8f0] pb-20">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <header className="mb-6 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">Founder Console</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Founder dashboard</h1>
          <p className="mt-4 max-w-3xl text-lg text-[var(--color-muted)]">
            Manage your campaigns, end them anytime for testing, and distribute pool shares to participant wallets.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/campaign/create"
              className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              + Create Campaign
            </a>
            <button
              type="button"
              onClick={() => {
                void handleSwitchToUser();
              }}
              disabled={switchingRole}
              className="rounded-full border border-[var(--color-secondary)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 disabled:opacity-60"
            >
              {switchingRole ? "Switching..." : "Switch to User"}
            </button>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Total Campaigns</p>
            <p className="mt-2 text-2xl font-bold text-white">{campaigns.length}</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Active</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-success)]">{stats.activeCount}</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Ended</p>
            <p className="mt-2 text-2xl font-bold text-white">{stats.endedCount}</p>
          </article>
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Total Budget</p>
            <p className="mt-2 text-2xl font-bold text-[var(--color-primary)]">{stats.totalBudget.toFixed(2)} XLM</p>
          </article>
        </div>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Your campaigns</h2>
            <p className="text-xs text-[var(--color-muted)]">Participants joined: {stats.totalParticipants}</p>
          </div>

          {loadingCampaigns ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`founder-campaign-skeleton-${index}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6">
                  <Skeleton className="h-6 w-2/3 rounded-md bg-[#2A2D3A]" />
                  <Skeleton className="mt-4 h-4 w-full rounded-md bg-[#2A2D3A]" />
                  <Skeleton className="mt-2 h-4 w-5/6 rounded-md bg-[#2A2D3A]" />
                  <Skeleton className="mt-6 h-3 w-full rounded-full bg-[#2A2D3A]" />
                </div>
              ))}
            </div>
          ) : null}

          {campaignError ? <p className="text-sm text-[var(--color-danger)]">{campaignError}</p> : null}

          {!loadingCampaigns && !campaignError && campaigns.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={{
                    id: campaign.id,
                    title: campaign.title,
                    description: campaign.description,
                    budgetTotal: campaign.totalBudget,
                    budgetRemaining: campaign.remainingBudget,
                    participants: campaign.postCount,
                    founder: { name: user?.name ?? "Founder", avatar: user?.avatar ?? "" },
                    platforms: ["X", "LinkedIn", "Instagram"],
                    daysLeft: 7
                  }}
                />
              ))}
            </div>
          ) : null}

          {!loadingCampaigns && !campaignError && campaigns.length === 0 ? (
            <EmptyState
              variant="campaigns"
              title="No campaigns yet"
              description="Create your first campaign to start collecting participants and payouts."
            />
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default withAuth(FounderDashboardPage, { role: "FOUNDER" });
