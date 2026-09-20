"use client";

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { services, type Service } from "@/lib/copy";
import type { ServiceInteraction } from "@/components/hero/types";
import { cn } from "@/lib/utils";
import { ServiceMicroVisual } from "./ServiceMicro";
import { ServiceExpandedEffect } from "./ServiceExpandedEffect";
import { useTranslations } from "@/lib/useTranslations";

const SERVICE_KEY_MAP = {
  "web-dev": "s01",
  "video-audio": "s02",
  "digital-ads": "s03",
  consulting: "s04",
  print: "s05",
  chatbot: "s06",
} as const;

type ServicesProps = {
  gridClassName?: string;
  serviceInteraction: RefObject<ServiceInteraction>;
  scrollIntoViewOnExpand?: boolean;
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
  onSelect: (index: number, el: HTMLElement, e: MouseEvent<HTMLButtonElement>) => void;
  itemRef?: (el: HTMLDivElement | null) => void;
}) {
  const t = useTranslations();
  const sKey = SERVICE_KEY_MAP[service.id as keyof typeof SERVICE_KEY_MAP];
  const translatedService = t.services[sKey];

  return (
    <div
      ref={itemRef}
      data-service-card-wrap
      className={cn(
        "transform-gpu transition-opacity duration-500",
        isDimmed && "opacity-40"
      )}
    >
      <button
        type="button"
        data-service-card
        onClick={(e) =>
          onSelect(
            index,
            e.currentTarget.closest("[data-service-card-wrap]") as HTMLElement,
            e
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
        <span className="shrink-0 font-mono text-[10px] tracking-[0.25em] text-champagne/40 transition-colors group-hover:text-champagne/60 sm:mt-[1px]">
          {service.index}
        </span>
        <ServiceMicroVisual serviceId={service.id} active={isActive} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-medium tracking-tight text-bone sm:text-sm">
            {translatedService.title}
          </h3>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-bone/45 transition-colors duration-500 group-hover:text-bone/60 sm:mt-1 sm:text-[12px]">
            {translatedService.description}
          </p>
        </div>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="will-change-[height,transform,opacity]"
          >
            <div className="border-x border-b border-amber-400/25 bg-white/[0.06] px-4 pb-4 pt-3 backdrop-blur-md">
              <ServiceExpandedEffect serviceId={service.id} active={true} />
              
              <ul className="mt-4 space-y-1.5">
                {translatedService.capabilities.map((item, idx) => (
                  <li
                    key={`${service.id}-cap-${idx}`}
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
                onClick={(e) => e.stopPropagation()}
                className="mt-4 inline-block border border-white/[0.12] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone/70 transition-all duration-500 hover:border-champagne/40 hover:text-bone"
              >
                Request Strategy
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ServicesGrid({
  gridClassName,
  serviceInteraction,
  scrollIntoViewOnExpand = true,
}: ServicesProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const onSelect = useCallback(
    (index: number, el: HTMLElement, e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const newIndex = activeIndex === index ? null : index;
      setActiveIndex(newIndex);

      if (serviceInteraction.current) {
        serviceInteraction.current.activeIndex = newIndex;
        serviceInteraction.current.targetAngle =
          newIndex !== null ? computeNeedleAngle(el) : 0;
        serviceInteraction.current.pulse = newIndex !== null ? 1 : 0;
        setTimeout(() => {
          if (serviceInteraction.current) {
            serviceInteraction.current.pulse = 0;
          }
        }, 180);
      }

      if (
        scrollIntoViewOnExpand &&
        newIndex !== null &&
        itemRefs.current[index]
      ) {
        setTimeout(() => {
          const item = itemRefs.current[index];
          if (item) {
            const rect = item.getBoundingClientRect();
            const isBelow = rect.bottom > window.innerHeight - 40;
            if (isBelow) {
              item.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }, 100);
      }
    },
    [activeIndex, serviceInteraction, scrollIntoViewOnExpand]
  );

  return (
    <div className={gridClassName}>
      {services.map((service, i) => (
        <ServiceAccordionItem
          key={service.id}
          service={service}
          index={i}
          isActive={activeIndex === i}
          isDimmed={activeIndex !== null && activeIndex !== i}
          onSelect={onSelect}
          itemRef={(el) => {
            itemRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
