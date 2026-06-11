import { useState, type FormEvent } from "react";
import {
  Check,
  Clipboard,
  Code2,
  LoaderCircle,
  Plus,
  ScissorsLineDashed,
} from "lucide-react";
import { CardShell } from "./CardShell";
import { useSnippets } from "../../hooks/useSnippets";
import type { CardLayout, GridAxis } from "../../types/dashboard";
import type { Snippet } from "../../types/snippets";

type SnippetManagerCardProps = {
  layout: CardLayout;
  onResize: (axis: GridAxis, delta: number) => void;
};

export function SnippetManagerCard({
  layout,
  onResize,
}: SnippetManagerCardProps) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const {
    addSnippet,
    copiedSnippetId,
    copySnippet,
    error,
    loading,
    snippets,
  } = useSnippets();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !code.trim()) {
      return;
    }

    void addSnippet(title, code);
    setTitle("");
    setCode("");
  }

  return (
    <CardShell layout={layout} onResize={onResize}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-accent-600">
              Snippets
            </p>
            <h2 className="mt-1 truncate text-lg font-bold text-gray-950">
              Manager
            </h2>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-700">
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Code2 size={18} />
            )}
          </div>
        </div>

        <form className="mt-4 grid gap-2" onSubmit={handleSubmit}>
          <input
            className="h-10 rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-accent-100 focus:bg-white"
            type="text"
            aria-label="Snippet title"
            value={title}
            placeholder="Snippet title"
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <textarea
              className="min-h-20 resize-none rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs font-medium leading-5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-accent-100 focus:bg-white"
              aria-label="Snippet code"
              value={code}
              placeholder="paste code"
              spellCheck={false}
              onChange={(event) => setCode(event.currentTarget.value)}
            />
            <button
              className="grid h-10 w-10 place-items-center self-start rounded-xl border border-gray-100 text-gray-500 transition hover:border-accent-100 hover:bg-accent-50 hover:text-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
              type="submit"
              aria-label="Add snippet"
              title="Add snippet"
              disabled={!title.trim() || !code.trim()}
            >
              <Plus size={16} />
            </button>
          </div>
        </form>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          {snippets.length ? (
            <ul className="space-y-2">
              {snippets.map((snippet) => (
                <li key={snippet.id}>
                  <SnippetRow
                    copied={copiedSnippetId === snippet.id}
                    snippet={snippet}
                    onCopy={() => void copySnippet(snippet)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid h-full min-h-24 place-items-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center">
              <div>
                <ScissorsLineDashed
                  className="mx-auto text-gray-300"
                  size={22}
                />
                <p className="mt-2 text-sm font-semibold text-gray-400">
                  No snippets yet.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold">
          <span className="text-gray-500">{snippets.length} saved</span>
          <span className={error ? "text-rose-500" : "text-accent-700"}>
            {error || (copiedSnippetId ? "Copied to clipboard" : "Click to copy")}
          </span>
        </div>
      </div>
    </CardShell>
  );
}

type SnippetRowProps = {
  copied: boolean;
  onCopy: () => void;
  snippet: Snippet;
};

function SnippetRow({ copied, onCopy, snippet }: SnippetRowProps) {
  return (
    <button
      className="grid w-full grid-cols-[1fr_auto] items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left transition hover:border-accent-100 hover:bg-white"
      type="button"
      aria-label={`Copy ${snippet.title}`}
      onClick={onCopy}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-gray-900">
          {snippet.title}
        </span>
        <code className="mt-1 line-clamp-2 block whitespace-pre-wrap break-words font-mono text-[11px] leading-4 text-gray-500">
          {snippet.code}
        </code>
      </span>
      <span
        className={`grid h-8 w-8 place-items-center rounded-full border ${
          copied
            ? "border-accent-100 bg-accent-50 text-accent-700"
            : "border-gray-100 bg-white text-gray-400"
        }`}
      >
        {copied ? <Check size={15} /> : <Clipboard size={15} />}
      </span>
    </button>
  );
}
