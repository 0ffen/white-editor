'use client';

import { useCallback } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import { EDITOR_I18N } from '@/shared/constants/editor-i18n';

const EDITOR_NS = 'editor';

/** EDITOR_I18N → i18next resources (id 기준 unique) */
function buildEditorResources(): {
  ko: Record<string, string>;
  en: Record<string, string>;
  es: Record<string, string>;
} {
  const ko: Record<string, string> = {};
  const en: Record<string, string> = {};
  const es: Record<string, string> = {};
  for (const entry of Object.values(EDITOR_I18N)) {
    ko[entry.id] = entry.ko;
    en[entry.id] = entry.en;
    es[entry.id] = entry.es;
  }
  return { ko, en, es };
}

const { ko: koEditor, en: enEditor, es: esEditor } = buildEditorResources();

i18n.use(initReactI18next).init({
  lng: 'ko',
  fallbackLng: 'ko',
  ns: [EDITOR_NS],
  defaultNS: EDITOR_NS,
  resources: {
    ko: { [EDITOR_NS]: koEditor },
    en: { [EDITOR_NS]: enEditor },
    es: { [EDITOR_NS]: esEditor },
  },
  interpolation: { escapeValue: false },
});

/** 한글 키 또는 툴바 키로 번역 문구 반환 (현재 locale 기준) */
export function getTranslate(key: string): string {
  const entry = EDITOR_I18N[key];
  if (entry) return i18n.t(`${EDITOR_NS}:${entry.id}`);
  return key;
}

/**
 * locale 변경 시 자동으로 리렌더링되는 번역 훅.
 * react-i18next의 useTranslation을 기반으로 languageChanged 이벤트를 구독하여
 * 포커스 없이도 즉시 UI에 반영됩니다.
 *
 * @returns (key: string) => string — getTranslate와 동일한 시그니처의 번역 함수
 */
export function useTranslate(): (key: string) => string {
  const { t } = useTranslation(EDITOR_NS);

  return useCallback(
    (key: string): string => {
      const entry = EDITOR_I18N[key];
      if (entry) return t(entry.id);
      return key;
    },
    [t]
  );
}

export { i18n };
