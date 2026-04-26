import Link from "next/link";
import { BudgetBar } from "./BudgetBar";

type CampaignCardProps = {
  campaign: {
    id: string;
    title: string;
    description?: string;
    founder: {
      name: string;
      avatar: string;
    };
    platforms: string[];
    budgetTotal: number;
    budgetRemaining: number;
    participants: number;
    daysLeft: number;
  };
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentRemaining = Math.max(0, Math.min(100, (campaign.budgetRemaining / campaign.budgetTotal) * 100));

  return (
    <article className="group relative flex h-full flex-col justify-between gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-[var(--color-secondary)]/50 hover:shadow-[0_0_28px_-8px_rgba(14,165,164,0.45)]">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">
            {campaign.title}
          </h3>
          <div className="flex gap-2">
            {campaign.platforms.map((p) => (
              <span key={p} className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-background)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)]" title={p}>
                {p.charAt(0)}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
            {campaign.founder.name.charAt(0)}
          </div>
          <p className="text-sm text-[var(--color-muted)]">by <span className="font-medium text-[#e2e8f0]">{campaign.founder.name}</span></p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--color-muted)]">Budget</span>
            <span className="font-semibold text-[var(--color-secondary)]">{campaign.budgetRemaining.toLocaleString()} XLM left</span>
          </div>
          {/* Mini progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#0D0F14] border border-[var(--color-border)]">
            <div 
              className="h-full rounded-full bg-[var(--color-secondary)] transition-all duration-500" 
              style={{ width: `${percentRemaining}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <div className="flex flex-col">
          <span className="text-xs text-[var(--color-muted)]">Participants</span>
          <span className="text-sm font-semibold text-white">{campaign.participants}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-[var(--color-muted)]">Time left</span>
          <span className="text-sm font-semibold text-white">{campaign.daysLeft} days</span>
        </div>
        
        <Link
          href={`/campaign/${campaign.id}`}
          className="rounded-full bg-[var(--color-background)] border border-[var(--color-primary)]/50 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary)] hover:text-white"
        >
          Join
        </Link>
      </div>
    </article>
  );
}
