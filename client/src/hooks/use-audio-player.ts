import { useState, useRef, useEffect } from 'react';

const PLAYLIST = [
  '/music/track1.mp3',
  '/music/track2.mp3',
  '/music/track3.mp3',
  '/music/track4.mp3',
  '/music/track5.mp3',
];

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(PLAYLIST[0]);
      audioRef.current.loop = false;
      audioRef.current.volume = volume;
      
      // Handle track ending for auto-next
      audioRef.current.addEventListener('ended', handleNext);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleNext);
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Promise handling for play() to avoid race conditions
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Auto-play was prevented:", error);
        });
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * PLAYLIST.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    }
    
    changeTrack(nextIndex);
  };

  const handlePrev = () => {
    let prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    changeTrack(prevIndex);
  };

  const changeTrack = (index: number) => {
    if (!audioRef.current) return;
    
    setCurrentTrackIndex(index);
    audioRef.current.src = PLAYLIST[index];
    if (isPlaying) {
      audioRef.current.play();
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  return {
    isPlaying,
    togglePlay,
    volume,
    setVolume,
    next: handleNext,
    prev: handlePrev,
    currentTrack: PLAYLIST[currentTrackIndex],
    isShuffled,
    toggleShuffle
  };
}
