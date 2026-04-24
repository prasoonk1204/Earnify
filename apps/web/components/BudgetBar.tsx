type BudgetBarProps = {
  totalBudget: number;
  remainingBudget: number;
  size?: "sm" | "md";
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function BudgetBar({ totalBudget, remainingBudget, size = "md" }: BudgetBarProps) {
  const safeTotal = totalBudget > 0 ? totalBudget : 1;
  const spentPercent = clampPercent(((safeTotal - remainingBudget) / safeTotal) * 100);
  const barHeight = size === "sm" ? "0.45rem" : "0.65rem";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">{remainingBudget.toFixed(2)} XLM left</span>
        <span className="font-medium text-[var(--color-muted)]">{totalBudget.toFixed(2)} XLM total</span>
      </div>

      <div
        className="overflow-hidden rounded-full border border-[var(--color-border)]/30 bg-[#0D0F14]/50 backdrop-blur-sm"
        style={{ height: barHeight }}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#6366F1] shadow-[0_0_10px_-2px_rgba(99,102,241,0.5)]"
          style={{ width: `${spentPercent}%` }}
        />
      </div>
    </div>
  );
}
