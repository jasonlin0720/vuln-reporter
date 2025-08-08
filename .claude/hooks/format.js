import fs from 'fs';
import { execSync } from 'child_process';

const stdinBuffer = fs.readFileSync(0); // 讀取 stdin
const json = JSON.parse(stdinBuffer.toString());
const filePath = json.tool_input?.file_path;

if (filePath) {
  execSync(`npx --no-install prettier --write "${filePath}"`, { stdio: 'inherit' });
  console.log(`✨ 已自動格式化檔案: ${filePath}`);
}
