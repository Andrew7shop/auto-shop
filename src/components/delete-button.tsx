"use client";

import type { ReactNode } from "react";

export function DeleteButton({
  confirmText,
  children = "Delete",
  className,
}: {
  confirmText: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
