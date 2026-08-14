import { login } from "./actions";
import { inputClass, labelClass, primaryButtonClass } from "@/components/form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Wrench &amp; Wheel</h1>
          <p className="text-sm text-zinc-500">Enter the shop password to continue.</p>
        </div>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            Incorrect password.
          </p>
        )}
        <form action={login} className="space-y-4">
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className={inputClass}
            />
          </div>
          <button type="submit" className={`${primaryButtonClass} w-full`}>
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}
