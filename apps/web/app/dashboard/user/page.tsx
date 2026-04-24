"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ApiResponse, CampaignStatus } from "@earnify/shared";

import { Badge, resolveBadges } from "../../../components/Badge";
import { CampaignCard } from "../../../components/CampaignCard";
import { EmptyState } from "../../../components/EmptyState";
import { Skeleton } from "../../../components/Skeleton";
import { useAuth } from "../../../components/auth/AuthProvider";
import { withAuth } from "../../../components/auth/withAuth";
import { useToast } from "../../../components/toast/ToastProvider";
import { ConnectWalletButton } from "../../../components/wallet/ConnectWalletButton";
import { useWallet } from "../../../components/wallet/WalletProvider";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type MyEarningsCampaign = {
  campaignId: string;
  campaignTitle: string;
  posts: number;
  currentScore: number;
  totalCampaignScore: number;
  campaignBudget: number;
  estimatedPayout: number;
  lastUpdatedAt: string;
};

type UserPayoutEntry = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  stellarTxHash: string | null;
  stellarTxUrl: string | null;
  createdAt: string;
};

type UserPayoutHistory = {
  userId: string;
  walletAddress: string | null;
  payouts: UserPayoutEntry[];
};

type DashboardCampaign = {
  id: string;
  title: string;
  description: string;
  totalBudget: number;
  remainingBudget: number;
  status: CampaignStatus;
  postCount: number;
};

function hashUserId(userId: string) {
  let hash = 0;

  for (const char of userId) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997;
  }

  return hash;
}

