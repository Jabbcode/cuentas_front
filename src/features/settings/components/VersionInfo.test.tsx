import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VersionInfo } from './VersionInfo';

describe('VersionInfo', () => {
  it('muestra la versión 1.4.0', () => {
    render(<VersionInfo version="1.4.0" />);

    expect(screen.getByText('1.4.0')).toBeInTheDocument();
  });

  it('muestra la versión 1.5.0-SNAPSHOT', () => {
    render(<VersionInfo version="1.5.0-SNAPSHOT" />);

    expect(screen.getByText('1.5.0-SNAPSHOT')).toBeInTheDocument();
  });
});
