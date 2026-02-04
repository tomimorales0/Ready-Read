import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { STORAGE_KEY, type ReadingSession } from "@/hooks/use-reading-session";

type TutorialStep = 0 | 1 | 2 | 3;

type TutorialContextValue = {
  isTutorialActive: boolean;
  currentStep: TutorialStep;
  hasSeenTutorial: boolean;
  isDemo: boolean;
  startTutorial: () => void;
  nextStep: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;
};

const HAS_SEEN_KEY = "rsvp_has_seen_tutorial_v1";

const TutorialContext = createContext<TutorialContextValue | null>(null);

function readHasSeenTutorial(): boolean {
  try {
    return localStorage.getItem(HAS_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

function writeHasSeenTutorial(value: boolean) {
  try {
    localStorage.setItem(HAS_SEEN_KEY, value ? "true" : "false");
  } catch {
    // ignore
  }
}

function readSessionFromStorage(): ReadingSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReadingSession;
  } catch {
    return null;
  }
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(() => readHasSeenTutorial());
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<TutorialStep>(0);
  const [isDemo, setIsDemo] = useState(false);

  const startTutorial = useCallback(() => {
    if (!isDemo) return;
    if (hasSeenTutorial) return;
    setIsTutorialActive(true);
    setCurrentStep(1);
  }, [hasSeenTutorial, isDemo]);

  const completeTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setCurrentStep(0);
    setHasSeenTutorial(true);
    writeHasSeenTutorial(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= 3) return prev;
      return (prev + 1) as TutorialStep;
    });
  }, []);

  const resetTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setCurrentStep(0);
    setHasSeenTutorial(false);
    writeHasSeenTutorial(false);
  }, []);

  // Reset on exit + detect demo + auto-start:
  // - When leaving /reader: reset state so next entry starts clean (step 1).
  // - When entering /reader with isDemo: ALWAYS start tutorial (ignore localStorage).
  // - When entering /reader without isDemo: start only if !hasSeenTutorial.
  useEffect(() => {
    if (location !== "/reader") {
      setIsTutorialActive(false);
      setCurrentStep(0);
      setIsDemo(false);
      return;
    }
    const session = readSessionFromStorage();
    const demo = !!session?.isDemo;
    setIsDemo(demo);
    if (demo) {
      // Demo mode: always start from step 1, ignore localStorage (user can repeat tutorial every time).
      setIsTutorialActive(true);
      setCurrentStep(1);
    } else if (!hasSeenTutorial) {
      // Normal mode: start only if they haven't seen it (persisted in localStorage).
      setIsTutorialActive(true);
      setCurrentStep(1);
    }
  }, [location, hasSeenTutorial]);

  const value = useMemo<TutorialContextValue>(
    () => ({
      isTutorialActive,
      currentStep,
      hasSeenTutorial,
      isDemo,
      startTutorial,
      nextStep,
      completeTutorial,
      resetTutorial,
    }),
    [isTutorialActive, currentStep, hasSeenTutorial, isDemo, startTutorial, nextStep, completeTutorial, resetTutorial]
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return ctx;
}

