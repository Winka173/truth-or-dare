import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, fontSize, spacing } from '@/constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          The app ran into an unexpected problem. Please restart, or reinstall if it keeps
          happening.
        </Text>
        {this.state.errorMessage ? (
          <Text style={styles.detail}>{this.state.errorMessage}</Text>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.screen,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: fontSize['2xl'],
    color: colors.text.primary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  detail: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
