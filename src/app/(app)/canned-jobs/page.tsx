import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { JOB_CATEGORIES } from "@/lib/statuses";
import type { JobCategory } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export default async function CannedJobsPage({ searchParams }: PageProps<"/canned-jobs">) {
  const { q, status } = await searchParams;
  const searchTerm = typeof q === "string" ? q.trim() : "";
  const categoryFilter =
    typeof status === "string" && JOB_CATEGORIES.some((c) => c.value === status)
      ? (status as JobCategory)
      : undefined;

  const cannedJobs = await prisma.cannedJob.findMany({
    where: {
      category: categoryFilter,
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { description: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Canned Jobs</h1>
        <Link
          href="/canned-jobs/new"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New canned job
        </Link>
      </div>

      <SearchFilterBar
        q={searchTerm}
        placeholder="Search by name or description"
        statusOptions={JOB_CATEGORIES}
        statusValue={categoryFilter}
        basePath="/canned-jobs"
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-2">Job</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2 text-right">Labor hours</th>
              <th className="px-4 py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {cannedJobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                  {searchTerm || categoryFilter ? "No canned jobs match your filters." : "No canned jobs yet."}
                </td>
              </tr>
            )}
            {cannedJobs.map((job) => (
              <tr key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                <td className="px-4 py-2">
                  <Link href={`/canned-jobs/${job.id}/edit`} className="hover:underline">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {job.name}
                      {!job.active && <span className="ml-2 text-xs font-normal text-zinc-500">(Inactive)</span>}
                    </span>
                    {job.description && <p className="text-xs text-zinc-500">{job.description}</p>}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-500">
                  {JOB_CATEGORIES.find((c) => c.value === job.category)?.label ?? job.category}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {job.laborHours ? job.laborHours.toString() : "—"}
                </td>
                <td className="px-4 py-2 text-right text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(job.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
