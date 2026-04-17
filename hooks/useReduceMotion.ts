import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Reflects the system-wide "Reduce Motion" accessibility setting.
 * Updates live when the user toggles it in Settings → Accessibility.
 *
 * Components should skip or simplify entering / flip / confetti
 * animations when this returns `true`.
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        /* ignore — some platforms may not support this */
      });

    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        setReduceMotion(enabled);
      },
    );

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}
