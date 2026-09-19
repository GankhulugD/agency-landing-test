"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type EffectProps = { active: boolean };

export function ServiceExpandedEffect({
  serviceId,
  active,
}: {
  serviceId: string;
  active: boolean;
}) {
  switch (serviceId) {
    case "web-dev":
      return <WebDevEffect active={active} />;
    case "video-audio":
      return <VideoAudioEffect active={active} />;
    case "digital-ads":
      return <DigitalAdsEffect active={active} />;
    case "consulting":
      return <ConsultingEffect active={active} />;
    case "print":
      return <PrintCmykEffect active={active} />;
    case "chatbot":
      return <ChatbotEffect active={active} />;
    default:
      return null;
  }
}

/* ── 01 Web Development ── */

const CODE_LINES = [
  { text: "import { Hero } from '@/components/Hero'", tone: "keyword" },
  { text: "export default function Page() {", tone: "plain" },
  { text: "  return <Hero />", tone: "jsx" },
  { text: "}", tone: "plain" },
] as const;

function WebDevEffect({ active }: EffectProps) {
  const [typed, setTyped] = useState("");
  const [lineIdx, setLineIdx] = useState(0);
  const [frame, setFrame] = useState<"sm" | "md" | "lg">("md");

  useEffect(() => {
    if (!active) {
      setTyped("");
      setLineIdx(0);
      setFrame("md");
      return;
    }

    const line = CODE_LINES[lineIdx]?.text ?? "";
    if (typed.length < line.length) {
      const t = window.setTimeout(
        () => setTyped(line.slice(0, typed.length + 1)),
        28
      );
      return () => clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setTyped("");
      setLineIdx((i) => (i + 1) % CODE_LINES.length);
    }, 1400);
    return () => clearTimeout(t);
  }, [active, typed, lineIdx]);

  useEffect(() => {
    if (!active) return;
    const order: Array<"sm" | "md" | "lg"> = ["sm", "md", "lg", "md"];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setFrame(order[i]!);
    }, 2200);
    return () => clearInterval(id);
  }, [active]);

  const toneClass = (tone: string) => {
    if (tone === "keyword") return "text-cyan-400/90";
    if (tone === "jsx") return "text-amber-300/85";
    return "text-bone/55";
  };

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
      <div className="overflow-hidden rounded-sm border border-cyan-500/15 bg-[#0a0e12]">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
          <span className="ml-1 font-mono text-[8px] text-bone/30">page.tsx</span>
        </div>
        <pre className="p-2.5 font-mono text-[9px] leading-relaxed">
          <span className={toneClass(CODE_LINES[lineIdx]?.tone ?? "plain")}>
            {typed}
          </span>
          {active && <span className="service-cursor-blink text-champagne">|</span>}
        </pre>
      </div>
      <div className="flex items-center justify-center rounded-sm border border-white/[0.08] bg-black/40 p-2">
        <motion.div
          animate={
            active
              ? {
                  width: frame === "sm" ? 40 : frame === "md" ? 64 : 88,
                  height: 56,
                }
              : { width: 64, height: 56 }
          }
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="rounded border border-champagne/25 bg-white/[0.04]"
        >
          <div className="m-1 h-2 rounded-sm bg-champagne/20" />
          <div className="mx-1 mt-1 h-1 rounded-sm bg-white/10" />
          <div className="mx-1 mt-0.5 h-1 w-2/3 rounded-sm bg-white/[0.06]" />
        </motion.div>
      </div>
    </div>
  );
}

/* ── 02 Video & Audio ── */

