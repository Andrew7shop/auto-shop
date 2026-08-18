"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/shop-settings", label: "Shop Profile" },
  { href: "/shop-settings/ro-settings", label: "RO Settings" },
  { href: "/shop-settings/appointments", label: "Appointments" },
  { href: "/shop-settings/markups", label: "Markups" },
  { href: "/shop-settings/estimates-invoices", label: "Estimates/Invoices" },
  { href: "/shop-settings/marketing", label: "Marketing" },
  { href: "/shop-settings/customers", label: "Customers" },
  { href: "/shop-settings/commissions", label: "Commissions" },
  { href: "/shop-settings/integrations", label: "Integrations" },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
      <nav className="-mb-px flex gap-4 whitespace-nowrap">
        {TABS.map((tab) => {
          const isActive = tab.href === "/shop-settings" ? pathname === "/shop-settings" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                isActive
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
