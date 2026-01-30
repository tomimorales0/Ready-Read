import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export interface ReadingSession {
  content: string;
  filename: string;
  wordIndex: number;
  wpm: number;
  timestamp: number;
}

const STORAGE_KEY = 'rsvp_reading_session';

export function useReadingSession() {
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Load session on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load session", e);
    }
  }, []);

  const saveSession = (newSession: ReadingSession) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  const clearSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
    } catch (e) {
      console.error("Failed to clear session", e);
    }
  };

  const startNewSession = (content: string, filename: string) => {
    const newSession: ReadingSession = {
      content,
      filename,
      wordIndex: 0,
      wpm: 350, // Default WPM
      timestamp: Date.now(),
    };
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
    startNewSession,
    updateProgress,
    clearSession,
    hasSession: !!session
  };
}
