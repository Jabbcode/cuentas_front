import { APP_VERSION } from '../../../lib/version';

export interface VersionInfoProps {
  version?: string;
}

export function VersionInfo({ version = APP_VERSION }: VersionInfoProps) {
  return (
    <p className="text-sm text-gray-500">
      Versión: <span className="font-medium text-gray-700">{version}</span>
    </p>
  );
}
