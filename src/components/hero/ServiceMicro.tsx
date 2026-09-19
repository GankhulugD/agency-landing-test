"use client";

import { cn } from "@/lib/utils";

export function ServiceMicroVisual({
  serviceId,
  active,
}: {
  serviceId: string;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-3 top-3 h-10 w-10 transition-opacity duration-500",
        active ? "opacity-85" : "opacity-0 group-hover:opacity-55"
      )}
      aria-hidden
    >
      {serviceId === "web-dev" && <WebDevMicro />}
      {serviceId === "video-audio" && <WaveformMicro />}
      {serviceId === "digital-ads" && <FunnelMicro />}
      {serviceId === "consulting" && <FlowMicro />}
      {serviceId === "print" && <CmykMicro />}
      {serviceId === "chatbot" && <ChatMicro />}
    </div>
  );
}

function WebDevMicro() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm border border-cyan-500/20 bg-black/60 font-mono text-[6px] leading-tight text-cyan-400/80">
      <p className="p-0.5">&lt;Hero/&gt;</p>
    </div>
  );
}

function WaveformMicro() {
  return (
    <div className="flex h-full items-end justify-center gap-[2px] pb-0.5">
      {[0.4, 0.7, 1, 0.55, 0.85].map((h, i) => (
        <span
          key={i}
          className="service-wave-bar w-[2px] rounded-full bg-champagne/60"
          style={{ height: `${h * 100}%`, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

function FunnelMicro() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-0.5 px-1">
      {[100, 68, 38].map((w, i) => (
        <div
          key={i}
          className="h-1 rounded-full bg-champagne/40"
          style={{ width: `${w * 0.22}px` }}
        />
      ))}
    </div>
  );
}

function FlowMicro() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      <line x1="8" y1="20" x2="32" y2="20" stroke="rgba(209,199,189,0.35)" strokeWidth="1" />
      <circle cx="8" cy="20" r="3" className="fill-champagne/60" />
      <circle cx="20" cy="20" r="3" className="fill-champagne/40" />
      <circle cx="32" cy="20" r="3" className="fill-champagne/60" />
    </svg>
  );
}

function CmykMicro() {
  return (
    <div className="relative h-full w-full">
      {["bg-cyan-400/40", "bg-fuchsia-400/40", "bg-yellow-300/40"].map((c, i) => (
        <div
          key={c}
          className={cn("absolute inset-x-1 h-2.5 rounded-sm border border-white/10", c)}
          style={{ top: `${4 + i * 5}px` }}
        />
      ))}
    </div>
  );
}

function ChatMicro() {
  return (
    <div className="flex h-full flex-col justify-center gap-1 px-0.5">
      <div className="ml-auto h-2.5 w-6 rounded-sm rounded-tr-none border border-white/15 bg-white/[0.06]" />
      <div className="flex items-center gap-0.5">
        <span className="h-1 w-1 rounded-full bg-emerald-400/80" />
        <div className="h-2.5 w-7 rounded-sm rounded-tl-none border border-cyan-500/20 bg-cyan-500/10" />
      </div>
    </div>
  );
}
