/** Assigns each item a lane (0-indexed) and the lane count of its overlap cluster, so
 * overlapping time ranges within a day can be rendered side by side instead of stacked. */
export function layoutOverlaps<T extends { startsAt: Date; endsAt: Date }>(
  items: T[]
): { item: T; lane: number; laneCount: number }[] {
  const sorted = [...items].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const result: { item: T; lane: number; laneCount: number }[] = [];
  let cluster: { item: T; lane: number; laneCount: number }[] = [];
  let active: { end: number; lane: number }[] = [];
  let clusterMaxLane = 0;

  const flushCluster = () => {
    for (const entry of cluster) entry.laneCount = clusterMaxLane + 1;
    result.push(...cluster);
    cluster = [];
    clusterMaxLane = 0;
  };

  for (const item of sorted) {
    const start = item.startsAt.getTime();
    active = active.filter((a) => a.end > start);
    if (active.length === 0 && cluster.length > 0) flushCluster();

    const usedLanes = new Set(active.map((a) => a.lane));
    let lane = 0;
    while (usedLanes.has(lane)) lane++;

    active.push({ end: item.endsAt.getTime(), lane });
    clusterMaxLane = Math.max(clusterMaxLane, lane);
    cluster.push({ item, lane, laneCount: 0 });
  }
  if (cluster.length > 0) flushCluster();

  return result;
}

export function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
}

export const APPOINTMENT_BLOCK_COLORS: Record<string, string> = {
  SCHEDULED: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/60",
  CONFIRMED: "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/60",
  IN_PROGRESS: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/60",
  COMPLETED: "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900",
  NO_SHOW: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/60",
  CANCELLED: "border-zinc-300 bg-zinc-100 opacity-60 dark:border-zinc-700 dark:bg-zinc-900",
};
