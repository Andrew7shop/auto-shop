import type { ReactNode } from "react";
import { SettingsTabs } from "@/components/settings-tabs";

export default function ShopSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Shop Settings</h1>
      <SettingsTabs />
      <div>{children}</div>
    </div>
  );
}
