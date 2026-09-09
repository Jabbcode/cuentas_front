import { execSync } from 'node:child_process';
import path from 'node:path';

// Overrideable via env var: la carpeta hermana se llama `cuentas-backend` en
// este checkout local, pero el repo real es `cuentas_back` (ver CLAUDE.md) —
// cualquier checkout que use ese nombre real (CI, otro layout de monorepo)
// necesita poder apuntar a otro lado sin tocar código.
const BACKEND_DIR =
  process.env.E2E_BACKEND_DIR ?? path.resolve(process.cwd(), '..', 'cuentas-backend');

export default function globalSetup(): void {
  execSync('docker compose -f docker-compose.test.yml up -d --wait', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
  });
  execSync('npm run db:migrate:test', { cwd: BACKEND_DIR, stdio: 'inherit' });
}
