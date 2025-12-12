"use client";

/**
 * TroupeCompanyAtlasPanel
 * Static-but-structured atlas for Troupe Inc. as a psychedelic creative ecosystem.
 * Lives in the System section so the OS can explain itself from inside the UI.
 */

const DOMAIN_SECTIONS = [
  {
    id: "music",
    label: "Music · ZIG ZAG & Audio Frontier",
    tagline:
      "Psychedelic narrative albums, EPs, and singles as the flagship signal of Troupe Inc.",
    bullets: [
      "ZIG ZAG (G.L.J.) is the founder and flagship artist, defining the sonic identity of Troupe Inc.",
      "Always-on streaming hub on TroupeInc.com: a 24/7 curated playlist of ZIG ZAG’s catalog plus vetted indie guests.",
      "Playlist strategy uses external platforms (Spotify, Apple, etc.) as funnels back to the Troupe hub.",
      "Freemium-first: unlimited free listening to build a cult audience, then premium upsell via vinyl, exclusives, and fan-club style experiences.",
      "Future layers: sync licensing, live events, and token-gated music/NFT releases that cross-link with other domains.",
    ],
  },
  {
    id: "art",
    label: "Art · Psychedelic Galleries & Aesthetic Direction",
    tagline:
      "Digital and physical art direction for every surface: web, covers, merch, galleries.",
    bullets: [
      "Digital gallery of psychedelic-futurist visuals: neon dreamscapes, glitch, cosmic symbolism, poster-grade graphics.",
      "Art division defines visual language: color systems, typography, iconography, and motion motifs.",
      "Gallery doubles as a funnel into prints, merch, and NFT art drops with real utility for collectors and fans.",
      "Long-term vision includes VR galleries, interactive web exhibitions, and festival/gallery crossovers.",
      "Every release (music, cards, crypto, cannabis) passes through this visual filter to stay in the Troupe universe.",
    ],
  },
  {
    id: "collectibles",
    label: "Collectibles · Trading Cards & Hobby Culture",
    tagline: "Curated by a true collector: sports cards, TCGs, comics, pop culture.",
    bullets: [
      "Operates as Troupe Inc. Collectibles: a vault of graded slabs, PC heat, and hobby gems.",
      "Dual engine: short-term flips for liquidity + long-term holds as appreciating cultural assets.",
      "Uses arbitrage and grading strategies to convert hobby knowledge into revenue.",
      "Content pipeline: maildays, box breaks, and market breakdowns that feed both collectors and new fans.",
      "Future: Troupe-branded cards (physical + digital), crossovers with music/art, and tokenized hybrid collectibles.",
    ],
  },
  {
    id: "crypto",
    label: "Crypto & NFTs · Troupe Cryptospace",
    tagline:
      "Web3 layer for tokens, NFTs, arbitrage, and on-chain utility across the ecosystem.",
    bullets: [
      "Curated portfolio of crypto assets used for both strategy (yield, arbitrage) and utility (fees, mints, liquidity).",
      "AI-assisted trading and liquidity operations with controlled risk fund creative projects via on-chain gains.",
      "Utility-driven NFTs: membership, access, voting, and cross-domain perks; no empty speculation.",
      "Merged entertainment and Web3 into one immersive world under a single brand and URL.",
      "Long-term: DAO-like participation, metaverse environments, and social token experiments with community ownership.",
    ],
  },
  {
    id: "cannabis",
    label: "Cannabis & Counterculture · The Gunga Report",
    tagline:
      "Cannabis, psychedelics, and counterculture lifestyle as core creative context.",
    bullets: [
      "The Gunga Report is the cannabis and psychoactive culture channel: news, essays, and creative context.",
      "Tone: uncensored, street-smart, and honest — connecting legalization, creativity, and mental health discussions.",
      "Early revenue via sponsorships, affiliates, and lifestyle merch; later via branded products where legal.",
      "Events concept: 4/20 jams, lounges, mixed-media gatherings fusing music, art, and cannabis-friendly spaces.",
      "Positions Troupe as narrators and participants in modern counterculture, not just observers.",
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace & Product Management",
    tagline:
      "Unified commerce engine for digital and physical assets across all Troupe domains.",
    bullets: [
      "TroupeInc.com is the central marketplace: music, art, merch, collectibles, NFTs, and future print products.",
      "Freemium-to-premium funnel: free streaming and browsing lead into paid memberships, drops, and limited editions.",
      "Supports one-off products and ongoing catalogs (apparel lines, recurring zines, card runs).",
      "Multiple payment rails: fiat, crypto, and token-gated access, under a coherent psychedelic UX.",
      "Bridge between creative activity and real revenue, without losing aesthetic integrity.",
    ],
  },
  {
    id: "tech",
    label: "Technology, OS & Executive AI",
    tagline:
      "Operating system and AI backbone that makes a small team feel like a full enterprise.",
    bullets: [
      "Executive AI functions as interim CFO, technical lead, product manager, and analytics brain across all domains.",
      "Troupe OS (this app) is the control surface: Today, Creative, Money, Health, Analytics, System, Publishing.",
      "Architecture favors modular, cloud-native, Vercel-friendly patterns for fast shipping and scaling.",
      "Security posture: careful with wallets, user data, and infra; layered defenses plus monitoring and audit logs.",
      "Long-term: more automation, more AI agents, and a metaverse-style organization where human and AI workflows interlock.",
    ],
  },
  {
    id: "publishing",
    label: "Digital & Physical Publication Manager",
    tagline:
      "Editorial layer that turns the entire Troupe universe into stories, issues, and future print editions.",
    bullets: [
      "Publications, issues, and articles form the editorial skeleton for everything Troupe does.",
      "Publishing Workspace (Planner + Editor) manages catalogs for music, art, crypto, cannabis, collectibles, and OS stories.",
      "Reader and analytics views provide digital reading layouts plus telemetry for pipeline health and domain balance.",
      "Future: API-backed persistence, export-to-print pipelines, and a flagship physical edition for each era.",
      "This atlas lets the OS explain what Troupe Inc. is, without leaving the control surface.",
    ],
  },
];

const PRINCIPLES = [
  {
    label: "Psychedelic Aesthetic",
    description:
      "Bold, high-contrast, mind-bending visuals and concepts that carry the spirit of 1960s counterculture into a digital, AI-assisted future.",
  },
  {
    label: "Precision",
    description:
      "Data-informed decisions, disciplined execution, and technical rigor — wild ideas shipped with startup-grade reliability.",
  },
  {
    label: "Utility",
    description:
      "Every asset, from NFTs to zines, must do something: unlock access, deliver value, or deepen the ecosystem, never just exist as a gimmick.",
  },
  {
    label: "Profit",
    description:
      "Revenue is treated as oxygen for the art: a way to fund more risk, more independence, and more support for the creative community.",
  },
];

export default function TroupeCompanyAtlasPanel() {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-black/70 text-sm text-neutral-100">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 mb-1">
            Troupe Inc. · Company Atlas
          </p>
          <h2 className="text-lg sm:text-xl">
            Psychedelic Creative Ecosystem · Internal Reference
          </h2>
          <p className="mt-2 text-xs text-neutral-400 max-w-2xl">
            Encodes Troupe Inc. as a multi-domain, AI-augmented creative
            company so the OS can explain itself: music, art, collectibles,
            crypto, cannabis, marketplace, tech, and publishing.
          </p>
        </div>
        <div className="text-[10px] text-neutral-500 sm:text-right">
          <div>Version: v0.1 · Local</div>
          <div>Scope: Single-Founder + Executive AI</div>
          <div>Shape: Hub-and-spoke under Troupe Includes, LTD</div>
        </div>
      </div>

      {/* Principles */}
      <div className="rounded-lg border border-neutral-800 bg-black/70 px-3 py-3">
        <div className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 mb-2">
          Guiding Principles
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.label} className="space-y-1">
              <div className="text-xs font-semibold text-neutral-200">
                {p.label}
              </div>
              <p className="text-xs text-neutral-400">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Domains */}
      <div className="rounded-lg border border-neutral-800 bg-black/70 px-3 py-3">
        <div className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 mb-2">
          Core Domains & Sub-Brands
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {DOMAIN_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="rounded-lg border border-neutral-800 bg-black/80 px-3 py-3"
            >
              <div className="text-xs font-semibold text-neutral-100">
                {section.label}
              </div>
              <p className="mt-1 text-[11px] text-neutral-400">
                {section.tagline}
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] text-neutral-300">
                {section.bullets.map((item, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-[3px] h-[4px] w-[4px] rounded-full bg-emerald-400/80 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Executive AI */}
      <div className="rounded-lg border border-neutral-800 bg-black/70 px-3 py-3">
        <div className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 mb-2">
          Executive AI · Role Inside Troupe OS
        </div>
        <p className="text-xs text-neutral-300 mb-2">
          Executive AI is part of the leadership stack, not just tooling. It
          watches money, code, publishing, and growth, and assists the founder
          in making precise decisions at speed.
        </p>
        <ul className="space-y-1.5 text-[11px] text-neutral-300">
          <li>
            • Finance: tracks cash flow, project ROI, and assets across fiat,
            collectibles, and crypto.
          </li>
          <li>
            • Development: helps maintain the Troupe OS stack, from UI panels to
            APIs and deploy pipelines.
          </li>
          <li>
            • Collectibles & Crypto: scans markets for mispriced assets,
            arbitrage windows, and risk flags.
          </li>
          <li>
            • Publishing: maps events in the ecosystem into articles, issues,
            and future printed editions.
          </li>
          <li>
            • Security: watches web, wallet, and infrastructure signals for
            anomalies and threats.
          </li>
        </ul>
        <p className="mt-2 text-[11px] text-neutral-400">
          Today this atlas is static. Future upgrades can bind it to a living
          knowledge base so the OS can evolve its own self-docs as Troupe Inc.
          grows.
        </p>
      </div>
    </div>
  );
}
