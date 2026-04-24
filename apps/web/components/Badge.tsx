type EarnifyBadgeType = "Top Performer" | "Verified Creator" | "Viral Post" | "5-Campaign Pro" | "Early Adopter";

type BadgeSignals = {
  rank?: number;
  verifiedPostCount?: number;
  maxPostScore?: number;
  campaignCount?: number;
  earlyAdopterRank?: number;
};

type BadgeProps = {
  badge: EarnifyBadgeType;
  compact?: boolean;
};

const badgeMeta: Record<
  EarnifyBadgeType,
  {
    label: string;
    icon: string;
    textColor: string;
    background: string;
    glowColor: string;
  }
> = {
  "Top Performer": {
    label: "Top Performer",
    icon: "🔥",
    textColor: "text-[#F59E0B]", // amber
    background: "bg-[#F59E0B]/10",
    glowColor: "shadow-[0_0_10px_-2px_rgba(245,158,11,0.3)]",
  },
  "Verified Creator": {
    label: "Verified Creator",
    icon: "✔",
    textColor: "text-[#10B981]", // success
    background: "bg-[#10B981]/10",
    glowColor: "shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]",
  },
  "Viral Post": {
    label: "Viral Post",
    icon: "🚀",
    textColor: "text-[#6366F1]", // primary
    background: "bg-[#6366F1]/10",
    glowColor: "shadow-[0_0_10px_-2px_rgba(99,102,241,0.3)]",
  },
  "5-Campaign Pro": {
    label: "5-Campaign Pro",
    icon: "🏆",
    textColor: "text-[#8B5CF6]", // purple
    background: "bg-[#8B5CF6]/10",
    glowColor: "shadow-[0_0_10px_-2px_rgba(139,92,246,0.3)]",
  },
  "Early Adopter": {
    label: "Early Adopter",
    icon: "⭐",
    textColor: "text-[#94A3B8]", // muted
    background: "bg-[#94A3B8]/10",
    glowColor: "",
  }
};

function resolveBadges(signals: BadgeSignals): EarnifyBadgeType[] {
  const badges: EarnifyBadgeType[] = [];

  if (signals.rank === 1) {
    badges.push("Top Performer");
  }

  if ((signals.verifiedPostCount ?? 0) >= 1) {
    badges.push("Verified Creator");
  }

  if ((signals.maxPostScore ?? 0) > 1000) {
    badges.push("Viral Post");
  }

  if ((signals.campaignCount ?? 0) >= 5) {
    badges.push("5-Campaign Pro");
  }

  if ((signals.earlyAdopterRank ?? Number.POSITIVE_INFINITY) <= 50) {
    badges.push("Early Adopter");
  }

  return badges;
}

function Badge({ badge, compact = false }: BadgeProps) {
  const meta = badgeMeta[badge];

  return (
    <span
      title={meta.label}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${meta.background} ${meta.textColor} ${meta.glowColor} ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      <span aria-hidden>{meta.icon}</span>
      {!compact ? <span>{meta.label}</span> : null}
    </span>
  );
}

export { Badge, resolveBadges };
export type { EarnifyBadgeType };