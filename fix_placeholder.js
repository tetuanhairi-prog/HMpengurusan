import fs from 'fs';
import path from 'path';

function fixPlaceholder(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(/placeholder:text-gray-800/g, 'placeholder:text-gray-800 dark:placeholder:text-gray-400');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixPlaceholder(fullPath);
    }
  });
}

traverseDir('./components');
