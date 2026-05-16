import fs from 'fs';
import path from 'path';

function fixWhiteOp(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/dark:text-white\/30/g, 'dark:text-white/60');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixWhiteOp(fullPath);
    }
  });
}

traverseDir('./components');
