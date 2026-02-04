import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OrpReaderProps {
  word: string;
  className?: string;
}

export function OrpReader({ word, className }: OrpReaderProps) {
  // Optimal Recognition Point logic
  // Typically slightly left of center for longer words
  const { prefix, center, suffix } = useMemo(() => {
    if (!word) return { prefix: '', center: '', suffix: '' };
    
    // Simple heuristic: middle character
    const len = word.length;
    let centerIdx = Math.floor(len / 2);
    
    // Adjust for even length words to lean slightly left (preferred by many readers)
    if (len > 1 && len % 2 === 0) {
      centerIdx = (len / 2) - 1;
    }

    // Heuristic tweak: for very long words (8+), shift ORP slightly left
    // But keeping it simple for now as per requirements "middle character"
    
    return {
      prefix: word.slice(0, centerIdx),
      center: word[centerIdx],
      suffix: word.slice(centerIdx + 1)
    };
  }, [word]);

  return (
    <div className={cn("font-mono text-5xl md:text-7xl flex items-baseline justify-center select-none", className)}>
      <span className="text-right w-1/2 text-muted-foreground transition-colors duration-100">
        {prefix}
      </span>
      <span className="text-primary font-bold animate-pulse-slow relative z-10 scale-110">
        {center}
        {/* Subtle glow for the focus point */}
        <span className="absolute inset-0 blur-lg bg-primary/20 -z-10 rounded-full"></span>
      </span>
      <span className="text-left w-1/2 text-muted-foreground transition-colors duration-100">
        {suffix}
      </span>
    </div>
  );
}
