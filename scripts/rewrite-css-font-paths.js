import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, '..', 'dist', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// dist 기준 ./fonts/ 로 통일 (다른 프로젝트에서 패키지 내 dist/fonts 로드)
css = css.replace(/url\("\.\/assets\//g, 'url("./fonts/');
css = css.replace(/url\('\.\/assets\//g, "url('./fonts/");
css = css.replace(/url\("\.\.\/assets\/fonts\//g, 'url("./fonts/');
css = css.replace(/url\('\.\.\/assets\/fonts\//g, "url('./fonts/");

fs.writeFileSync(cssPath, css);
console.log('Rewrote font paths in dist/index.css');
