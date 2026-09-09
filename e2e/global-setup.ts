import { execSync } from 'node:child_process';
import path from 'node:path';

const BACKEND_DIR = path.resolve(process.cwd(), '..', 'cuentas-backend');

export default function globalSetup(): void {
  execSync('docker compose -f docker-compose.test.yml up -d --wait', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
  });
  execSync('npm run db:migrate:test', { cwd: BACKEND_DIR, stdio: 'inherit' });
}
