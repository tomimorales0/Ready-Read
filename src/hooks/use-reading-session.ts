import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export interface ReadingSession {
  content: string;
  filename: string;
  wordIndex: number;
  wpm: number;
  timestamp: number;
  isDemo?: boolean;
}

export const STORAGE_KEY = 'rsvp_reading_session';

export function useReadingSession() {
  // Load synchronously so routes like /reader don't "bounce" before hydration.
  const [session, setSession] = useState<ReadingSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as ReadingSession;
    } catch (e) {
      console.error("[useReadingSession] Failed to parse session from localStorage", e);
      return null;
    }
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Mark hydration complete; session may be null if nothing stored.
    setIsLoaded(true);
  }, []);

  const saveSession = (newSession: ReadingSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
    } catch (e) {
      console.error("[useReadingSession] Failed to save session", e);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
    } catch (e) {
      console.error("[useReadingSession] Failed to clear session", e);
    }
  };

  const startNewSession = (content: string, filename: string, options?: { isDemo?: boolean }) => {
    const newSession: ReadingSession = {
      content,
      filename,
      wordIndex: 0,
      wpm: 350, // Default WPM
      timestamp: Date.now(),
      isDemo: !!options?.isDemo,
    };
    console.log("[useReadingSession] startNewSession", { filename, contentLength: content.length });
    saveSession(newSession);
    setLocation('/reader');
  };

  const updateProgress = (wordIndex: number, wpm: number) => {
    if (!session) return;
    saveSession({
      ...session,
      wordIndex,
      wpm,
      timestamp: Date.now(),
    });
  };

  return {
    session,
    isLoaded,
    startNewSession,
    updateProgress,
    clearSession,
    hasSession: !!session
  };
}
