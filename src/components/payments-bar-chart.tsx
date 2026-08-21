"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/money";

type ChartPayment = {
  id: string;
  amount: number;
  dateLabel: string;
  fullLabel: string;
  customerName: string;
};

const CHART_HEIGHT = 200;
const LABEL_HEIGHT = 40;
const BAR_WIDTH = 18;
const BAR_GAP = 10;

export function PaymentsBarChart({ payments }: { payments: ChartPayment[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const maxAmount = payments.reduce((max, p) => Math.max(max, p.amount), 0);
  const yTicks = maxAmount > 0 ? [maxAmount, maxAmount / 2, 0] : [0];
  const width = Math.max(payments.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP, 120);
  const hovered = payments.find((p) => p.id === hoveredId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <p className="text-xs text-zinc-500">
          {hovered
            ? `${hovered.customerName} · ${formatCurrency(hovered.amount)} · ${hovered.fullLabel}`
            : "Hover a bar for details"}
        </p>
      </div>

      <div className="flex gap-2">
        <div
          className="flex shrink-0 flex-col justify-between py-1 text-right text-xs text-zinc-500"
          style={{ height: CHART_HEIGHT }}
        >
          {yTicks.map((tick, i) => (
            <span key={i}>{formatCurrency(tick)}</span>
          ))}
        </div>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <svg width={width} height={CHART_HEIGHT + LABEL_HEIGHT} className="overflow-visible">
            {yTicks.map((tick, i) => {
              const y = maxAmount > 0 ? CHART_HEIGHT - (tick / maxAmount) * CHART_HEIGHT : CHART_HEIGHT;
              return (
                <line
                  key={i}
                  x1={0}
                  x2={width}
                  y1={y}
                  y2={y}
                  strokeWidth={1}
                  className={i === yTicks.length - 1 ? "stroke-zinc-300 dark:stroke-zinc-700" : "stroke-zinc-200 dark:stroke-zinc-800"}
                />
              );
            })}
            {payments.map((p, i) => {
              const barHeight = maxAmount > 0 ? Math.max((p.amount / maxAmount) * CHART_HEIGHT, 2) : 2;
              const x = BAR_GAP + i * (BAR_WIDTH + BAR_GAP);
              const y = CHART_HEIGHT - barHeight;
              const labelX = x + BAR_WIDTH / 2;
              return (
                <g key={p.id}>
                  <rect
                    x={x}
                    y={y}
                    width={BAR_WIDTH}
                    height={barHeight}
                    rx={4}
                    className="fill-green-600 dark:fill-green-500"
                    opacity={hoveredId && hoveredId !== p.id ? 0.45 : 1}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <title>{`${p.customerName} · ${formatCurrency(p.amount)} · ${p.fullLabel}`}</title>
                  </rect>
                  <text
                    x={labelX}
                    y={CHART_HEIGHT + 14}
                    textAnchor="end"
                    transform={`rotate(-45 ${labelX} ${CHART_HEIGHT + 14})`}
                    className="fill-zinc-500 text-[10px]"
                  >
                    {p.dateLabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
