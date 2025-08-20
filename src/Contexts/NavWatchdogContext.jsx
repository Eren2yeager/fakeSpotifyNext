"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Loader from "@/Components/Helper/ThreeDotsLoader";
import { useSpotifyToast } from "./SpotifyToastContext";

const NavWatchdogContext = createContext(null);

export const useNavWatchdog = () => useContext(NavWatchdogContext);

export function NavWatchdogProvider({ children, overlay = true, stallTimeoutMs = 800, debounceMs = 100 }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useSpotifyToast && useSpotifyToast();

  const [navBusy, setNavBusy] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const lastIntendedUrlRef = useRef(null);
  const stallTimerRef = useRef(null);
  const debouncersRef = useRef(new Map());

  const currentUrl = useMemo(() => {
    const sp = searchParams?.toString?.() || "";
    return pathname + (sp ? `?${sp}` : "");
  }, [pathname, searchParams]);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const beginNavigation = useCallback(
    (targetUrl, mode = "replace", options = {}) => {
      const { showOverlay = true, timeoutMs = stallTimeoutMs, onStall } = options;

      lastIntendedUrlRef.current = targetUrl;
      setNavBusy(true);
      if (overlay && showOverlay) setOverlayVisible(true);
      clearStallTimer();

      stallTimerRef.current = setTimeout(() => {
        const current = window.location.pathname + window.location.search;
        if (current !== lastIntendedUrlRef.current) {
          try {
            // Force-sync URL to un-wedge the router
            if (mode === "push") {
              window.history.pushState({}, "", lastIntendedUrlRef.current);
            } else {
              window.history.replaceState({}, "", lastIntendedUrlRef.current);
            }
          } catch {}
          if (typeof onStall === "function") {
            onStall();
          } else if (toast) {
            toast({ text: "Request timeout" });
          }
        }
        setNavBusy(false);
        setOverlayVisible(false);
      }, timeoutMs);

      try {
        if (mode === "push") {
          router.push(targetUrl, { scroll: false });
        } else {
          router.replace(targetUrl, { scroll: false });
        }
      } catch (e) {
        // Fallback to history API
        try {
          if (mode === "push") {
            window.history.pushState({}, "", targetUrl);
          } else {
            window.history.replaceState({}, "", targetUrl);
          }
        } catch {}
      }
    },
    [router, overlay, stallTimeoutMs, clearStallTimer]
  );

  // Convenience API for direct navigation with defaults
  const navigate = useCallback((targetUrl, mode = "push", options = {}) => {
    return beginNavigation(targetUrl, mode, options);
  }, [beginNavigation]);

  // When the URL becomes what we intended, clear busy/overlay
  useEffect(() => {
    if (!lastIntendedUrlRef.current) return;
    if (currentUrl === lastIntendedUrlRef.current) {
      clearStallTimer();
      setNavBusy(false);
      setOverlayVisible(false);
    }
  }, [currentUrl, clearStallTimer]);

  useEffect(() => () => clearStallTimer(), [clearStallTimer]);

  const buildUrlWithParam = useCallback((paramName, value) => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    if (value === undefined || value === null) {
      params.delete(paramName);
    } else {
      params.set(paramName, value ? "true" : "false");
    }
    const sp = params.toString();
    return (typeof window !== "undefined" ? window.location.pathname : pathname) + (sp ? `?${sp}` : "");
  }, [pathname]);

  const updateQueryParamDebounced = useCallback((paramName, value, mode = "replace", options = {}) => {
    const { debounce = debounceMs, showOverlay = true, timeoutMs = stallTimeoutMs, onStall } = options;
    const key = paramName;
    const timers = debouncersRef.current;
    if (timers.has(key)) {
      clearTimeout(timers.get(key));
    }
    timers.set(
      key,
      setTimeout(() => {
        const targetUrl = buildUrlWithParam(paramName, value);
        beginNavigation(targetUrl, mode, { showOverlay, timeoutMs, onStall });
      }, debounce)
    );
  }, [beginNavigation, buildUrlWithParam, debounceMs, stallTimeoutMs]);

  const value = useMemo(() => ({
    navBusy,
    overlayVisible,
    beginNavigation,
    navigate,
    updateQueryParamDebounced,
  }), [navBusy, overlayVisible, beginNavigation, updateQueryParamDebounced]);

  return (
    <NavWatchdogContext.Provider value={value}>
      {children}
      {overlay && overlayVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 pointer-events-auto">
          <Loader />
        </div>
      )}
    </NavWatchdogContext.Provider>
  );
}


