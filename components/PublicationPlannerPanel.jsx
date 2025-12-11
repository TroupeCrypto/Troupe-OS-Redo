"use client";

import { useState } from "react";
import { usePublishingStore } from "../lib/publishingState";

export default function PublicationPlannerPanel() {
  const {
    hydrated,
    publicationsList,
    issuesList,
    articlesList,
    selectedPublication,
    selectedIssue,
    selectedArticle,
    actions,
  } = usePublishingStore();

  const [newPublicationTitle, setNewPublicationTitle] = useState("");
  const [newIssueTitle, setNewIssueTitle] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");

  if (!hydrated) {
    return (
      <div className="p-4 border rounded bg-black/40 text-sm text-neutral-200">
        Loading publishing planner…
      </div>
    );
  }

  const filteredPublications =
    filterDomain === "all"
      ? publicationsList
      : publicationsList.filter((p) => p.primaryDomain === filterDomain);

  const issuesForSelectedPublication = selectedPublication
    ? issuesList.filter((i) => i.publicationId === selectedPublication.id)
    : issuesList;

  const articlesForSelectedIssue = selectedIssue
    ? articlesList.filter((a) => a.issueId === selectedIssue.id)
    : selectedPublication
    ? articlesList.filter((a) => a.publicationId === selectedPublication.id)
    : articlesList;

  function handleCreatePublication() {
    const title = newPublicationTitle.trim() || "Untitled Publication";
    actions.createPublication({
      title,
      type: "hybrid",
      primaryDomain: "multi",
    });
    setNewPublicationTitle("");
  }

  function handleCreateIssue() {
    const title = newIssueTitle.trim() || "Untitled Issue";
    actions.createIssue({
      title,
      publicationId: selectedPublication ? selectedPublication.id : null,
      type: "digital",
      layoutStatus: "planned",
    });
    setNewIssueTitle("");
  }

  function handleCreateArticle() {
    if (!selectedPublication && !selectedIssue) {
      // Create a generic article with no association yet
      actions.createArticle({
        title: "New Article",
        section: "feature",
      });
      return;
    }

    actions.createArticle({
      title: "New Article",
      section: "feature",
      publicationId: selectedPublication ? selectedPublication.id : null,
      issueId: selectedIssue ? selectedIssue.id : null,
    });
  }

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-lg bg-black/50 text-neutral-100 text-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-wide uppercase text-xs text-neutral-300">
          Publication Planner
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400">
            Domain:
            <select
              className="ml-1 bg-black/60 border border-neutral-700 rounded px-1 py-0.5 text-xs"
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
            >
              <option value="all">All</option>
              <option value="music">Music</option>
              <option value="art">Art</option>
              <option value="collectibles">Collectibles</option>
              <option value="crypto">Crypto</option>
              <option value="cannabis">Cannabis</option>
              <option value="multi">Multi</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 min-h-[260px]">
        {/* Publications column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-neutral-300">
              Publications
            </span>
            <button
              type="button"
              className="px-2 py-0.5 border border-emerald-500/70 rounded text-[11px] hover:bg-emerald-500/20"
              onClick={handleCreatePublication}
            >
              + New
            </button>
          </div>
          <input
            className="w-full px-2 py-1 bg-black/60 border border-neutral-700 rounded text-xs"
            placeholder="New publication title..."
            value={newPublicationTitle}
            onChange={(e) => setNewPublicationTitle(e.target.value)}
          />
          <div className="flex-1 rounded border border-neutral-800 bg-black/40 overflow-auto">
            {filteredPublications.length === 0 ? (
              <div className="p-2 text-xs text-neutral-500">
                No publications yet. Create one to begin planning.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {filteredPublications.map((pub) => {
                  const isSelected =
                    selectedPublication && pub.id === selectedPublication.id;
                  return (
                    <li key={pub.id}>
                      <button
                        type="button"
                        onClick={() =>
                          actions.setSelection({
                            publicationId: pub.id,
                            issueId: undefined,
                            articleId: undefined,
                          })
                        }
                        className={`w-full text-left px-2 py-2 text-xs ${
                          isSelected
                            ? "bg-emerald-500/20 text-emerald-100"
                            : "hover:bg-neutral-900"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">
                            {pub.title}
                          </span>
                          <span className="text-[10px] uppercase text-neutral-400">
                            {pub.type}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>{pub.primaryDomain}</span>
                          <span>{pub.status}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Issues column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-neutral-300">
              Issues
              {selectedPublication && (
                <span className="ml-1 text-[10px] text-neutral-500">
                  ({selectedPublication.title})
                </span>
              )}
            </span>
            <button
              type="button"
              className="px-2 py-0.5 border border-sky-500/70 rounded text-[11px] hover:bg-sky-500/20"
              onClick={handleCreateIssue}
            >
              + New
            </button>
          </div>
          <input
            className="w-full px-2 py-1 bg-black/60 border border-neutral-700 rounded text-xs"
            placeholder="New issue title..."
            value={newIssueTitle}
            onChange={(e) => setNewIssueTitle(e.target.value)}
          />
          <div className="flex-1 rounded border border-neutral-800 bg-black/40 overflow-auto">
            {issuesForSelectedPublication.length === 0 ? (
              <div className="p-2 text-xs text-neutral-500">
                No issues yet for this publication.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {issuesForSelectedPublication.map((issue) => {
                  const isSelected =
                    selectedIssue && issue.id === selectedIssue.id;
                  return (
                    <li key={issue.id}>
                      <button
                        type="button"
                        onClick={() =>
                          actions.setSelection({
                            publicationId: issue.publicationId || undefined,
                            issueId: issue.id,
                            articleId: undefined,
                          })
                        }
                        className={`w-full text-left px-2 py-2 text-xs ${
                          isSelected
                            ? "bg-sky-500/20 text-sky-50"
                            : "hover:bg-neutral-900"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">
                            {issue.title}
                          </span>
                          <span className="text-[10px] uppercase text-neutral-400">
                            {issue.layoutStatus}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>
                            #{issue.issueNumber ?? "—"}
                            {issue.volume ? ` • Vol ${issue.volume}` : ""}
                          </span>
                          <span>{issue.type}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Articles column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-neutral-300">
              Articles
              {selectedIssue && (
                <span className="ml-1 text-[10px] text-neutral-500">
                  ({selectedIssue.title})
                </span>
              )}
            </span>
            <button
              type="button"
              className="px-2 py-0.5 border border-amber-500/70 rounded text-[11px] hover:bg-amber-500/20"
              onClick={handleCreateArticle}
            >
              + New
            </button>
          </div>
          <div className="flex-1 rounded border border-neutral-800 bg-black/40 overflow-auto">
            {articlesForSelectedIssue.length === 0 ? (
              <div className="p-2 text-xs text-neutral-500">
                No articles yet. Create one to start writing.
              </div>
            ) : (
              <ul className="divide-y divide-neutral-800">
                {articlesForSelectedIssue.map((article) => {
                  const isSelected =
                    selectedArticle && article.id === selectedArticle.id;
                  return (
                    <li key={article.id}>
                      <button
                        type="button"
                        onClick={() =>
                          actions.setSelection({
                            publicationId: article.publicationId || undefined,
                            issueId: article.issueId || undefined,
                            articleId: article.id,
                          })
                        }
                        className={`w-full text-left px-2 py-2 text-xs ${
                          isSelected
                            ? "bg-amber-500/20 text-amber-50"
                            : "hover:bg-neutral-900"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">
                            {article.title}
                          </span>
                          <span className="text-[10px] uppercase text-neutral-400">
                            {article.section}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                          <span>{article.status}</span>
                          <span>{article.publishedAt ? "Published" : "Draft"}</span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
