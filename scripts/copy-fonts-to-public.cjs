/**
 * @0ffen/white-editor 폰트를 사용처 프로젝트의 public/assets/fonts 로 복사.
 * 사용: node node_modules/@0ffen/white-editor/scripts/copy-fonts-to-public.cjs
 */
import fs from 'fs';
import path from 'path';

const sourceDir = path.join(__dirname, '..', 'dist', 'assets', 'fonts');
const targetDir = path.join(process.cwd(), 'public', 'assets', 'fonts');

if (!fs.existsSync(sourceDir)) {
  console.warn('@0ffen/white-editor: dist/assets/fonts not found. Run build first.');
  process.exit(0);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);
let count = 0;
for (const file of files) {
  const src = path.join(sourceDir, file);
  if (fs.statSync(src).isFile()) {
    fs.copyFileSync(src, path.join(targetDir, file));
    count++;
  }
}
console.log(`@0ffen/white-editor: copied ${count} font(s) to public/assets/fonts`);
