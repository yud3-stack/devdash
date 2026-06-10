import { AtSign, Heart, MessageCircle, RefreshCw, Repeat2 } from "lucide-react";
import { CardShell } from "./CardShell";
import { useXFeed } from "../../hooks/useXFeed";
import type { CardLayout, GridAxis } from "../../types/dashboard";

type XFeedCardProps = {
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
  xBearerToken: string;
};

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

function formatPostTime(createdAt: string) {
  if (!createdAt) {
    return "now";
  }

  const timestamp = new Date(createdAt).getTime();
  const deltaSeconds = Math.round((timestamp - Date.now()) / 1000);
  const absSeconds = Math.abs(deltaSeconds);

  if (absSeconds < 60) {
    return relativeTimeFormatter.format(deltaSeconds, "second");
  }

  const deltaMinutes = Math.round(deltaSeconds / 60);
  const absMinutes = Math.abs(deltaMinutes);

  if (absMinutes < 60) {
    return relativeTimeFormatter.format(deltaMinutes, "minute");
  }

  const deltaHours = Math.round(deltaMinutes / 60);

  if (Math.abs(deltaHours) < 24) {
    return relativeTimeFormatter.format(deltaHours, "hour");
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(new Date(createdAt));
}

export function XFeedCard({
  layout,
  onResize,
  xBearerToken,
}: XFeedCardProps) {
  const { error, feed, refresh, status } = useXFeed(xBearerToken);
  const hasToken = Boolean(xBearerToken.trim());
  const isLoading = status === "loading";

  return (
    <CardShell layout={layout} onResize={onResize}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-accent-600">X</p>
            <h2 className="mt-1 truncate text-lg font-bold text-gray-950">
              Feed
            </h2>
            {feed.viewerUsername ? (
              <p className="mt-1 truncate text-xs font-semibold text-gray-400">
                @{feed.viewerUsername}
              </p>
            ) : null}
          </div>
          <button
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700 transition hover:border-accent-100 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            aria-label="Refresh X feed"
            title="Refresh X feed"
            disabled={!hasToken || isLoading}
            onClick={refresh}
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <AtSign size={18} />
            )}
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          {!hasToken ? (
            <StatusMessage text="X bearer token required" />
          ) : null}
          {status === "error" ? <StatusMessage text={error} /> : null}
          {hasToken && status !== "error" && feed.posts.length === 0 ? (
            <StatusMessage text={isLoading ? "Loading feed" : "No posts found"} />
          ) : null}
          <ul className="space-y-2">
            {feed.posts.map((post) => (
              <li
                className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                key={post.id}
              >
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {post.authorName}
                    </p>
                    <p className="truncate text-xs font-semibold text-gray-400">
                      @{post.authorUsername}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-gray-400">
                    {formatPostTime(post.createdAt)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm font-medium leading-5 text-gray-700">
                  {post.text}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs font-bold text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle size={13} />
                    {post.replyCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Repeat2 size={13} />
                    {post.repostCount}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Heart size={13} />
                    {post.likeCount}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardShell>
  );
}

type StatusMessageProps = {
  text: string;
};

function StatusMessage({ text }: StatusMessageProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-500">
      {text}
    </div>
  );
}
