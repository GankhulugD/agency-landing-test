"use client";

import { createContext, useContext, type MutableRefObject } from "react";
import type { ScrollActivity } from "./types";

export const ScrollActivityContext =
  createContext<MutableRefObject<ScrollActivity> | null>(null);

export function useScrollActivity() {
  const ctx = useContext(ScrollActivityContext);
  if (!ctx) {
    throw new Error("useScrollActivity requires ScrollActivityContext");
  }
  return ctx;
}
