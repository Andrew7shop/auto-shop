import Link from "next/link";
import { logout } from "@/app/login/actions";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/work-orders", label: "Work Orders" },
  { href: "/invoices", label: "Invoices" },
  { href: "/appointments", label: "Appointments" },
];

export function Nav() {
  return (
    <header className="print:hidden border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
          Wrench &amp; Wheel
        </Link>
        <nav className="flex flex-1 gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
