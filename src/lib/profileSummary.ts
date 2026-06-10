export type ProfileSummary = {
  activeProject: string;
  branch: string;
  commitStreak: number;
  displayName: string;
};

export const defaultProfileSummary: ProfileSummary = {
  activeProject: "DevDash",
  branch: "main",
  commitStreak: 7,
  displayName: "Yud3 Stack",
};

export function getInitials(displayName: string) {
  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