function VideoAudioEffect({ active }: EffectProps) {
  const bars = [0.3, 0.55, 0.8, 0.45, 0.9, 0.6, 0.75, 0.5, 0.85, 0.4, 0.7, 0.95, 0.55, 0.65];
  return (
    <div className="overflow-hidden rounded-sm border border-white/[0.08] bg-[#0b0b0b]">
      <div className="flex border-b border-white/[0.06] px-2 py-1 font-mono text-[7px] uppercase tracking-widest text-bone/35">
        <span className="w-12">00:00</span>
        <span className="flex-1 text-center">Timeline</span>
        <span>00:24</span>
      </div>
      <div className="relative px-2 py-2">
        <div className="mb-1.5 h-5 rounded-sm border border-violet-500/20 bg-violet-500/[0.08]">
          <motion.div
            className="h-full rounded-sm bg-violet-400/25"
            initial={{ width: "0%" }}
            animate={{ width: active ? "42%" : "0%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="mb-1.5 h-5 rounded-sm border border-cyan-500/20 bg-cyan-500/[0.06]">
          <motion.div
            className="h-full rounded-sm bg-cyan-400/20"
            initial={{ width: "0%" }}
            animate={{ width: active ? "68%" : "0%" }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          />
        </div>
        <div className="relative flex h-10 items-end gap-[3px] rounded-sm border border-champagne/15 bg-black/50 px-2 pb-1.5 pt-1">
          {bars.map((h, i) => (
            <motion.span
              key={i}
              className="w-[4px] rounded-full bg-gradient-to-t from-champagne/25 to-champagne/75"
              initial={{ height: 4 }}
              animate={{ height: active ? h * 36 : 4 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: "easeOut" }}
            />
          ))}
          {active && (
            <div className="service-playhead absolute inset-y-0 w-px bg-champagne/80" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 03 Digital Advertising ── */

function DigitalAdsEffect({ active }: EffectProps) {
  const stages = [
    { label: "Impressions", value: "842K", w: "100%" },
    { label: "Clicks", value: "24.8K", w: "62%" },
    { label: "Conversions", value: "3.1K", w: "34%" },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-sm border border-emerald-500/15 bg-black/45 p-2.5">
        <p className="font-mono text-[8px] uppercase tracking-widest text-bone/35">ROI Growth</p>
        <svg viewBox="0 0 120 48" className="mt-1 h-12 w-full">
          <polyline
            points="0,44 20,38 40,32 60,22 80,14 100,6 120,2"
            fill="none"
            stroke="rgba(52,211,153,0.7)"
            strokeWidth="1.5"
            className={cn(active && "service-roi-line")}
          />
        </svg>
        <motion.p
          className="font-mono text-[11px] text-emerald-400/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ delay: 0.6 }}
        >
          +124% CTR
        </motion.p>
      </div>
      <div className="space-y-1.5 rounded-sm border border-white/[0.08] bg-black/45 p-2.5">
        {stages.map((s, i) => (
          <div key={s.label}>
            <div className="mb-0.5 flex justify-between font-mono text-[8px] text-bone/45">
              <span>{s.label}</span>
              <span className="text-champagne/70">{s.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-champagne/30 to-champagne/70"
                initial={{ width: "0%" }}
                animate={{ width: active ? s.w : "0%" }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
        <div className="relative mt-2 flex h-8 items-center justify-center">
          {active && (
            <span className="service-target-ring absolute h-6 w-6 rounded-full border border-champagne/40" />
          )}
          <span className="relative h-2 w-2 rounded-full bg-champagne/90" />
        </div>
      </div>
    </div>
  );
}

/* ── 04 Management Consulting ── */

function ConsultingEffect({ active }: EffectProps) {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    if (!active) {
      setActiveNode(0);
      return;
    }
    setActiveNode(0);
    const id = window.setInterval(
      () => setActiveNode((a) => (a + 1) % 4),
      1800
    );
    return () => clearInterval(id);
  }, [active]);

  const nodes = [
    { x: 30, label: "Input" },
    { x: 120, label: "Analyze" },
    { x: 210, label: "Outcome" },
    { x: 150, y: 68, label: "Branch" },
  ];

  return (
    <div className="rounded-sm border border-white/[0.08] bg-black/45 p-3">
      <svg viewBox="0 0 280 80" className="h-20 w-full">
        <path
          d="M 30 40 H 90 M 120 40 H 180 M 210 40 H 250"
          stroke="rgba(209,199,189,0.25)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M 120 40 V 62 H 180 V 40"
          stroke="rgba(209,199,189,0.2)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="4 3"
          className={cn(active && "service-flow-dash")}
        />
        {nodes.map((n, i) => (
          <g key={n.label}>
            <circle
              cx={n.x}
              cy={n.y ?? 40}
              r="14"
              className={cn(
                "fill-white/[0.04] stroke-champagne/40 transition-all duration-500",
                active && activeNode === i && "stroke-champagne fill-champagne/15"
              )}
              strokeWidth="1"
            />
            <text
              x={n.x}
              y={(n.y ?? 40) + 3}
              textAnchor="middle"
              className="fill-bone/50 font-mono text-[7px]"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-1 text-center font-mono text-[8px] text-bone/35">
        Phase 1 → Analyze → Branch → Optimize
      </p>
    </div>
  );
}

/* ── 05 Print Design — CMYK auto-separation ── */

const CMYK = [
  { id: "c", label: "C", color: "rgba(34,211,238,0.55)", z: 16 },
  { id: "m", label: "M", color: "rgba(244,114,182,0.55)", z: 8 },
  { id: "y", label: "Y", color: "rgba(250,204,21,0.5)", z: 0 },
  { id: "k", label: "K", color: "rgba(255,255,255,0.35)", z: -8 },
] as const;

function PrintCmykEffect({ active }: EffectProps) {
  return (
    <div className="service-cmyk-stage relative flex h-32 items-center justify-center overflow-hidden rounded-sm border border-white/[0.08] bg-black/45 [perspective:800px]">
      <div
        className="service-bleed-grid pointer-events-none absolute inset-2 border border-dashed border-white/10"
        aria-hidden
      />
      {CMYK.map((plate, i) => (
        <motion.div
          key={plate.id}
          className="service-cmyk-plate absolute h-20 w-28 rounded-sm border border-white/15"
          style={{ backgroundColor: plate.color, zIndex: i, transformStyle: "preserve-3d" }}
          initial={{
            transform: `rotateX(8deg) translateZ(${plate.z}px) translateX(0px)`,
          }}
          animate={{
            transform: active
              ? `rotateX(12deg) translateZ(${plate.z + i * 6}px) translateX(${(i - 1.5) * 14}px)`
              : `rotateX(8deg) translateZ(${plate.z}px) translateX(0px)`,
          }}
          transition={{
            duration: 0.85,
            delay: i * 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="absolute left-1.5 top-1 font-mono text-[9px] font-bold text-black/50">
            {plate.label}
          </span>
        </motion.div>
      ))}
      <span className="absolute bottom-2 font-mono text-[8px] uppercase tracking-widest text-bone/30">
        CMYK separation
      </span>
    </div>
  );
}

/* ── 06 Chatbot / AI Integration ── */

type ChatPhase = "user" | "typing" | "ai";

const CHAT_TURNS = [
  {
    user: "Automate lead qualification?",
    ai: "AI Agent: Task completed successfully ✓",
  },
  {
    user: "Connect to our CRM pipeline?",
    ai: "How can I assist your workflow?",
  },
] as const;

function ChatbotEffect({ active }: EffectProps) {
  const [turnIdx, setTurnIdx] = useState(0);
  const [phase, setPhase] = useState<ChatPhase>("user");

  useEffect(() => {
    if (!active) {
      setTurnIdx(0);
      setPhase("user");
      return;
    }

    let cancelled = false;
    let turn = 0;
    const timers: number[] = [];

    const playTurn = () => {
      if (cancelled) return;
      setTurnIdx(turn);
      setPhase("user");
      timers.push(window.setTimeout(() => !cancelled && setPhase("typing"), 700));
      timers.push(window.setTimeout(() => !cancelled && setPhase("ai"), 1900));
    };

    playTurn();
    const cycleTimer = window.setInterval(() => {
      turn = (turn + 1) % CHAT_TURNS.length;
      playTurn();
    }, 5200);

    return () => {
      cancelled = true;
      clearInterval(cycleTimer);
      timers.forEach(clearTimeout);
    };
  }, [active]);

  const turn = CHAT_TURNS[turnIdx]!;

  return (
    <div className="overflow-hidden rounded-sm border border-cyan-500/15 bg-[#0a0c10]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="service-ai-status absolute inline-flex h-full w-full rounded-full bg-emerald-400/80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-bone/50">
            AI Agent
          </span>
        </div>
        <span className="font-mono text-[8px] text-cyan-400/70">Online</span>
      </div>

      <div className="space-y-2 p-3">
        <motion.div
          key={`user-${turnIdx}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: active ? 1 : 0, y: 0 }}
          transition={{ duration: 0.35 }}
          className="ml-auto max-w-[85%] rounded-md rounded-tr-sm border border-white/[0.08] bg-white/[0.06] px-2.5 py-1.5"
        >
          <p className="text-[10px] leading-snug text-bone/75">{turn.user}</p>
        </motion.div>

        {phase === "typing" && active && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mr-auto flex max-w-[70%] items-center gap-1 rounded-md rounded-tl-sm border border-cyan-500/15 bg-cyan-500/[0.08] px-2.5 py-2"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="service-chat-dot h-1.5 w-1.5 rounded-full bg-cyan-300/80"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </motion.div>
        )}

        {phase === "ai" && active && (
          <motion.div
            key={`ai-${turnIdx}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mr-auto max-w-[90%] rounded-md rounded-tl-sm border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1.5"
          >
            <p className="font-mono text-[9px] leading-snug text-emerald-300/90">
              {turn.ai}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
