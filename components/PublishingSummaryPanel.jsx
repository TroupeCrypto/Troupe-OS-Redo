"use client";

import { useMemo } from "react";
import { usePublishingStore } from "../lib/publishingState";

export default function PublishingSummaryPanel() {
  const {
    hydrated,
    publicationsList,
    issuesList,
    articlesList,
  } = usePublishingStore();

  const summary = useMemo(() => {
    if (!hydrated) {
      return {
        totalPublications: 0,
        totalIssues: 0,
        totalArticles: 0,
        articlesByStatus: {},
        articlesByDomain: {},
      };
    }

    const totalPublications = publicationsList.length;
    const totalIssues = issuesList.length;
    const totalArticles = articlesList.length;

    const articlesByStatus = {
      draft: 0,
      in_review: 0,
      scheduled: 0,
      published: 0,
      retracted: 0,
      other: 0,
    };

    const articlesByDomain = {
      music: 0,
      art: 0,
      collectibles: 0,
      crypto: 0,
      cannabis: 0,
      multi: 0,
      unassigned: 0,
    };

    const pubDomainMap = new Map();
    for (const pub of publicationsList) {
      pubDomainMap.set(pub.id, pub.primaryDomain || "unassigned");
    }

    for (const article of articlesList) {
      const status = (article.status || "other").toLowerCase();
      if (status in articlesByStatus) {
        articlesByStatus[status] += 1;
      } else {
        articlesByStatus.other += 1;
      }

      let domain = "unassigned";
      if (article.publicationId && pubDomainMap.has(article.publicationId)) {
        domain = pubDomainMap.get(article.publicationId) || "unassigned";
      }
      if (!(domain in articlesByDomain)) {
        articlesByDomain[domain] = 0;
      }
      articlesByDomain[domain] += 1;
    }

    return {
      totalPublications,
      totalIssues,
      totalArticles,
      articlesByStatus,
      articlesByDomain,
    };
  }, [hydrated, publicationsList, issuesList, articlesList]);

  if (!hydrated) {
    return (
      <div className="p-4 border rounded-lg bg-black/40 text-sm text-neutral-200">
        Loading publishing analytics…
      </div>
    );
  }

  const {
    totalPublications,
    totalIssues,
    totalArticles,
    articlesByStatus,
    articlesByDomain,
  } = summary;

  const hasAnyData =
    totalPublications > 0 || totalIssues > 0 || totalArticles > 0;

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-black/60 text-neutral-100 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-xs tracking-[0.25em] uppercase text-neutral-300">
            Publishing Summary
          </h3>
          <p className="mt-1 text-xs text-neutral-400 max-w-xl">
            High-level telemetry for Troupe Inc.&apos;s digital + future print
            publication manager: publications, issues, and article pipeline
            health.
          </p>
        </div>
        <div className="text-[10px] text-neutral-500 text-right">
          <div>Scope: Local Session</div>
          <div>Mode: Planner · Editor · Reader</div>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="rounded-lg border border-dashed border-neutral-700 bg-black/40 px-3 py-2 text-xs text-neutral-400">
          No publishing data yet. Use the Publishing Workspace in the Creative
          Studio to create publications, issues, and articles. As you build the
          catalog, this panel will reflect real-time counts for digital and
          future printed editions.
        </div>
      ) : (
        <>
          {/* Top row: core counts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard
              label="Publications"
              value={totalPublications}
              subtitle="Digital + print containers"
            />
            <MetricCard
              label="Issues"
              value={totalIssues}
              subtitle="Individual drops / editions"
            />
            <MetricCard
              label="Articles"
              value={totalArticles}
              subtitle="Stories across all domains"
            />
          </div>

          {/* Middle row: status breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <StatusCard articlesByStatus={articlesByStatus} />
            <DomainCard articlesByDomain={articlesByDomain} />
          </div>
        </>
      )}

      <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 flex flex-wrap justify-between gap-2">
        <span>
          This summary is the analytics spine for Troupe Inc.&apos;s
          publication manager: use it to see when drafts are piling up,
          scheduled issues are thin, or domains are under-served.
        </span>
        <span className="opacity-70">
          Next upgrade: bind this to persistent storage and API endpoints for
          long-lived editorial telemetry.
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subtitle }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-black/70 px-3 py-3">
      <div className="text-[11px] tracking-[0.18em] uppercase text-neutral-400 mb-1">
        {label}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-[11px] text-neutral-500">{subtitle}</div>
    </div>
  );
}

function StatusCard({ articlesByStatus }) {
  const ordered = [
    "draft",
    "in_review",
    "scheduled",
    "published",
    "retracted",
    "other",
  ];

  const labels = {
    draft: "Draft",
    in_review: "In Review",
    scheduled: "Scheduled",
    published: "Published",
    retracted: "Retracted",
    other: "Other",
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-black/70 px-3 py-3">
      <div className="text-[11px] tracking-[0.18em] uppercase text-neutral-400 mb-2">
        Article Status
      </div>
      <div className="space-y-1.5 text-xs">
        {ordered.map((key) => {
          const count = articlesByStatus[key] ?? 0;
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-neutral-300">{labels[key]}</span>
              <span className="text-neutral-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DomainCard({ articlesByDomain }) {
  const ordered = [
    "music",
    "art",
    "collectibles",
    "crypto",
    "cannabis",
    "multi",
    "unassigned",
  ];

  const labels = {
    music: "Music / ZIG ZAG",
    art: "Art / Galleries",
    collectibles: "Collectibles",
    crypto: "Crypto / Web3",
    cannabis: "Cannabis / Gunga",
    multi: "Multi-domain",
    unassigned: "Unassigned",
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-black/70 px-3 py-3">
      <div className="text-[11px] tracking-[0.18em] uppercase text-neutral-400 mb-2">
        Articles by Domain
      </div>
      <div className="space-y-1.5 text-xs">
        {ordered.map((key) => {
          const count = articlesByDomain[key] ?? 0;
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-neutral-300">{labels[key]}</span>
              <span className="text-neutral-400">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
