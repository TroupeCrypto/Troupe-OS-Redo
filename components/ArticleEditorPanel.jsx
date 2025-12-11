"use client";

import { useState, useEffect } from "react";
import { usePublishingStore } from "../lib/publishingState";

export default function ArticleEditorPanel() {
  const {
    hydrated,
    selectedArticle,
    selectedPublication,
    selectedIssue,
    actions,
  } = usePublishingStore();

  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!selectedArticle) {
      setDraft(null);
    } else {
      setDraft(selectedArticle);
    }
  }, [selectedArticle]);

  if (!hydrated) {
    return (
      <div className="p-4 border rounded bg-black/40 text-sm text-neutral-200">
        Loading article editor…
      </div>
    );
  }

  if (!selectedArticle) {
    return (
      <div className="p-4 border rounded bg-black/40 text-sm text-neutral-400">
        No article selected. Use the Publication Planner to select or create an
        article, then it will appear here for editing.
      </div>
    );
  }

  function updateField(field, value) {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  }

  function handleSave() {
    if (!draft) return;
    actions.updateArticle(draft.id, {
      title: draft.title,
      slug: draft.slug,
      body: draft.body,
      section: draft.section,
      status: draft.status,
      tags: draft.tags || [],
      publishedAt:
        draft.status === "published" && !draft.publishedAt
          ? new Date().toISOString()
          : draft.publishedAt,
    });
  }

  const tagString = (draft?.tags || []).join(", ");

  return (
    <div className="flex flex-col h-full gap-3 p-4 border rounded-lg bg-black/50 text-neutral-100 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-wide uppercase text-xs text-neutral-300">
          Article Editor
        </h2>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 border border-emerald-500/80 rounded text-xs font-medium hover:bg-emerald-500/20"
        >
          Save Changes
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
        {selectedPublication && (
          <span className="px-2 py-0.5 rounded bg-neutral-900/70 border border-neutral-700">
            Publication:{" "}
            <span className="text-neutral-200">
              {selectedPublication.title}
            </span>
          </span>
        )}
        {selectedIssue && (
          <span className="px-2 py-0.5 rounded bg-neutral-900/70 border border-neutral-700">
            Issue:{" "}
            <span className="text-neutral-200">{selectedIssue.title}</span>
          </span>
        )}
        <span className="px-2 py-0.5 rounded bg-neutral-900/70 border border-neutral-700">
          Status:{" "}
          <select
            className="ml-1 bg-black/80 border border-neutral-600 rounded px-1 py-0.5 text-[11px]"
            value={draft?.status || "draft"}
            onChange={(e) => updateField("status", e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="retracted">Retracted</option>
          </select>
        </span>
        <span className="px-2 py-0.5 rounded bg-neutral-900/70 border border-neutral-700">
          Section:{" "}
          <select
            className="ml-1 bg-black/80 border border-neutral-600 rounded px-1 py-0.5 text-[11px]"
            value={draft?.section || "feature"}
            onChange={(e) => updateField("section", e.target.value)}
          >
            <option value="feature">Feature</option>
            <option value="column">Column</option>
            <option value="review">Review</option>
            <option value="news">News</option>
            <option value="editorial">Editorial</option>
          </select>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 min-h-[260px]">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-neutral-300">
            Title
            <input
              className="mt-1 w-full px-2 py-1 bg-black/60 border border-neutral-700 rounded text-xs"
              value={draft?.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Article title…"
            />
          </label>

          <label className="text-xs text-neutral-300">
            Slug
            <input
              className="mt-1 w-full px-2 py-1 bg-black/60 border border-neutral-700 rounded text-xs"
              value={draft?.slug || ""}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="URL slug (optional)…"
            />
          </label>

          <label className="text-xs text-neutral-300">
            Tags (comma-separated)
            <input
              className="mt-1 w-full px-2 py-1 bg-black/60 border border-neutral-700 rounded text-xs"
              value={tagString}
              onChange={(e) =>
                updateField(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
              placeholder="psychedelic, cannabis, music, crypto…"
            />
          </label>

          <div className="mt-2 text-[11px] text-neutral-500">
            <div>
              Created:{" "}
              <span className="text-neutral-300">
                {draft?.createdAt || "–"}
              </span>
            </div>
            <div>
              Last Updated:{" "}
              <span className="text-neutral-300">
                {draft?.updatedAt || "–"}
              </span>
            </div>
            {draft?.publishedAt && (
              <div>
                Published:{" "}
                <span className="text-emerald-300">{draft.publishedAt}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-neutral-300 flex-1 flex flex-col">
            Body
            <textarea
              className="mt-1 flex-1 w-full px-2 py-1 bg-black/60 border border-neutral-700 rounded text-xs leading-relaxed resize-none"
              value={draft?.body || ""}
              onChange={(e) => updateField("body", e.target.value)}
              placeholder="Write the article body here…"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
