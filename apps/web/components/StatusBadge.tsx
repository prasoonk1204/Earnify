import type { CampaignStatus } from "@earnify/shared";

const statusLabelMap: Record<CampaignStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  ENDED: "Ended"
};

const statusStyleMap: Record<CampaignStatus, { text: string; background: string; glow: string }> = {
  DRAFT: {
    text: "text-[var(--color-accent)]",
    background: "bg-[var(--color-accent)]/10",
    glow: "shadow-[0_0_12px_-2px_rgba(6,182,212,0.35)]"
  },
  ACTIVE: {
    text: "text-[var(--color-success)]",
    background: "bg-[var(--color-success)]/10",
    glow: "shadow-[0_0_12px_-2px_rgba(16,185,129,0.4)]"
  },
  PAUSED: {
    text: "text-[#F59E0B]", // amber
    background: "bg-[#F59E0B]/10",
    glow: "shadow-[0_0_12px_-2px_rgba(245,158,11,0.4)]"
  },
  COMPLETED: {
    text: "text-[var(--color-secondary)]",
    background: "bg-[var(--color-secondary)]/10",
    glow: "shadow-[0_0_12px_-2px_rgba(16,185,129,0.35)]"
  },
  ENDED: {
    text: "text-[var(--color-muted)]",
    background: "bg-[var(--color-surface)]/80",
    glow: ""
  }
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const styles = statusStyleMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${styles.text} ${styles.background} ${styles.glow} backdrop-blur-sm`}
    >
      {status === "ACTIVE" && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span>}
      {statusLabelMap[status]}
    </span>
  );
}
