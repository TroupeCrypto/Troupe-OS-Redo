"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "publishing_state_v1";

function nowIso() {
  return new Date().toISOString();
}

// ---------- ID Helpers ----------
function randomId(prefix) {
  const rnd =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
  return `${prefix}_${rnd}`;
}

// ---------- Default / Migration ----------
function createEmptyState() {
  return {
    version: "v1",
    publications: {},
    issues: {},
    articles: {},
    selectedPublicationId: null,
    selectedIssueId: null,
    selectedArticleId: null,
  };
}

function migrateState(raw) {
  if (!raw || typeof raw !== "object") return createEmptyState();
  const base = createEmptyState();

  const merged = {
    ...base,
    ...raw,
    publications: raw.publications || {},
    issues: raw.issues || {},
    articles: raw.articles || {},
  };

  merged.version = "v1";
  return merged;
}

// ---------- Persistence ----------
function readStateFromStorage() {
  if (typeof window === "undefined") return createEmptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyState();
    return migrateState(JSON.parse(raw));
  } catch (err) {
    console.error("Failed to read publishing state:", err);
    return createEmptyState();
  }
}

function writeStateToStorage(state) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to write publishing state:", err);
  }
}

// ---------- State Mutators ----------
function addPublication(state, payload) {
  const id = payload.id || randomId("pub");
  const ts = nowIso();

  return {
    ...state,
    publications: {
      ...state.publications,
      [id]: {
        id,
        title: payload.title || "Untitled Publication",
        type: payload.type || "hybrid",
        status: payload.status || "draft",
        primaryDomain: payload.primaryDomain || "multi",
        description: payload.description || "",
        createdAt: payload.createdAt || ts,
        updatedAt: ts,
      },
    },
    selectedPublicationId: id,
  };
}

function updatePublication(state, id, patch) {
  const pub = state.publications[id];
  if (!pub) return state;

  return {
    ...state,
    publications: {
      ...state.publications,
      [id]: {
        ...pub,
        ...patch,
        updatedAt: nowIso(),
      },
    },
  };
}

function addIssue(state, payload) {
  const id = payload.id || randomId("issue");
  const ts = nowIso();

  return {
    ...state,
    issues: {
      ...state.issues,
      [id]: {
        id,
        publicationId: payload.publicationId || null,
        title: payload.title || "Untitled Issue",
        issueNumber: payload.issueNumber || null,
        volume: payload.volume || null,
        type: payload.type || "digital",
        layoutStatus: payload.layoutStatus || "planned",
        plannedPublicationDate: payload.plannedPublicationDate || null,
        actualPublicationDate: payload.actualPublicationDate || null,
        printRunSize: payload.printRunSize || null,
        createdAt: payload.createdAt || ts,
        updatedAt: ts,
      },
    },
    selectedIssueId: id,
  };
}

function updateIssue(state, id, patch) {
  const issue = state.issues[id];
  if (!issue) return state;

  return {
    ...state,
    issues: {
      ...state.issues,
      [id]: {
        ...issue,
        ...patch,
        updatedAt: nowIso(),
      },
    },
  };
}

function addArticle(state, payload) {
  const id = payload.id || randomId("article");
  const ts = nowIso();

  return {
    ...state,
    articles: {
      ...state.articles,
      [id]: {
        id,
        publicationId: payload.publicationId || null,
        issueId: payload.issueId || null,
        title: payload.title || "Untitled Article",
        slug: payload.slug || null,
        body: payload.body || "",
        authorId: payload.authorId || "ZIG_ZAG",
        section: payload.section || "feature",
        tags: payload.tags || [],
        status: payload.status || "draft",
        scheduledAt: payload.scheduledAt || null,
        publishedAt: payload.publishedAt || null,
        createdAt: payload.createdAt || ts,
        updatedAt: ts,
      },
    },
    selectedArticleId: id,
  };
}

function updateArticle(state, id, patch) {
  const article = state.articles[id];
  if (!article) return state;

  return {
    ...state,
    articles: {
      ...state.articles,
      [id]: {
        ...article,
        ...patch,
        updatedAt: nowIso(),
      },
    },
  };
}

function setSelection(state, { publicationId, issueId, articleId }) {
  return {
    ...state,
    selectedPublicationId:
      publicationId === undefined
        ? state.selectedPublicationId
        : publicationId,
    selectedIssueId:
      issueId === undefined ? state.selectedIssueId : issueId,
    selectedArticleId:
      articleId === undefined ? state.selectedArticleId : articleId,
  };
}

// ---------- Hook ----------
export function usePublishingStore() {
  const [state, setState] = useState(() => readStateFromStorage());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readStateFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStateToStorage(state);
  }, [state, hydrated]);

  const publicationsList = useMemo(
    () => Object.values(state.publications).sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || "")
    ),
    [state.publications]
  );

  const issuesList = useMemo(
    () => Object.values(state.issues).sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || "")
    ),
    [state.issues]
  );

  const articlesList = useMemo(
    () => Object.values(state.articles).sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || "")
    ),
    [state.articles]
  );

  const selectedPublication =
    state.selectedPublicationId &&
    state.publications[state.selectedPublicationId];

  const selectedIssue =
    state.selectedIssueId && state.issues[state.selectedIssueId];

  const selectedArticle =
    state.selectedArticleId && state.articles[state.selectedArticleId];

  const actions = {
    createPublication: (payload = {}) =>
      setState((s) => addPublication(s, payload)),
    updatePublication: (id, patch) =>
      setState((s) => updatePublication(s, id, patch)),

    createIssue: (payload = {}) =>
      setState((s) => addIssue(s, payload)),
    updateIssue: (id, patch) =>
      setState((s) => updateIssue(s, id, patch)),

    createArticle: (payload = {}) =>
      setState((s) => addArticle(s, payload)),
    updateArticle: (id, patch) =>
      setState((s) => updateArticle(s, id, patch)),

    setSelection: (sel) =>
      setState((s) => setSelection(s, sel)),
  };

  return {
    hydrated,
    state,
    publicationsList,
    issuesList,
    articlesList,
    selectedPublication,
    selectedIssue,
    selectedArticle,
    actions,
  };
}
