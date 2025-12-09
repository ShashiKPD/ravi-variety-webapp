import { useCallback, useEffect, useRef } from "react";

export function useBeep() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio object once on mount
    audioRef.current = new Audio("/sounds/beep.mp3");
    // Preload it
    audioRef.current.load();
  }, []);

  const play = useCallback(() => {
    if (audioRef.current) {
      // Reset time to 0 to allow rapid replays
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Audio play failed (browser permission policy):", err);
      });
    }
  }, []);

  return play;
}