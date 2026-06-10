import { Flame, GitBranch } from "lucide-react";
import { CardShell } from "./CardShell";

export function ProfileCard() {
  return (
    <CardShell colSpan={1} rowSpan={2} resizable={false}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-lg font-extrabold text-accent-700">
            YD
          </div>
          <div className="mt-5">
            <h1 className="text-xl font-bold tracking-normal text-gray-950">
              Yud3 Stack
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">DevDash</p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
            <GitBranch size={13} />
            main
          </span>
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
              <Flame size={15} className="text-accent-600" />
              Streak
            </span>
            <strong className="text-lg font-extrabold text-gray-950">7</strong>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
