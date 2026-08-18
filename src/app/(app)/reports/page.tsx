import Link from "next/link";

const GROUPS: { title: string; reports: { href: string; label: string }[] }[] = [
  {
    title: "Daily",
    reports: [
      { href: "/reports/end-of-day", label: "End of Day" },
      { href: "/reports/cash-drawer", label: "Cash Drawer" },
    ],
  },
  {
    title: "Sales",
    reports: [
      { href: "/reports/sales-details", label: "Sales Details" },
      { href: "/reports/sales-by-category", label: "Sales by Job Category" },
      { href: "/reports/sales-tax", label: "Sales Tax" },
      { href: "/reports/tire-tax", label: "Tire Tax" },
      { href: "/reports/discounts", label: "Discounts" },
      { href: "/reports/fees", label: "Fees" },
    ],
  },
  {
    title: "Financial",
    reports: [
      { href: "/reports/profit", label: "Profit Details" },
      { href: "/reports/payments", label: "Payment Details" },
      { href: "/reports/accounts-receivable", label: "Accounts Receivable" },
      { href: "/reports/accounts-payable", label: "Accounts Payable" },
    ],
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Reports</h1>
      {GROUPS.map((group) => (
        <section key={group.title} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-zinc-500">{group.title}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.reports.map((report) => (
              <Link
                key={report.href}
                href={report.href}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-4 text-sm font-medium text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                {report.label}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
