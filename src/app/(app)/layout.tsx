import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { getShopProfile, DEFAULT_SHOP_NAME } from "@/lib/shop-profile";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getShopProfile();

  return (
    <div className="flex h-full">
      <Sidebar shopName={profile?.name || DEFAULT_SHOP_NAME} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
