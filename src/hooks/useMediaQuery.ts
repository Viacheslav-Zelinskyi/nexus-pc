"use client";

import { useSyncExternalStore } from "react";

export const breakpoints = {
  tablet: "(max-width: 1100px)",
  mobile: "(max-width: 900px)",
  smallMobile: "(max-width: 600px)",
} as const;

export type Breakpoint = keyof typeof breakpoints;

export function useMediaQuery(query: Breakpoint | string): boolean {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") {
      return () => {};
    }
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
