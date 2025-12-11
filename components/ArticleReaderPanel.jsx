"use client";

import { usePublishingStore } from "../lib/publishingState";

export default function ArticleReaderPanel() {
  const {
    hydrated,
    selectedPublication,
    selectedIssue,
    selectedArticle,
  } = usePublishingStore();

  if (!hydrated) {
    return (
      <div className="p-4 border rounded-lg bg-black/40 text-sm text-neutral-200">
        Loading reader…
      </div>
    );
  }

  if (!selectedArticle) {
    return (
      <div className="p-4 border rounded-lg bg-black/40 text-sm text-neutral-400">
        No article selected. Use the Publishing Workspace to choose an article,
        then it will appear here in a clean reading layout for digital and
        future print editions.
      </div>
    );
  }

  const pubTitle = selectedPublication?.title || "Unassigned Publication";
  const issueTitle = selectedIssue?.title || "Unassigned Issue";
  const sectionLabel = selectedArticle.section || "Feature";

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-black/60 text-neutral-100 text-sm">
      {/* Header strip for context */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-700 pb-2">
        <div className="flex flex-col gap-1">
          <div className="text-[10px] tracking-[0.25em] uppercase text-neutral-400">
            {pubTitle}
          </div>
          <div className="text-xs text-neutral-400">{issueTitle}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400">
          <span className="px-2 py-0.5 rounded-full border border-neutral-700 uppercase tracking-[0.18em]">
            {sectionLabel}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-neutral-700 uppercase tracking-[0.18em]">
            {selectedArticle.status || "draft"}
          </span>
          <span className="px-2 py-0.5 rounded-full border border-neutral-700 uppercase tracking-[0.18em]">
            Digital · Print-Ready Shell
          </span>
        </div>
      </div>

      {/* Title + metadata */}
      <div className="flex flex-col gap-2">
        <h2 className="text-lg sm:text-xl font-semibold leading-snug">
          {selectedArticle.title || "Untitled Article"}
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
          <span>
            By{" "}
            <span className="text-neutral-200">
              {selectedArticle.authorId || "ZIG_ZAG"}
            </span>
          </span>
          {selectedArticle.publishedAt && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-700">
              Published{" "}
              <span className="text-emerald-300">
                {new Date(selectedArticle.publishedAt).toLocaleDateString(
                  undefined,
                  {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }
                )}
              </span>
            </span>
          )}
          {!selectedArticle.publishedAt && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-900/80 border border-neutral-700">
              Draft · Not yet in print
            </span>
          )}
        </div>
        {selectedArticle.tags && selectedArticle.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 text-[10px] text-neutral-400">
            {selectedArticle.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full border border-neutral-700 bg-black/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Reading body, formatted for digital + print preview */}
      <div className="mt-1 rounded-lg bg-black/70 border border-neutral-800 px-4 py-3 max-h-[420px] overflow-auto">
        <div className="prose prose-invert max-w-none text-sm leading-relaxed">
          {selectedArticle.body ? (
            selectedArticle.body.split("\n").map((para, idx) => (
              <p key={idx} className="mb-3">
                {para.trim()}
              </p>
            ))
          ) : (
            <p className="text-neutral-500">
              This article has no body content yet. Use the Article Editor to
              draft the story. Once written, it will render here in a
              publication-style layout suitable for digital and future printed
              editions.
            </p>
          )}
        </div>
      </div>

      {/* Print edition hints / metadata strip */}
      <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex flex-wrap justify-between gap-2">
        <span>
          Layout Hint: This reader is the digital preview of the page. The same
          content can later flow into a print template for the TBA physical
          edition.
        </span>
        <span className="opacity-70">
          Draft ID: <span className="text-neutral-200">{selectedArticle.id}</span>
        </span>
      </div>
    </div>
  );
}
