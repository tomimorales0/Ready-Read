import { Music, Play, Pause, SkipForward, SkipBack, Shuffle, Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function FlowRadio() {
  const { 
    isPlaying, 
    togglePlay, 
    volume, 
    setVolume, 
    next, 
    prev, 
    currentTrack,
    isShuffled,
    toggleShuffle 
  } = useAudioPlayer();

  const trackName = currentTrack.split('/').pop()?.replace('.mp3', '') || 'Unknown Track';

  return (
    <motion.div
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 group flex flex-col items-end"
    >
      {/* Trigger icon (always visible) */}
      <button
        type="button"
        className="h-11 w-11 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/40 grid place-items-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        aria-label="Open music player"
        title="Music"
      >
        <Music size={18} />
      </button>

      {/* Dropdown panel (hover to show) */}
      <div
        className={cn(
          "mt-2 w-[320px] max-w-[calc(100vw-2rem)]",
          "bg-card/85 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl shadow-black/50",
          "origin-top-right transition-all duration-300",
          "opacity-0 scale-95 invisible pointer-events-none",
          "group-hover:opacity-100 group-hover:scale-100 group-hover:visible group-hover:pointer-events-auto"
        )}
      >
        <div className="flex flex-col gap-4">
          
          {/* Track Info */}
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-mono">
                Ready Radio
              </span>
              <div className="h-6 overflow-hidden relative w-full">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={trackName}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="text-sm font-medium text-primary truncate absolute w-full"
                  >
                    {trackName}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Volume Control - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-2 w-24 group">
              <button 
                onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <Slider 
                value={[volume * 100]} 
                max={100} 
                step={1}
                onValueChange={(val) => setVolume(val[0] / 100)}
                className="opacity-50 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={toggleShuffle}
              className={cn(
                "p-2 rounded-full transition-colors",
                isShuffled ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shuffle size={18} />
            </button>

            <button 
              onClick={prev}
              className="p-2 text-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95 transform duration-200"
            >
              <SkipBack size={24} fill="currentColor" className="opacity-20" />
            </button>

            <button 
              onClick={togglePlay}
              className="p-4 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            <button 
              onClick={next}
              className="p-2 text-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95 transform duration-200"
            >
              <SkipForward size={24} fill="currentColor" className="opacity-20" />
            </button>

            {/* Mobile Volume Toggle (placeholder for cleaner UI) */}
            <div className="w-[18px] sm:hidden" /> 
          </div>
        </div>
      </div>
    </motion.div>
  );
}
