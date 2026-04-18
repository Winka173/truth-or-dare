// hooks/useSetupWizard.ts
import { useSyncExternalStore } from 'react';
import type { AgeGroup, Mood } from '@/types/question';

export interface WizardState {
  playerNames: string[];
  ageGroup: AgeGroup | null;
  mood: Mood | null;
  categoryIds: string[];
}

let state: WizardState = { playerNames: [], ageGroup: null, mood: null, categoryIds: [] };
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return state;
}

function notify() {
  listeners.forEach((l) => l());
}

export const wizardActions = {
  addPlayer(name: string) {
    state = { ...state, playerNames: [...state.playerNames, name] };
    notify();
  },
  removePlayer(index: number) {
    state = { ...state, playerNames: state.playerNames.filter((_, i) => i !== index) };
    notify();
  },
  setAgeGroup(ag: AgeGroup) {
    state = { ...state, ageGroup: ag };
    notify();
  },
  setMood(m: Mood) {
    state = { ...state, mood: m };
    notify();
  },
  toggleCategory(id: string) {
    const has = state.categoryIds.includes(id);
    state = { ...state, categoryIds: has ? state.categoryIds.filter((c) => c !== id) : [...state.categoryIds, id] };
    notify();
  },
  reset() {
    state = { playerNames: [], ageGroup: null, mood: null, categoryIds: [] };
    notify();
  },
};

export function useSetupWizard(): WizardState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
