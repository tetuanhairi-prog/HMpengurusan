import fs from 'fs';
import path from 'path';

function fixDuplicateDark(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/dark:hover:bg-white dark:bg-white/g, 'dark:hover:bg-white');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixDuplicateDark(fullPath);
    }
  });
}

traverseDir('./components');
fixDuplicateDark('./App.tsx');
