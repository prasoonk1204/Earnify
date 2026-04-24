import type { CampaignStatus } from "@earnify/shared";

const statusLabelMap: Record<CampaignStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  ENDED: "Ended"
};

const statusStyleMap: Record<CampaignStatus, { text: string; background: string; glow: string }> = {
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
