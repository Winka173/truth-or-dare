import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { catalogs, type TranslationKey } from '@/locales';
import { en } from '@/locales/en';
import type { LanguageCode } from '@/types/question';

type TFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

/**
 * Translation hook. Re-resolves when settings.language changes in Redux,
 * so consumers re-render automatically on language switch.
 *
 * Resolution order:
 *   catalogs[currentLocale][key] → catalogs.en[key] → key itself
 *
 * `{placeholder}` patterns in the template are replaced from `params`.
 */
export function useT(): TFn {
  const locale = useAppSelector((s) => s.settings.language) as LanguageCode;

  return useCallback(
    (key, params) => {
      const template = catalogs[locale]?.[key] ?? en[key] ?? String(key);
      if (!params) return template;
      return Object.keys(params).reduce((acc, p) => {
        const v = params[p];
        return acc.replace(new RegExp(`\\{${p}\\}`, 'g'), v === undefined ? '' : String(v));
      }, template);
    },
    [locale],
  );
}
