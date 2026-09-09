import { execSync } from 'node:child_process';
import path from 'node:path';

const BACKEND_DIR = path.resolve(process.cwd(), '..', 'cuentas-backend');

export default function globalTeardown(): void {
  execSync('docker compose -f docker-compose.test.yml down', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
  });
}
