import type { Question, QuestionDatabase } from '@/types/question';

export function flattenQuestions(db: QuestionDatabase): Question[] {
  return db.categories.flatMap((cat) =>
    cat.questions.map((q) => ({ ...q, category_id: cat.id })),
  );
}

export function safeFlattenQuestions(raw: unknown): Question[] {
  try {
    const db = raw as QuestionDatabase;
    if (!db || !Array.isArray(db.categories)) return [];
    return flattenQuestions(db);
  } catch {
    return [];
  }
}
