export type ContributionDay = {
  count: number;
  date: string;
  level: number;
};

export type RecentCommit = {
  committedAt: string;
  message: string;
  repository: string;
  url: string;
};

export type GitHubActivity = {
  contributions: ContributionDay[];
  recentCommits: RecentCommit[];
  streak: number;
  totalCommits: number;
  username: string;
};

type GitHubUserResponse = {
  login: string;
};

type CommitSearchItem = {
  commit: {
    author?: {
      date?: string;
    };
    committer?: {
      date?: string;
    };
    message: string;
  };
  html_url: string;
  repository?: {
    full_name?: string;
  };
};

type CommitSearchResponse = {
  items?: CommitSearchItem[];
  total_count?: number;
};

const daysInContributionGrid = 84;
const githubApiBaseUrl = "https://api.github.com";

const requestHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getContributionLevel(count: number) {
  if (count === 0) {
    return 0;
  }

  if (count < 2) {
    return 1;
  }

  if (count < 4) {
    return 2;
  }

  if (count < 7) {
    return 3;
  }

  return 4;
}

export function createEmptyGitHubActivity(): GitHubActivity {
  const today = startOfUtcDay(new Date());
  const startDate = addUtcDays(today, -(daysInContributionGrid - 1));

  return {
    contributions: Array.from({ length: daysInContributionGrid }, (_, index) => {
      const date = toDateKey(addUtcDays(startDate, index));

      return {
        count: 0,
        date,
        level: 0,
      };
    }),
    recentCommits: [],
    streak: 0,
    totalCommits: 0,
    username: "",
  };
}

function buildGitHubHeaders(token: string) {
  return {
    ...requestHeaders,
    Authorization: `Bearer ${token}`,
  };
}

async function fetchGitHubJson<T>(url: string, token: string) {
  const response = await fetch(url, {
    headers: buildGitHubHeaders(token),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("GitHub token rejected");
  }

  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

function buildActivityFromCommits(
  username: string,
  commits: CommitSearchItem[],
  totalCommits: number,
) {
  const activity = createEmptyGitHubActivity();
  const countsByDate = new Map(
    activity.contributions.map((day) => [day.date, 0]),
  );

  commits.forEach((item) => {
    const committedAt =
      item.commit.author?.date ?? item.commit.committer?.date ?? "";
    const date = committedAt.slice(0, 10);

    if (countsByDate.has(date)) {
      countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1);
    }
  });

  const contributions = activity.contributions.map((day) => {
    const count = countsByDate.get(day.date) ?? 0;

    return {
      ...day,
      count,
      level: getContributionLevel(count),
    };
  });
  const streak = [...contributions]
    .reverse()
    .findIndex((day) => day.count === 0);

  return {
    contributions,
    recentCommits: commits.slice(0, 5).map((item) => ({
      committedAt:
        item.commit.author?.date ?? item.commit.committer?.date ?? "",
      message: item.commit.message.split("\n")[0] ?? "Commit",
      repository: item.repository?.full_name ?? username,
      url: item.html_url,
    })),
    streak: streak === -1 ? contributions.length : streak,
    totalCommits,
    username,
  } satisfies GitHubActivity;
}

export async function fetchGitHubActivity(token: string) {
  const sanitizedToken = token.trim();

  if (!sanitizedToken) {
    return createEmptyGitHubActivity();
  }

  const user = await fetchGitHubJson<GitHubUserResponse>(
    `${githubApiBaseUrl}/user`,
    sanitizedToken,
  );
  const today = startOfUtcDay(new Date());
  const since = toDateKey(addUtcDays(today, -(daysInContributionGrid - 1)));
  const commits: CommitSearchItem[] = [];
  let totalCommits = 0;

  for (let page = 1; page <= 3; page += 1) {
    const params = new URLSearchParams({
      order: "desc",
      page: String(page),
      per_page: "100",
      q: `author:${user.login} committer-date:>=${since}`,
      sort: "committer-date",
    });
    const data = await fetchGitHubJson<CommitSearchResponse>(
      `${githubApiBaseUrl}/search/commits?${params.toString()}`,
      sanitizedToken,
    );
    const items = data.items ?? [];

    totalCommits = data.total_count ?? totalCommits;
    commits.push(...items);

    if (items.length < 100) {
      break;
    }
  }

  return buildActivityFromCommits(user.login, commits, totalCommits);
}
