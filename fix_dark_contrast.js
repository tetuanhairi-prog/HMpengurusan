import fs from 'fs';
import path from 'path';

function fixContrast(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace dark mode text colors to be brighter for better readability
  content = content.replace(/dark:text-gray-500/g, 'dark:text-slate-300');
  content = content.replace(/dark:text-gray-400/g, 'dark:text-slate-200');
  content = content.replace(/dark:text-gray-300/g, 'dark:text-slate-100');
  
  // Update general slate-900 references just in case some are missed
  content = content.replace(/text-slate-900(?! dark:)/g, 'text-slate-900 dark:text-white');
  
  // also check background borders for inputs in dark mode. 
  // dark:border-white/10 maybe a bit too dark for input, let's use dark:border-slate-500 or dark:border-white/20
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function traverseDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fixContrast(fullPath);
    }
  });
}

traverseDir('./components');
fixContrast('./App.tsx');