function DashboardPage() {
  const { user, switchRole } = useAuth();
  const { pushToast } = useToast();
  const { walletAddress: freighterAddress, isConnected: walletConnected } = useWallet();

  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([]);
  const [earnings, setEarnings] = useState<MyEarningsCampaign[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<UserPayoutHistory | null>(null);

  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [loadingPayoutHistory, setLoadingPayoutHistory] = useState(true);

  const [claimingPayoutId, setClaimingPayoutId] = useState<string | null>(null);
  const [switchingRole, setSwitchingRole] = useState(false);

  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [earningsError, setEarningsError] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const seenCompletedPayoutsRef = useRef<Set<string>>(new Set());

  // The effective wallet address: prefer Freighter (live), fall back to DB value
  const effectiveWalletAddress = freighterAddress ?? payoutHistory?.walletAddress ?? null;

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);

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

        setCampaigns(payload.data);
      } catch {
        setCampaignError("Failed to load campaigns");
      } finally {
        setLoadingCampaigns(false);
      }
    };

    void fetchCampaigns();
  }, []);

  useEffect(() => {
    if (user?.role !== "USER") {
      setEarnings([]);
      setLoadingEarnings(false);
      setEarningsError(null);
      return;
    }

    const fetchEarnings = async () => {
      setLoadingEarnings(true);

      try {
        const response = await fetch(`${apiBaseUrl}/api/dashboard/earnings`, {
          method: "GET",
          credentials: "include"
        });

        const payload = (await response.json()) as ApiResponse<MyEarningsCampaign[]>;

        if (!response.ok || !payload.success || !payload.data) {
          setEarningsError(payload.error ?? "Failed to load earnings");
          return;
        }

        setEarnings(payload.data);
      } catch {
        setEarningsError("Failed to load earnings");
      } finally {
        setLoadingEarnings(false);
      }
    };

    void fetchEarnings();
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "USER" || !user.id) {
      setPayoutHistory(null);
      setLoadingPayoutHistory(false);
      setPayoutError(null);
      return;
    }

    const fetchPayoutHistory = async () => {
      setLoadingPayoutHistory(true);
      setPayoutError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/users/${user.id}/payouts`, {
          method: "GET",
          credentials: "include"
        });

        const payload = (await response.json()) as ApiResponse<UserPayoutHistory>;

        if (!response.ok || !payload.success || !payload.data) {
          setPayoutError(payload.error ?? "Failed to load payout history");
          return;
        }

        setPayoutHistory(payload.data);
      } catch {
        setPayoutError("Failed to load payout history");
      } finally {
        setLoadingPayoutHistory(false);
      }
    };

    void fetchPayoutHistory();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!payoutHistory) {
      return;
    }

    for (const payout of payoutHistory.payouts) {
      if (payout.status === "COMPLETED" && !seenCompletedPayoutsRef.current.has(payout.id)) {
        seenCompletedPayoutsRef.current.add(payout.id);
      }
    }
  }, [payoutHistory]);

  const claimPendingPayout = async (campaignId: string, payoutId: string) => {
    if (!user?.id) {
      return;
    }

    setClaimingPayoutId(payoutId);
    setPayoutError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/users/${user.id}/payouts/${campaignId}/claim`, {
        method: "POST",
        credentials: "include"
      });

      const payload = (await response.json()) as ApiResponse<{
        id: string;
        status: "COMPLETED" | "FAILED";
        stellarTxHash?: string | null;
        stellarTxUrl?: string | null;
      }>;

      if (!response.ok || !payload.success || !payload.data) {
        setPayoutError(payload.error ?? "Failed to claim payout");
        return;
      }

      const claimed = payload.data;

      setPayoutHistory((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          payouts: previous.payouts.map((payout) =>
            payout.id === claimed.id
              ? {
                  ...payout,
                  status: claimed.status,
                  stellarTxHash: claimed.stellarTxHash ?? null,
                  stellarTxUrl: claimed.stellarTxUrl ?? null
                }
              : payout
          )
        };
      });

      if (claimed.status === "COMPLETED") {
        seenCompletedPayoutsRef.current.add(claimed.id);
        pushToast({
          type: "success",
          title: "Payout received",
          message: "Your XLM transfer was confirmed on Stellar testnet."
        });
      } else {
        pushToast({
          type: "warning",
          title: "Payout pending review",
          message: "The payout was attempted but did not complete."
        });
      }
    } catch {
      setPayoutError("Failed to claim payout");
    } finally {
      setClaimingPayoutId(null);
    }
  };

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const timestampFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const formatXlm = (value: number) => currencyFormatter.format(value);

  const formatTimestamp = (value: string) => {
    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? value : timestampFormatter.format(parsed);
  };

  const profileBadges = useMemo(() => {
    const campaignCount = earnings.filter((entry) => entry.posts > 0).length;
    const maxPostScore = earnings.reduce((max, entry) => Math.max(max, entry.currentScore), 0);
    const pseudoEarlyRank = user?.id ? (hashUserId(user.id) % 250) + 1 : undefined;

    return resolveBadges({
      campaignCount,
      maxPostScore,
      verifiedPostCount: earnings.reduce((sum, entry) => sum + entry.posts, 0),
      earlyAdopterRank: pseudoEarlyRank
    });
  }, [earnings, user?.id]);

  const handleSwitchRole = async (nextRole: "FOUNDER" | "USER") => {
    setSwitchingRole(true);
    const ok = await switchRole(nextRole);
    if (!ok) {
      pushToast({
        type: "warning",
        title: "Role update failed",
        message: "Please try again."
      });
    } else {
      pushToast({
        type: "success",
        title: "Role updated",
        message: nextRole === "FOUNDER" ? "Founder mode enabled." : "User mode enabled."
      });
      window.location.href = "/dashboard";
    }
    setSwitchingRole(false);
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[#e2e8f0] pb-20">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <header className="mb-10 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">Campaign Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Creator dashboard</h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Join campaigns, submit high-performing content, and climb the leaderboard to earn payout allocation.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {user?.role === "USER" ? (
              <button
                type="button"
                disabled={switchingRole}
                onClick={() => {
                  void handleSwitchRole("FOUNDER");
                }}
                className="rounded-full border border-[var(--color-primary)]/50 px-4 py-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:opacity-60"
              >
                {switchingRole ? "Switching..." : "Switch to Founder"}
              </button>
            ) : (
              <button
                type="button"
                disabled={switchingRole}
                onClick={() => {
                  void handleSwitchRole("USER");
                }}
                className="rounded-full border border-[var(--color-secondary)]/50 px-4 py-2 text-sm font-semibold text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 disabled:opacity-60"
              >
                {switchingRole ? "Switching..." : "Switch to User"}
              </button>
            )}
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          
          {/* Main Content (Campaigns) */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Live Campaigns</h2>
            </div>
            
            {loadingCampaigns ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`campaign-skeleton-${index}`} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6">
                    <Skeleton className="h-6 w-2/3 rounded-md bg-[#2A2D3A]" />
                    <Skeleton className="mt-4 h-4 w-full rounded-md bg-[#2A2D3A]" />
                    <Skeleton className="mt-2 h-4 w-5/6 rounded-md bg-[#2A2D3A]" />
                    <Skeleton className="mt-6 h-3 w-full rounded-full bg-[#2A2D3A]" />
                    <div className="mt-6 flex justify-between">
                      <Skeleton className="h-8 w-16 rounded-md bg-[#2A2D3A]" />
                      <Skeleton className="h-8 w-24 rounded-full bg-[#2A2D3A]" />
                    </div>
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
                      founder: { name: "Stellar Dev", avatar: "" },
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
                description="Campaigns will appear here as soon as founders launch them."
              />
            ) : null}
          </div>

          {/* Sidebar (Earnings & Payouts) */}
          {user?.role === "USER" ? (
            <aside className="space-y-6">
              
              {/* Earnings Card */}
              <div className="rounded-2xl border border-[var(--color-secondary)]/30 bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-background)] p-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Estimated Earnings</h2>
                  <span className="text-xs text-[var(--color-muted)]">Final payout on end</span>
                </div>

                <div className="text-4xl font-extrabold text-[var(--color-secondary)] mb-6">
                  {formatXlm(earnings.reduce((sum, entry) => sum + entry.estimatedPayout, 0))} <span className="text-xl">XLM</span>
                </div>

                {loadingEarnings ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-md bg-[#2A2D3A]" />
                    <Skeleton className="h-10 w-full rounded-md bg-[#2A2D3A]" />
                  </div>
                ) : earningsError ? (
                  <p className="text-sm text-[var(--color-danger)]">{earningsError}</p>
                ) : earnings.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)] text-center py-4">No verified earnings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {earnings.map((entry) => (
                      <div key={entry.campaignId} className="flex justify-between items-center rounded-lg bg-[var(--color-surface)] p-3 border border-[var(--color-border)]">
                        <div className="truncate pr-4">
                          <p className="text-sm font-semibold text-white truncate">{entry.campaignTitle}</p>
                          <p className="text-xs text-[var(--color-muted)]">{entry.posts} posts • {entry.currentScore.toFixed(1)} score</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[var(--color-secondary)]">+{formatXlm(entry.estimatedPayout)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile Badges */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-4">Profile Badges</h3>
                {profileBadges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileBadges.map((badge) => (
                      <Badge key={`profile-${badge}`} badge={badge} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-muted)]">Complete campaigns to unlock badges.</p>
                )}
              </div>

              {/* Payout History */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-muted)]">Payout History</h3>
                </div>

                <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[#0D0F14] p-4">
                  {!effectiveWalletAddress ? (
                    <div className="text-center">
                      <p className="text-xs text-[var(--color-muted)] mb-3">Connect wallet to receive payouts</p>
                      <ConnectWalletButton />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 text-center">
                      <p className="text-xs text-[var(--color-muted)]">Connected Wallet</p>
                      <p className="text-sm font-mono text-[var(--color-primary)]">
                        {effectiveWalletAddress.slice(0, 6)}...{effectiveWalletAddress.slice(-6)}
                      </p>
                      <div className="mt-2 mx-auto">
                        <ConnectWalletButton />
                      </div>
                    </div>
                  )}
                </div>

                {loadingPayoutHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-lg bg-[#2A2D3A]" />
                    <Skeleton className="h-14 w-full rounded-lg bg-[#2A2D3A]" />
                  </div>
                ) : payoutError ? (
                  <p className="text-sm text-[var(--color-danger)]">{payoutError}</p>
                ) : !payoutHistory || payoutHistory.payouts.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)] text-center">No payouts yet.</p>
                ) : (
                  <div className="space-y-3">
                    {payoutHistory.payouts.slice(0, 5).map((payout) => (
                      <div key={payout.id} className="flex justify-between items-center rounded-lg border border-[var(--color-border)] bg-[#0D0F14] p-3">
                        <div className="truncate pr-2">
                          <p className="text-xs font-semibold text-white truncate">{payout.campaignTitle}</p>
                          <p className="text-xs font-mono text-[var(--color-secondary)]">{formatXlm(payout.amount)} XLM</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${payout.status === 'COMPLETED' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : payout.status === 'FAILED' ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]' : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'}`}>
                            {payout.status}
                          </span>
                          
                          {payout.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => claimPendingPayout(payout.campaignId, payout.id)}
                              disabled={claimingPayoutId === payout.id || !effectiveWalletAddress}
                              className="text-[10px] bg-[var(--color-primary)] text-white px-2 py-0.5 rounded hover:bg-opacity-80 disabled:opacity-50"
                            >
                              {claimingPayoutId === payout.id ? "..." : "Claim"}
                            </button>
                          )}
                          
                          {payout.stellarTxUrl && (
                            <a href={payout.stellarTxUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[var(--color-primary)] hover:underline">
                              Tx ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          ) : null}
          
        </div>
      </section>
    </main>
  );
}

export default withAuth(DashboardPage, { role: "USER" });
