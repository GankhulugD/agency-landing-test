"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { services, type Service } from "@/lib/copy";
import type { ServiceInteraction } from "@/components/hero/types";
import { cn } from "@/lib/utils";
import { ServiceMicroVisual } from "./ServiceMicro";
import { ServiceExpandedEffect } from "./ServiceExpandedEffect";

type ServicesProps = {
  gridClassName?: string;
  serviceInteraction: RefObject<ServiceInteraction>;
  onInteractionPulse?: () => void;
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

function computeNeedleAngle(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return (
    Math.atan2(cy - window.innerHeight / 2, cx - window.innerWidth / 2) -
    Math.PI / 2
  );
}

function ServiceAccordionPanel({
  service,
  isActive,
}: {
  service: Service;
  isActive: boolean;
}) {
  return (
    <div className="border-x border-b border-amber-400/25 bg-white/[0.06] px-4 pb-4 pt-3 backdrop-blur-md">
      <ServiceExpandedEffect serviceId={service.id} active={isActive} />

      <ul className="mt-4 space-y-1.5">
        {service.capabilities.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-[12px] text-bone/60"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-champagne/60" />
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {service.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-sm border border-white/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-bone/45"
          >
            {tag}
          </span>
        ))}
      </div>

      <a
        href="#contact"
        className="mt-4 inline-block border border-white/[0.12] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 transition-all duration-500 hover:border-champagne/40 hover:text-bone"
      >
        Request Strategy
      </a>
    </div>
  );
}

function ServiceAccordionItem({
  service,
  index,
  isActive,
  isDimmed,
  onSelect,
  itemRef,
}: {
  service: Service;
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onSelect: (index: number, el: HTMLElement) => void;
  itemRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      layout
      ref={itemRef}
      data-service-card-wrap
      data-snap-card
      className={cn(
        "service-snap-card transition-opacity duration-500",
        isDimmed && "opacity-40"
      )}
    >
      <motion.button
        layout="position"
        type="button"
        data-service-card
        onClick={(e) =>
          onSelect(
            index,
            e.currentTarget.closest("[data-service-card-wrap]") as HTMLElement
          )
        }
        className={cn(
          "group relative w-full overflow-hidden rounded-sm border text-left backdrop-blur-md transition-all duration-500",
          "flex flex-col gap-1.5 p-3.5 sm:flex-row sm:items-start sm:gap-4 sm:p-4",
          isActive
            ? "rounded-b-none border-amber-400/50 border-b-transparent bg-white/10 shadow-[0_0_24px_rgba(209,199,189,0.12)]"
            : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.045]"
        )}
        aria-expanded={isActive}
      >
        <ServiceMicroVisual serviceId={service.id} active={isActive} />
        <span className="font-mono text-[10px] tracking-[0.2em] text-champagne/70">
          {service.index}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-medium tracking-tight text-bone sm:text-sm">
            {service.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-bone/45 transition-colors duration-500 group-hover:text-bone/60 sm:mt-1 sm:text-[12px]">
            {service.description}
          </p>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key={`panel-${service.id}`}
            layout
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="overflow-hidden will-change-[height,opacity]"
          >
            <ServiceAccordionPanel service={service} isActive={isActive} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ServicesGrid({
  gridClassName,
  serviceInteraction,
  onInteractionPulse,
}: ServicesProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollActiveIntoView = useCallback((index: number) => {
    const el = cardRefs.current[index];
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const handleSelect = useCallback(
    (index: number, el: HTMLElement) => {
      const next = activeIndex === index ? null : index;
      setActiveIndex(next);

      if (next === null) {
        serviceInteraction.current.activeIndex = null;
        serviceInteraction.current.pulse = 0;
        onInteractionPulse?.();
        return;
      }

      serviceInteraction.current.activeIndex = next;
      serviceInteraction.current.targetAngle = computeNeedleAngle(el);
      serviceInteraction.current.pulse = 1;
      onInteractionPulse?.();
      scrollActiveIntoView(next);
    },
    [activeIndex, onInteractionPulse, scrollActiveIntoView, serviceInteraction]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const t = window.setTimeout(() => {
      scrollActiveIntoView(activeIndex);
      onInteractionPulse?.();
    }, 320);
    return () => clearTimeout(t);
  }, [activeIndex, onInteractionPulse, scrollActiveIntoView]);

  return (
    <LayoutGroup>
      <motion.div layout className={cn(gridClassName, "w-full")}>
          {services.map((service, index) => (
            <ServiceAccordionItem
              key={service.id}
              service={service}
              index={index}
              isActive={activeIndex === index}
              isDimmed={activeIndex !== null && activeIndex !== index}
              onSelect={handleSelect}
              itemRef={(el) => {
                cardRefs.current[index] = el;
              }}
            />
          ))}
      </motion.div>
    </LayoutGroup>
  );
}
