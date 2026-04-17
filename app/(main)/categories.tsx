import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { CategoryCard } from '@/components/game/CategoryCard';
import { PackUnlockSheet } from '@/components/packs/PackUnlockSheet';
import { CATEGORIES, type CategoryConfig } from '@/constants/categories';
import { useAppSelector } from '@/store/hooks';
import { usePacks } from '@/hooks/usePacks';
import { colors, fonts, fontSize, radius, spacing } from '@/constants/theme';
import type { PackId } from '@/types/question';

type Filter = 'all' | 'free' | 'premium';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'free', label: 'Free' },
  { id: 'premium', label: 'Premium' },
];

export default function CategoriesScreen() {
  const allQuestions = useAppSelector((s) => s.game.allQuestions);
  const { iapStatus, isUnlocked, devUnlock } = usePacks();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedPack, setSelectedPack] = useState<Exclude<PackId, 'base'> | null>(null);

  const questionCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of allQuestions) {
      map[q.category_id] = (map[q.category_id] ?? 0) + 1;
    }
    return map;
  }, [allQuestions]);

  const visibleCategories = CATEGORIES.filter((c) => {
    if (filter === 'free') return c.packId === null;
    if (filter === 'premium') return c.packId !== null;
    return true;
  });

  const handleTap = (cat: CategoryConfig) => {
    if (cat.packId && !isUnlocked(cat.packId)) {
      setSelectedPack(cat.packId);
      return;
    }
    router.push({ pathname: '/setup', params: { categoryId: cat.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Categories"
        left={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.iconButton}
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </Pressable>
        }
      />
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const selected = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.filter, selected && styles.filterSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Filter: ${f.label}`}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {visibleCategories.map((c) => (
          <View key={c.id} style={styles.cell}>
            <CategoryCard
              category={c}
              questionCount={questionCounts[c.id] ?? 0}
              locked={c.packId !== null && !isUnlocked(c.packId)}
              onPress={() => handleTap(c)}
            />
          </View>
        ))}
      </ScrollView>
      <PackUnlockSheet
        visible={selectedPack !== null}
        packId={selectedPack}
        iapStatus={iapStatus}
        onUnlock={() => {
          if (selectedPack) {
            devUnlock(selectedPack);
            setSelectedPack(null);
          }
        }}
        onClose={() => setSelectedPack(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.screen },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.bg.containerHighest,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterSelected: {
    backgroundColor: colors.primary.container,
  },
  filterText: {
    fontFamily: fonts.bodySemi,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  filterTextSelected: {
    color: colors.primary.onPrimary,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cell: {
    width: '47%',
    minWidth: 150,
    flexGrow: 1,
  },
});
