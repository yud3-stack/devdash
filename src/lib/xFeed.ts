export type XFeedPost = {
  id: string;
  authorName: string;
  authorUsername: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  repostCount: number;
  text: string;
  url: string;
};

export type XFeed = {
  posts: XFeedPost[];
  viewerName: string;
  viewerUsername: string;
};

type XUser = {
  id: string;
  name: string;
  username: string;
};

type XPostResponse = {
  author_id: string;
  created_at?: string;
  id: string;
  public_metrics?: {
    like_count?: number;
    reply_count?: number;
    retweet_count?: number;
  };
  text: string;
};

type XApiError = {
  detail?: string;
  status?: number;
  title?: string;
};

type XApiResponse<TData> = {
  data?: TData;
  errors?: XApiError[];
  includes?: {
    users?: XUser[];
  };
};

const xApiBaseUrl = "https://api.x.com";

function getXErrorMessage(errors?: XApiError[]) {
  const error = errors?.[0];

  return error?.detail ?? error?.title ?? "X API request failed.";
}

async function requestXApi<TData>(path: string, token: string) {
  const response = await fetch(`${xApiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as XApiResponse<TData>;

  if (!response.ok) {
    throw new Error(getXErrorMessage(payload.errors));
  }

  return payload;
}

export function createEmptyXFeed(): XFeed {
  return {
    posts: [],
    viewerName: "",
    viewerUsername: "",
  };
}

export async function fetchXFeed(token: string): Promise<XFeed> {
  const viewerResponse = await requestXApi<XUser>(
    "/2/users/me?user.fields=name,username",
    token,
  );
  const viewer = viewerResponse.data;

  if (!viewer) {
    throw new Error("X user profile could not be loaded.");
  }

  const timelineParams = new URLSearchParams({
    expansions: "author_id",
    max_results: "10",
    "tweet.fields": "author_id,created_at,public_metrics",
    "user.fields": "name,username",
  });
  const timelineResponse = await requestXApi<XPostResponse[]>(
    `/2/users/${viewer.id}/timelines/reverse_chronological?${timelineParams.toString()}`,
    token,
  );
  const usersById = new Map(
    (timelineResponse.includes?.users ?? []).map((user) => [user.id, user]),
  );
  const posts = (timelineResponse.data ?? []).map((post) => {
    const author = usersById.get(post.author_id);
    const username = author?.username ?? viewer.username;

    return {
      id: post.id,
      authorName: author?.name ?? viewer.name,
      authorUsername: username,
      createdAt: post.created_at ?? "",
      likeCount: post.public_metrics?.like_count ?? 0,
      replyCount: post.public_metrics?.reply_count ?? 0,
      repostCount: post.public_metrics?.retweet_count ?? 0,
      text: post.text,
      url: `https://x.com/${username}/status/${post.id}`,
    };
  });

  return {
    posts,
    viewerName: viewer.name,
    viewerUsername: viewer.username,
  };
}
