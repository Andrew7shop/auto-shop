"use client";

import { useState } from "react";
import { inputClass, secondaryButtonClass } from "@/components/form";

export function ConcernLinesFields() {
  const [lines, setLines] = useState<number[]>([0]);
  const [nextId, setNextId] = useState(1);

  return (
    <div className="space-y-2">
      {lines.map((id, index) => (
        <div key={id} className="flex items-center gap-2">
          <input
            name="concerns"
            required={index === 0}
            placeholder="e.g. Customer states brakes squeal when stopping"
            className={inputClass}
          />
          {lines.length > 1 && (
            <button
              type="button"
              onClick={() => setLines((prev) => prev.filter((lineId) => lineId !== id))}
              className="shrink-0 text-sm text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setLines((prev) => [...prev, nextId]);
          setNextId((id) => id + 1);
        }}
        className={secondaryButtonClass}
      >
        + Add line
      </button>
    </div>
  );
}
