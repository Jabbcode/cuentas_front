import { execSync } from 'node:child_process';
import path from 'node:path';

// Ver comentario en global-setup.ts — overrideable para checkouts donde el
// backend no viva en una carpeta hermana llamada `cuentas-backend`.
const BACKEND_DIR =
  process.env.E2E_BACKEND_DIR ?? path.resolve(process.cwd(), '..', 'cuentas-backend');

export default function globalTeardown(): void {
  execSync('docker compose -f docker-compose.test.yml down', {
    cwd: BACKEND_DIR,
    stdio: 'inherit',
  });
}
