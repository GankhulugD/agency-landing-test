"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  strength?: number;
};

export function MagneticButton({
  children,
  className,
  href,
  onClick,
  strength = 0.28,
}: MagneticButtonProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = (href ? anchorRef.current : buttonRef.current) as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = (href ? anchorRef.current : buttonRef.current) as HTMLElement | null;
    if (el) el.style.transform = "";
  };

  const sharedClass = cn(
    "inline-flex items-center gap-2 transition-transform duration-200 will-change-transform",
    className
  );

  if (href) {
    return (
      <a
        ref={anchorRef}
        href={href}
        className={sharedClass}
        data-magnetic
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className={sharedClass}
      data-magnetic
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </button>
  );
}
