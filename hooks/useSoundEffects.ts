// hooks/useSoundEffects.ts
import { useEffect, useRef, useCallback, type MutableRefObject } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useAppSelector } from '@/store/hooks';

const whooshSrc = require('@/assets/sounds/whoosh.mp3');
const cheerSrc = require('@/assets/sounds/cheer.mp3');
const drumrollSrc = require('@/assets/sounds/drumroll.mp3');

export function useSoundEffects() {
  const soundEnabled = useAppSelector((s) => s.settings.soundEnabled);
  const whooshRef = useRef<AudioPlayer | null>(null);
  const cheerRef = useRef<AudioPlayer | null>(null);
  const drumrollRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    try {
      whooshRef.current = createAudioPlayer(whooshSrc);
      cheerRef.current = createAudioPlayer(cheerSrc);
      drumrollRef.current = createAudioPlayer(drumrollSrc);
    } catch {
      /* ignore — placeholder files may fail to decode, graceful no-op */
    }
    return () => {
      try {
        whooshRef.current?.remove();
      } catch {
        /* ignore */
      }
      try {
        cheerRef.current?.remove();
      } catch {
        /* ignore */
      }
      try {
        drumrollRef.current?.remove();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const play = useCallback(
    (ref: MutableRefObject<AudioPlayer | null>) => {
      if (!soundEnabled || !ref.current) return;
      try {
        ref.current.seekTo(0);
        ref.current.play();
      } catch {
        /* ignore playback errors */
      }
    },
    [soundEnabled],
  );

  const playWhoosh = useCallback(() => play(whooshRef), [play]);
  const playCheer = useCallback(() => play(cheerRef), [play]);
  const playDrumroll = useCallback(() => play(drumrollRef), [play]);
  const stopDrumroll = useCallback(() => {
    try {
      drumrollRef.current?.pause();
    } catch {
      /* ignore */
    }
  }, []);

  return {
    playWhoosh,
    playCheer,
    playDrumroll,
    stopDrumroll,
  };
}
