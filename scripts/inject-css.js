import fs from 'fs';

// 빌드된 CSS 파일 찾기
const possibleCssPaths = ['dist/index.css', 'dist/white-editor.css'];
let allCss = '';
let foundCssPath = null;

for (const cssPath of possibleCssPaths) {
  if (fs.existsSync(cssPath)) {
    allCss = fs.readFileSync(cssPath, 'utf8');
    foundCssPath = cssPath;
    console.log(`Loaded CSS from ${cssPath} (${allCss.length} characters)`);
    break;
  }
}

if (!foundCssPath) {
  console.error('No CSS file found in dist folder');
  process.exit(1);
}

// CSS를 JavaScript 코드로 변환 (더 안전한 이스케이핑)
const cssJs = `// Auto-injected CSS
(function() {
  if (typeof document !== 'undefined') {
    const css = ${JSON.stringify(allCss)};
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = css;
    document.head.appendChild(style);
  }
})();
`;

// dist/index.js 파일 수정
const distJsPath = 'dist/index.js';
if (fs.existsSync(distJsPath)) {
  let content = fs.readFileSync(distJsPath, 'utf8');

  // CSS import 제거 (더 정확한 정규식 사용)
  content = content.replace(/import\s+['"][^'"]*\.css['"];?\s*/g, '');

  // CSS 주입 코드를 파일 시작 부분에 추가
  content = cssJs + content;

  fs.writeFileSync(distJsPath, content);
  console.log('CSS injected successfully into dist/index.js!');
} else {
  console.error('dist/index.js not found!');
}
