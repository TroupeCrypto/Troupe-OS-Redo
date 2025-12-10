// components/ScratchpadPanel.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePersistentState } from "../lib/usePersistentState";
import { useEventLog } from "../lib/useEventLog";

const TABS = ["Notes", "Voice", "Sketch", "Code", "Dump"];

export default function ScratchpadPanel() {
  const [state, setState, isHydrated] = usePersistentState(
    "scratchpad",
    {
      notes: "",
      voice: "",
      sketch: "",
      code: "",
      dump: "",
    }
  );
  const { appendEvent } = useEventLog();
  const [tab, setTab] = useState("Notes");
  const [isRecording, setIsRecording] = useState(false);
  const [pinTarget, setPinTarget] = useState("Today");
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const safe = useMemo(
    () => ({
      notes: state?.notes ?? "",
      voice: state?.voice ?? "",
      sketch: state?.sketch ?? "",
      code: state?.code ?? "",
      dump: state?.dump ?? "",
    }),
    [state]
  );

  // Canvas restore
  useEffect(() => {
    if (!canvasRef.current || !safe.sketch) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = safe.sketch;
  }, [safe.sketch]);

  const updateField = (field, value) => {
    setState((curr) => ({ ...(curr || {}), [field]: value }));
  };

  const startVoice = () => {
    const Speech =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!Speech) {
      window.alert("Speech recognition not supported in this browser.");
      return;
    }
    const rec = new Speech();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join(" ");
      updateField("voice", transcript);
      appendEvent({
        panel: "Scratchpad",
        category: "Voice",
        action: "voice-captured",
        data: { transcript },
      });
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    setIsRecording(true);
    rec.start();
  };

  const handlePin = () => {
    appendEvent({
      panel: "Scratchpad",
      category: "Actions",
      action: "pin-note",
      outcome: "win",
      data: { target: pinTarget, content: safe.notes || safe.dump },
      tags: ["pinned"],
    });
    window.alert(`Pinned to ${pinTarget} and sent to history.`);
  };

  const handleMouseDown = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    updateField("sketch", dataUrl);
  };

  const clearSketch = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    updateField("sketch", "");
  };

  return (
    <section className="border-t border-white/40 px-4 py-3 sm:px-6 sm:py-4">
      <h2 className="text-xs tracking-[0.25em] uppercase mb-2">
        Scratchpad
      </h2>

      <div className="flex flex-wrap gap-2 mb-3 text-[11px] uppercase tracking-[0.18em]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              "px-3 py-1 border " +
              (tab === t
                ? "border-white/90"
                : "border-white/40 opacity-70")
            }
          >
            {t}
          </button>
        ))}
      </div>

      {!isHydrated ? (
        <p className="text-sm opacity-70">Loading…</p>
      ) : (
        <>
          {tab === "Notes" && (
            <div className="space-y-2">
              <p className="text-sm opacity-80">
                Structured notes that can pin into other panels.
              </p>
              <textarea
                value={safe.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Drop organized notes here."
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[160px]"
              />
              <div className="flex gap-2 items-center">
                <select
                  value={pinTarget}
                  onChange={(e) => setPinTarget(e.target.value)}
                  className="bg-black/60 border border-white/30 px-2 py-2 text-xs tracking-[0.18em] uppercase outline-none focus:border-white/80"
                >
                  {[
                    "Today",
                    "Obligations",
                    "Money",
                    "Creative",
                    "Health",
                    "System",
                  ].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handlePin}
                  className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
                >
                  Pin to panel
                </button>
              </div>
            </div>
          )}

          {tab === "Voice" && (
            <div className="space-y-2">
              <p className="text-sm opacity-80">
                Voice-to-text capture uses the browser Speech API and stores
                locally.
              </p>
              <button
                type="button"
                onClick={startVoice}
                className="px-4 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
              >
                {isRecording ? "Listening…" : "Record voice"}
              </button>
              <textarea
                value={safe.voice}
                onChange={(e) => updateField("voice", e.target.value)}
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[120px]"
              />
            </div>
          )}

          {tab === "Sketch" && (
            <div className="space-y-2">
              <p className="text-sm opacity-80">
                Freehand sketch canvas, stored as an image in localStorage.
              </p>
              <canvas
                ref={canvasRef}
                width={640}
                height={320}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-white/40 bg-black"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearSketch}
                  className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
                >
                  Clear
                </button>
                {safe.sketch ? (
                  <span className="text-[11px] opacity-70">
                    Sketch saved locally.
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {tab === "Code" && (
            <div className="space-y-2">
              <p className="text-sm opacity-80">
                Monospace code scratchpad with preserved formatting.
              </p>
              <textarea
                value={safe.code}
                onChange={(e) => updateField("code", e.target.value)}
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[200px] font-mono"
              />
            </div>
          )}

          {tab === "Dump" && (
            <div className="space-y-2">
              <p className="text-sm opacity-80">
                Burner quick-dump clears on refresh toggle.
              </p>
              <textarea
                value={safe.dump}
                onChange={(e) => updateField("dump", e.target.value)}
                className="w-full bg-black/60 border border-white/30 px-3 py-2 text-sm leading-relaxed outline-none focus:border-white/80 resize-none min-h-[120px]"
              />
              <button
                type="button"
                onClick={() => updateField("dump", "")}
                className="px-3 py-2 text-xs border border-white/80 tracking-[0.18em] uppercase"
              >
                Clear Dump
              </button>
            </div>
          )}
        </>
      )}

      <p className="mt-2 text-[11px] opacity-60">
        Content saved automatically as you type. Voice, sketch, and code are
        stored locally and can be pinned into other panels through history
        events.
      </p>
    </section>
  );
}
