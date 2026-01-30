import { useState, useEffect, useRef, useCallback } from 'react';
import { useReadingSession } from '@/hooks/use-reading-session';
import { OrpReader } from '@/components/OrpReader';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Link, useLocation } from 'wouter';
import { Play, Pause, Rewind, ChevronLeft, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Reader() {
  const { session, updateProgress } = useReadingSession();
  const [_, setLocation] = useLocation();
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(350);
  
  // Refs for interval and latest state to avoid closure staleness
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!session) {
      setLocation('/');
      return;
    }

    // Split content into words - simple split by whitespace
    const splitWords = session.content.split(/\s+/).filter(w => w.length > 0);
    setWords(splitWords);
    setIndex(session.wordIndex);
    setWpm(session.wpm);
  }, [session, setLocation]);

  // Main Reading Loop
  useEffect(() => {
    if (isPlaying && index < words.length) {
      const msPerWord = 60000 / wpm;
      
      timerRef.current = setInterval(() => {
        setIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, msPerWord);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, wpm, words.length]);

  // Save progress when pausing or unmounting
  useEffect(() => {
    if (!isPlaying && session) {
      updateProgress(index, wpm);
    }
  }, [isPlaying, index, wpm]); // Dependency on isPlaying ensures save on pause

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

  const handleWpmChange = (vals: number[]) => {
    setWpm(vals[0]);
  };

  const progress = words.length > 0 ? (index / words.length) * 100 : 0;

  if (!session || words.length === 0) return null;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-background">
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
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-muted-foreground hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Reader Settings</DialogTitle>
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
      <div className="w-full pb-32 px-6 flex flex-col items-center gap-6 z-40">
        
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
          
          <div className="w-12" /> {/* Spacer for symmetry */}
        </div>
      </div>
    </div>
  );
}
