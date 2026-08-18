"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/", label: "Dashboard" },
  { href: "/job-board", label: "Job Board", matchPrefixes: ["/job-board", "/work-orders"] },
  { href: "/tech-board", label: "Tech Board" },
  { href: "/appointments", label: "Appointments" },
  { href: "/inventory", label: "Inventory" },
  { href: "/orders", label: "Orders" },
  { href: "/reports", label: "Reports" },
  { href: "/customers", label: "Customers" },
  { href: "/vendors", label: "Vendors" },
  { href: "/canned-jobs", label: "Canned Jobs" },
  { href: "/inspections", label: "Inspections" },
  { href: "/employees", label: "Employees" },
  { href: "/shop-settings", label: "Shop Settings" },
  { href: "/payments", label: "Payments" },
  { href: "/billing", label: "Billing" },
];

export function Sidebar({ shopName }: { shopName: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col overflow-y-auto border-r border-zinc-200 bg-white print:hidden dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
          {shopName}
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {SECTIONS.map((item) => {
          const prefixes = item.matchPrefixes ?? [item.href];
          const isActive =
            item.href === "/" ? pathname === "/" : prefixes.some((p) => pathname.startsWith(p));
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
    </aside>
  );
}
