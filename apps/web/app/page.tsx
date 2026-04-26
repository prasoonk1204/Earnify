"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse, CampaignStatus } from "@earnify/shared";

import { CampaignCard } from "../components/CampaignCard";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type LandingCampaign = {
  id: string;
  title: string;
  description: string;
  totalBudget: number;
  remainingBudget: number;
  status: CampaignStatus;
  postCount: number;
  platforms: string[];
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  founder?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
};

function classifyCampaigns(campaigns: LandingCampaign[]) {
  const now = Date.now();

  const isEndedByDate = (campaign: LandingCampaign) => {
    if (!campaign.endDate) return false;
    const end = new Date(campaign.endDate);
    return !Number.isNaN(end.getTime()) && end.getTime() <= now;
  };

  const live = campaigns.filter((campaign) => campaign.status === "ACTIVE" && !isEndedByDate(campaign));

  const ended = campaigns.filter(
    (campaign) => campaign.status === "ENDED" || campaign.status === "COMPLETED" || isEndedByDate(campaign)
  );

  const upcoming = campaigns.filter(
    (campaign) => !live.some((entry) => entry.id === campaign.id) && !ended.some((entry) => entry.id === campaign.id)
  );

  return {
    live,
    upcoming,
    ended
  };
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<LandingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/campaigns`, {
          method: "GET",
          credentials: "include"
        });

        const payload = (await response.json()) as ApiResponse<LandingCampaign[]>;

        if (!response.ok || !payload.success || !payload.data) {
          setError(payload.error ?? "Unable to load campaigns");
          return;
        }

        setCampaigns(payload.data);
      } catch {
        setError("Unable to load campaigns");
      } finally {
        setLoading(false);
      }
    };

    void fetchCampaigns();
  }, []);

  const segmented = useMemo(() => classifyCampaigns(campaigns), [campaigns]);

  const liveBudget = useMemo(
    () => segmented.live.reduce((sum, campaign) => sum + campaign.totalBudget, 0),
    [segmented.live]
  );

  const activeParticipants = useMemo(
    () => segmented.live.reduce((sum, campaign) => sum + campaign.postCount, 0),
    [segmented.live]
  );

  return (
    <main className="min-h-screen pb-20 text-zinc-100">
      <section className="motion-rise mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-20 pt-20 lg:px-8 lg:pt-28">
        <div className="max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Earnify Network</p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Performance marketing on-chain, designed for real creators.
          </h1>
          <p className="max-w-2xl text-base text-zinc-400 sm:text-lg">
            Launch funded campaigns, reward verified engagement, and track payouts with transparent campaign states in real time.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center border border-[var(--color-primary)] bg-[var(--color-primary)] px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-black transition-colors hover:bg-[var(--color-accent)]"
            >
              Explore Dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center border border-zinc-700 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <article className="surface-card rounded-sm p-5 motion-fade-delay">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Live Campaigns</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-100">{segmented.live.length}</p>
          </article>
          <article className="surface-card rounded-sm p-5 motion-fade-delay">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Live Budget Pool</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-primary)]">{liveBudget.toFixed(0)} XLM</p>
          </article>
          <article className="surface-card rounded-sm p-5 motion-fade-delay">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Active Participants</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-100">{activeParticipants}</p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl space-y-14 px-6 lg:px-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-100">Live Campaigns</h2>
          <p className="text-sm text-zinc-500">Only campaigns that are currently active are shown here.</p>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`home-live-skeleton-${index}`} className="surface-card rounded-sm p-6">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="mt-4 h-6 w-11/12" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-7 h-10 w-full" />
                  <Skeleton className="mt-6 h-9 w-full" />
                </div>
              ))}
            </div>
          ) : null}

          {!loading && error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}

          {!loading && !error && segmented.live.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {segmented.live.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={{
                    id: campaign.id,
                    title: campaign.title,
                    description: campaign.description,
                    founder: campaign.founder,
                    platforms: campaign.platforms,
                    budgetTotal: campaign.totalBudget,
                    budgetRemaining: campaign.remainingBudget,
                    participants: campaign.postCount,
                    status: campaign.status,
                    endDate: campaign.endDate,
                    startDate: campaign.startDate,
                    createdAt: campaign.createdAt
                  }}
                />
              ))}
            </div>
          ) : null}

          {!loading && !error && segmented.live.length === 0 ? (
            <EmptyState
              variant="campaigns"
              title="No live campaigns"
              description="New campaigns will appear here once founders activate them."
            />
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-zinc-100">Upcoming</h3>
            {segmented.upcoming.length === 0 ? (
              <p className="surface-card rounded-sm p-4 text-sm text-zinc-500">No upcoming campaigns right now.</p>
            ) : (
              <div className="space-y-3">
                {segmented.upcoming.slice(0, 3).map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaign/${campaign.id}`}
                    className="surface-card flex items-center justify-between rounded-sm p-4 transition-colors hover:border-[var(--color-primary)]/40"
                  >
                    <span className="font-medium text-zinc-100">{campaign.title}</span>
                    <span className="text-xs uppercase tracking-[0.08em] text-zinc-500">{campaign.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-zinc-100">Ended</h3>
            {segmented.ended.length === 0 ? (
              <p className="surface-card rounded-sm p-4 text-sm text-zinc-500">No ended campaigns yet.</p>
            ) : (
              <div className="space-y-3">
                {segmented.ended.slice(0, 3).map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaign/${campaign.id}`}
                    className="surface-card flex items-center justify-between rounded-sm p-4 transition-colors hover:border-zinc-500"
                  >
                    <span className="font-medium text-zinc-300">{campaign.title}</span>
                    <span className="text-xs uppercase tracking-[0.08em] text-zinc-500">Ended</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
