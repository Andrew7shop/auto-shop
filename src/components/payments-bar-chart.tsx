"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/money";

type ChartPayment = {
  id: string;
  amount: number;
  status: "SUCCEEDED" | "DECLINED";
  label: string;
  customerName: string;
};

const CHART_HEIGHT = 200;
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
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-500" /> Succeeded
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-600 dark:bg-red-500" /> Declined
          </span>
        </div>
        <p className="text-xs text-zinc-500">
          {hovered
            ? `${hovered.customerName} · ${formatCurrency(hovered.amount)} · ${hovered.label}`
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
          <svg width={width} height={CHART_HEIGHT} className="overflow-visible">
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
              return (
                <rect
                  key={p.id}
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={barHeight}
                  rx={4}
                  className={
                    p.status === "SUCCEEDED"
                      ? "fill-green-600 dark:fill-green-500"
                      : "fill-red-600 dark:fill-red-500"
                  }
                  opacity={hoveredId && hoveredId !== p.id ? 0.45 : 1}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <title>{`${p.customerName} · ${formatCurrency(p.amount)} · ${p.status === "SUCCEEDED" ? "Succeeded" : "Declined"} · ${p.label}`}</title>
                </rect>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
