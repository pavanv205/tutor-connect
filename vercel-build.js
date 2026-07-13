import { execSync } from 'child_process';

console.log('🔧 Building frontend with Vite...');
execSync('npm run build', { stdio: 'inherit' });
console.log('✅ Frontend built.');
// No extra steps needed for backend; Vercel will use api/index.js directly.
