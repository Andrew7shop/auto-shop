import type { ReactNode } from "react";
import { RoSettingsNav } from "@/components/ro-settings-nav";

export default function RoSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-8">
      <RoSettingsNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
