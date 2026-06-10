import { Flame, FolderGit2, GitBranch, UserRound } from "lucide-react";
import { CardShell } from "./CardShell";
import {
  defaultProfileSummary,
  getInitials,
  type ProfileSummary,
} from "../../lib/profileSummary";
import type { CardLayout } from "../../types/dashboard";

type ProfileCardProps = {
  layout: CardLayout;
  profile?: ProfileSummary;
};

export function ProfileCard({
  layout,
  profile = defaultProfileSummary,
}: ProfileCardProps) {
  const initials = getInitials(profile.displayName);

  return (
    <CardShell layout={layout}>
      <div className="flex h-full min-h-0 flex-col justify-between gap-4">
        <div className="min-h-0">
          <div className="flex items-start justify-between">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-100 text-lg font-extrabold text-accent-700">
              {initials}
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-500">
              <UserRound size={18} />
            </div>
          </div>

          <div className="mt-4 min-w-0">
            <h2 className="truncate text-xl font-bold tracking-normal text-gray-950">
              {profile.displayName}
            </h2>
            <p className="mt-1 text-xs font-bold uppercase text-accent-600">
              Active Project
            </p>
            <p className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-gray-700">
              <FolderGit2 size={15} className="shrink-0 text-gray-400" />
              {profile.activeProject}
            </p>
            <span className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
              <GitBranch size={13} />
              <span className="truncate">{profile.branch}</span>
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
              <Flame size={15} className="text-accent-600" />
              Commit streak
            </span>
            <strong className="text-lg font-extrabold text-gray-950">
              {profile.commitStreak}
            </strong>
          </div>
        </div>
      </div>
    </CardShell>
  );
}
