import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { EDITOR_I18N } from '@/shared/constants/editor-i18n';

const EDITOR_NS = 'editor';

/** EDITOR_I18N → i18next resources (id 기준 unique) */
function buildEditorResources(): { ko: Record<string, string>; en: Record<string, string> } {
  const ko: Record<string, string> = {};
  const en: Record<string, string> = {};
  for (const entry of Object.values(EDITOR_I18N)) {
    ko[entry.id] = entry.ko;
    en[entry.id] = entry.en;
  }
  return { ko, en };
}

const { ko: koEditor, en: enEditor } = buildEditorResources();

i18n.use(initReactI18next).init({
  lng: 'ko',
  fallbackLng: 'ko',
  ns: [EDITOR_NS],
  defaultNS: EDITOR_NS,
  resources: {
    ko: { [EDITOR_NS]: koEditor },
    en: { [EDITOR_NS]: enEditor },
  },
  interpolation: { escapeValue: false },
});

/** 한글 키 또는 툴바 키로 번역 문구 반환 (현재 locale 기준) */
export function getTranslate(key: string): string {
  const entry = EDITOR_I18N[key];
  if (entry) return i18n.t(`${EDITOR_NS}:${entry.id}`);
  return key;
}

export { i18n };
