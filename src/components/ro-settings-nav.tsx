"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/shop-settings/ro-settings/labor-rates", label: "Labor Rates" },
  { href: "/shop-settings/ro-settings/shop-fees", label: "Shop Fees" },
  { href: "/shop-settings/ro-settings/discounts", label: "Discounts" },
  { href: "/shop-settings/ro-settings/taxes", label: "Taxes" },
  { href: "/shop-settings/ro-settings/tires", label: "Tires" },
  { href: "/shop-settings/ro-settings/job-categories", label: "Job Categories" },
  { href: "/shop-settings/ro-settings/payment-settings", label: "Payment Settings" },
  { href: "/shop-settings/ro-settings/invoice-numbering", label: "Invoice Numbering" },
  { href: "/shop-settings/ro-settings/gp-hr-goal", label: "GP/Hr Goal" },
  { href: "/shop-settings/ro-settings/advanced-settings", label: "Advanced Settings" },
];

export function RoSettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0 space-y-0.5">
      {SECTIONS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
