'use client';

import { useState, useCallback, useEffect } from 'react';
import { getTTS } from '@/lib/tts';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const tts = getTTS();
    setIsSupported(tts.isSupported);
  }, []);

  const speak = useCallback((text: string) => {
    const tts = getTTS();
    setIsSpeaking(true);
    setIsPaused(false);
    tts.speak(text, {
      onEnd: () => { setIsSpeaking(false); setIsPaused(false); },
      onError: () => { setIsSpeaking(false); setIsPaused(false); },
    });
  }, []);

  const pause = useCallback(() => {
    getTTS().pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    getTTS().resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    getTTS().stop();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const toggle = useCallback((text: string) => {
    const tts = getTTS();
    if (tts.isSpeaking && !tts.isPaused) {
      pause();
    } else if (tts.isPaused) {
      resume();
    } else {
      speak(text);
    }
  }, [speak, pause, resume]);

  return { speak, pause, resume, stop, toggle, isSpeaking, isPaused, isSupported };
}
