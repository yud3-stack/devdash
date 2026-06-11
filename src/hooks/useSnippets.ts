import { useCallback, useEffect, useState } from "react";
import { copyTextToClipboard } from "../lib/clipboard";
import {
  createSnippet,
  loadSnippets,
  markSnippetCopied,
  saveSnippet,
} from "../lib/snippetStorage";
import type { Snippet } from "../types/snippets";

export function useSnippets() {
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    let isMounted = true;

    loadSnippets().then((loadedSnippets) => {
      if (isMounted) {
        setSnippets(loadedSnippets);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const addSnippet = useCallback(async (title: string, code: string) => {
    const trimmedTitle = title.trim();
    const trimmedCode = code.trim();

    if (!trimmedTitle || !trimmedCode) {
      return;
    }

    const snippet = createSnippet(trimmedTitle, trimmedCode);
    setSnippets((currentSnippets) => [snippet, ...currentSnippets]);
    setError("");
    await saveSnippet(snippet);
  }, []);

  const copySnippet = useCallback(async (snippet: Snippet) => {
    try {
      await copyTextToClipboard(snippet.code);

      const copiedAt = new Date().toISOString();
      setCopiedSnippetId(snippet.id);
      setError("");
      setSnippets((currentSnippets) =>
        currentSnippets.map((currentSnippet) =>
          currentSnippet.id === snippet.id
            ? { ...currentSnippet, copiedAt }
            : currentSnippet,
        ),
      );
      await markSnippetCopied(snippet.id, copiedAt);
    } catch {
      setError("Could not copy snippet.");
    }
  }, []);

  return {
    addSnippet,
    copiedSnippetId,
    copySnippet,
    error,
    loading,
    snippets,
  };
}
