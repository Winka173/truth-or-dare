import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';

type ToastVariant = 'info' | 'success' | 'error';

interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now();
    setToast({ id, message, variant });
    setTimeout(() => {
      setToast((prev) => (prev && prev.id === id ? null : prev));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View
          pointerEvents="none"
          style={[
            styles.toast,
            toast.variant === 'success' && styles.success,
            toast.variant === 'error' && styles.error,
          ]}
        >
          <Text style={styles.message}>{toast.message}</Text>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: spacing['2xl'],
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(13,3,32,0.95)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.frostedBorder,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  success: {
    backgroundColor: 'rgba(52,211,153,0.95)',
  },
  error: {
    backgroundColor: 'rgba(248,113,113,0.95)',
  },
  message: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textOnGradient,
    textAlign: 'center',
  },
});
