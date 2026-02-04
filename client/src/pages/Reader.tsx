import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useReadingSession } from '@/hooks/use-reading-session';
import { useTutorial } from '@/contexts/tutorial-context';
import { OrpReader } from '@/components/OrpReader';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { TutorialTooltip } from '@/components/TutorialTooltip';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Link, useLocation } from 'wouter';
import { Play, Pause, Rewind, FastForward, ChevronLeft, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Reader() {
  const { session, isLoaded, updateProgress } = useReadingSession();
  const { isTutorialActive, currentStep, nextStep, completeTutorial } = useTutorial();
  const [_, setLocation] = useLocation();
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(350);
  
  // Refs for timeout and latest state to avoid closure staleness
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedFilenameRef = useRef<string | null>(null);
  const wordsRef = useRef<string[]>([]);
  const wpmRef = useRef(wpm);
  const isPlayingRef = useRef(isPlaying);

  wordsRef.current = words;
  wpmRef.current = wpm;
  isPlayingRef.current = isPlaying;
  
  // Initialize reader state ONCE per file.
  // Use layout effect so it runs before passive effects (e.g. "save progress"),
  // preventing an initial "index=0" writeback that can overwrite persisted progress.
  useLayoutEffect(() => {
    console.log("[Reader] init/layout", { isLoaded, hasSession: !!session });

    // Important: don't redirect before localStorage hydration completes,
    // otherwise /reader "bounces" back to / and buttons look broken.
    if (!isLoaded) return;

    if (!session) {
      console.log("[Reader] no session after load -> redirecting to /");
      setLocation('/');
      return;
    }

    // Only initialize when we first load, or when the filename changes.
    if (initializedFilenameRef.current === session.filename) return;

    // Split content into words - simple split by whitespace
    const splitWords = session.content.split(/\s+/).filter((w) => w.length > 0);

    // Ensure words are set before (and consistent with) index.
    const maxIndex = Math.max(0, splitWords.length - 1);
    const nextIndex = Math.min(Math.max(session.wordIndex ?? 0, 0), maxIndex);

    setWords(splitWords);
    setIndex(nextIndex);
    setWpm(session.wpm);

    initializedFilenameRef.current = session.filename;
  }, [isLoaded, session?.filename, setLocation]);

  // Main Reading Loop (Smart Pacing: recursive setTimeout with punctuation pauses)
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    function getDelayMultiplier(word: string | undefined): number {
      if (!word || word.length === 0) return 1;
      const lastChar = word.slice(-1);
      if (/[.?!:]/.test(lastChar)) return 2.3;  // strong punctuation
      if (/[,;]/.test(lastChar)) return 1.8;    // medium punctuation
      return 1;
    }

    function scheduleNextTick(currentIndex: number) {
      if (!isPlayingRef.current || currentIndex >= wordsRef.current.length) return;
      const baseDelay = 60000 / wpmRef.current;
      const word = wordsRef.current[currentIndex];
      const multiplier = getDelayMultiplier(word);
      const delay = baseDelay * multiplier;

      timerRef.current = setTimeout(() => {
        if (!isPlayingRef.current) return;
        setIndex((prev) => {
          if (prev >= wordsRef.current.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          scheduleNextTick(next);
          return next;
        });
      }, delay);
    }

    scheduleNextTick(index);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, wpm, words.length]);

  // Save progress when pausing or unmounting
  useEffect(() => {
    // FIX: Don't save if words aren't loaded yet.
    // This prevents overwriting the session with '0' on initial mount.
    if (words.length === 0) return;

    if (!isPlaying && session) {
      console.log("[Reader] saving progress", { wordIndex: index, wpm });
      updateProgress(index, wpm);
    }
  }, [isPlaying, index, wpm, words.length, session, updateProgress]); // Dependency on isPlaying ensures save on pause

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        handleRewind();
      } else if (e.code === 'ArrowRight') {
        setIndex(prev => Math.min(prev + 10, words.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [words.length]);

  const handleRewind = () => {
    setIndex(prev => Math.max(0, prev - 10));
  };

  const handleForward = () => {
    setIndex(prev => Math.min(prev + 10, words.length - 1));
  };

  const handleWpmChange = (vals: number[]) => {
    setWpm(vals[0]);
  };

  const progress = words.length > 0 ? (index / words.length) * 100 : 0;

  if (!isLoaded) return null;
  if (!session || words.length === 0) return null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-background">
      {isTutorialActive && <TutorialOverlay isActive={true} />}

      {/* Brand mark (left-center, vertical stack) */}
      <div className="hidden md:flex fixed left-12 top-1/2 -translate-y-1/2 z-40 pointer-events-none select-none">
        <div className="flex flex-col leading-none tracking-tighter font-bold opacity-70">
          <span className="text-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500">
            READY
          </span>
          <span className="text-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-primary to-white [filter:drop-shadow(0_0_14px_rgba(0,255,255,0.55))]">
            READ
          </span>
        </div>
      </div>

      {/* Top Bar */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <Link href="/">
          <Button variant="ghost" size="icon" className="hover:bg-white/10 text-muted-foreground hover:text-white">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex flex-col items-center">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest max-w-[200px] truncate">
            {session.filename}
          </h2>
        </div>
        
        <TutorialTooltip
          isVisible={isTutorialActive && currentStep === 1}
          title="Find your pace"
          description={
            <span>
              Adjust the speed (WPM) here. Start slow to get comfortable (Ideally 120 WPM), then push your limits as your brain adapts. 
              <br />
              <br />
              <span className="italic"> Did you know? Most adults read at 175-230 WPM, i KNOW you can do better!</span>
            </span>
          }
          placement="bottom"
        >
          <div className={cn("relative", isTutorialActive && currentStep === 1 && "z-50")}>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-white/10 text-muted-foreground hover:text-white"
                  onClick={() => { if (currentStep === 1) nextStep(); }}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Speed</span>
                      <span className="text-sm font-bold text-primary">{wpm} WPM</span>
                    </div>
                    <Slider 
                      value={[wpm]} 
                      min={100} 
                      max={1000} 
                      step={10} 
                      onValueChange={handleWpmChange} 
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <p>Keyboard Shortcuts:</p>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      <li>Space: Play/Pause</li>
                      <li>Left Arrow: Rewind 10 words</li>
                      <li>Right Arrow: Skip 10 words</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TutorialTooltip>
      </header>

      {/* Main Reader Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 relative">
        <div className="absolute inset-x-0 h-[2px] bg-secondary top-1/2 -translate-y-1/2 -z-10 opacity-30" />
        <div className="absolute inset-y-0 w-[2px] bg-secondary left-1/2 -translate-x-1/2 -z-10 opacity-30" />
        
        <div className="w-full text-center py-20">
          <OrpReader word={words[index]} />
        </div>
        
        {/* Context line (optional future feature, showing faint previous/next words) */}
        {/* <div className="absolute bottom-1/3 opacity-20 text-sm font-mono max-w-lg text-center pointer-events-none">
          {words.slice(Math.max(0, index - 5), index).join(' ')} ... {words.slice(index + 1, index + 6).join(' ')}
        </div> */}
      </main>

      {/* Controls Bar */}
      <TutorialTooltip
        isVisible={isTutorialActive && currentStep === 2}
        title="Control center"
        description="Press Play to enter the stream. Use the progress bar to navigate or rewind instantly if you miss a detail."
        buttonText="Next"
        onButtonClick={nextStep}
        placement="top"
      >
        <div className={cn("w-full pb-32 px-6 flex flex-col items-center gap-6", isTutorialActive && currentStep === 2 ? "relative z-50" : "z-40")}>
        
        {/* Progress Bar */}
        <div className="w-full max-w-2xl space-y-2 group">
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{index + 1} / {words.length}</span>
            <span>{Math.round((words.length - index) / wpm)} min left</span>
          </div>
          <div 
            className="h-2 bg-secondary rounded-full overflow-hidden cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const pct = x / rect.width;
              setIndex(Math.floor(pct * words.length));
            }}
          >
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRewind}
            className="h-12 w-12 rounded-full hover:bg-white/5 hover:text-primary transition-colors"
          >
            <Rewind className="h-6 w-6" />
          </Button>

          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              "h-20 w-20 rounded-full transition-all duration-300 shadow-2xl shadow-primary/20",
              isPlaying 
                ? "bg-secondary text-foreground hover:bg-secondary/80 border border-white/10" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
            )}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="h-8 w-8 fill-current ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleForward}
            className="h-12 w-12 rounded-full hover:bg-white/5 hover:text-primary transition-colors"
          >
            <FastForward className="h-6 w-6" />
          </Button>
        </div>
        </div>
      </TutorialTooltip>

      {/* Step 3: Music tooltip (fixed right, points to FlowRadio in App) */}
      <TutorialTooltip
        isVisible={isTutorialActive && currentStep === 3}
        title="Enter the Flow"
        description="Toggle the background radio. Ideally designed to block distractions and keep you in the zone."
        buttonText="Got it!"
        onButtonClick={completeTutorial}
        fixedRight
      />
    </div>
  );
}
