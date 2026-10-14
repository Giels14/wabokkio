// Cloudflare Pages zoekt per map naar 404.html; zet de Engelse 404 op /en/404.html.
import { copyFileSync, rmSync } from 'node:fs';
copyFileSync('dist/en/404/index.html', 'dist/en/404.html');
rmSync('dist/en/404', { recursive: true });
