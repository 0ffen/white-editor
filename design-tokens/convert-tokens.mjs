import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PREFIX = 'we';

// JSON 파일 읽기
const baseTokens = JSON.parse(readFileSync(join(__dirname, 'base.tokens.json'), 'utf-8'));
const lightTokens = JSON.parse(readFileSync(join(__dirname, 'semantic-light.tokens.json'), 'utf-8'));
const darkTokens = JSON.parse(readFileSync(join(__dirname, 'semantic-dark.tokens.json'), 'utf-8'));

/**
 * 문자열을 kebab-case로 변환
 * "Primary" → "primary"
 * "400 - primary" → "400-primary"
 * "Light" → "light"
 */
function toKebabCase(str) {
  return str
    .replace(/\s+-\s+/g, '-') // " - " → "-"
    .replace(/\s+/g, '-') // 공백 → "-"
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase → kebab-case
    .toLowerCase();
}

/**
 * 색상 값을 CSS로 변환
 * alpha가 1이 아니면 rgba 형식 사용
 */
function colorToCss(value) {
  if (typeof value === 'object' && value.hex) {
    if (value.alpha !== undefined && value.alpha < 1) {
      // hex를 rgb로 변환 후 rgba 형식으로
      const hex = value.hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${value.alpha.toFixed(2)})`;
    }
    return value.hex;
  }
  return value;
}

/**
 * Figma alias 참조를 CSS 변수 참조로 변환
 * "Gray/Light/800" → "var(--we-gray-light-800)"
 * "Black" → "var(--we-black)"
 */
function aliasToVarRef(targetVariableName) {
  const parts = targetVariableName
    .split('/')
    .map(part => toKebabCase(part));
  return `var(--${PREFIX}-${parts.join('-')})`;
}

/**
 * 토큰 객체를 재귀적으로 순회하며 CSS 변수 추출
 * @param {object} obj - 토큰 객체
 * @param {string[]} path - 현재 경로
 * @param {boolean} useAliasRef - alias가 있으면 var() 참조 사용 (semantic 토큰용)
 */
function extractTokens(obj, path = [], useAliasRef = false) {
  const tokens = [];

  for (const [key, value] of Object.entries(obj)) {
    // $로 시작하는 키는 메타데이터이므로 스킵
    if (key.startsWith('$')) continue;

    const currentPath = [...path, toKebabCase(key)];

    // $type과 $value가 있으면 토큰
    if (value && typeof value === 'object' && '$type' in value && '$value' in value) {
      const varName = `--${PREFIX}-${currentPath.join('-')}`;
      let cssValue;

      // semantic 토큰이고 alias가 있으면 var() 참조 사용
      const aliasData = value.$extensions?.['com.figma.aliasData'];
      if (useAliasRef && aliasData?.targetVariableName) {
        cssValue = aliasToVarRef(aliasData.targetVariableName);
      } else if (value.$type === 'color') {
        cssValue = colorToCss(value.$value);
      } else {
        cssValue = value.$value;
      }

      tokens.push({ name: varName, value: cssValue, type: value.$type });
    } else if (value && typeof value === 'object') {
      // 중첩 객체면 재귀 호출
      tokens.push(...extractTokens(value, currentPath, useAliasRef));
    }
  }

  return tokens;
}

/**
 * 토큰 배열을 CSS 문자열로 변환
 */
function tokensToCss(tokens, indent = '  ') {
  return tokens
    .map(token => `${indent}${token.name}: ${token.value};`)
    .join('\n');
}

// 토큰 추출
// Base: 직접 값 사용
// Semantic: alias가 있으면 var() 참조 사용
const baseVars = extractTokens(baseTokens, [], false);
const lightVars = extractTokens(lightTokens, [], true);
const darkVars = extractTokens(darkTokens, [], true);

// CSS 파일 생성
const css = `/**
 * Design Tokens - Auto Generated
 * Generated at: ${new Date().toISOString()}
 * 
 * Usage: Import this file in your CSS
 * @import './variables.css';
 */

/* ========================================
   Base Tokens
   ======================================== */
:root {
${tokensToCss(baseVars)}
}

/* ========================================
   Semantic Tokens - Light Theme (Default)
   ======================================== */
:root {
${tokensToCss(lightVars)}
}

/* ========================================
   Semantic Tokens - Dark Theme
   ======================================== */
.dark {
${tokensToCss(darkVars)}
}
`;

// 파일 저장
writeFileSync(join(__dirname, 'variables.css'), css);

console.log('✅ variables.css generated successfully!');
console.log(`   - Base tokens: ${baseVars.length}`);
console.log(`   - Light tokens: ${lightVars.length}`);
console.log(`   - Dark tokens: ${darkVars.length}`);
console.log(`   - Total: ${baseVars.length + lightVars.length + darkVars.length} variables`);
