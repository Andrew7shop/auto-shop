import { logout } from "@/app/login/actions";

export function TopBar() {
  return (
    <header className="flex items-center justify-end border-b border-zinc-200 bg-white px-6 py-3 print:hidden dark:border-zinc-800 dark:bg-zinc-950">
      <form action={logout}>
        <button
          type="submit"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          Log out
        </button>
      </form>
    </header>
  );
}
