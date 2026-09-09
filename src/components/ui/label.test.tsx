import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';
import { Input } from './input';

describe('Label', () => {
  it('asocia el label al input via htmlFor/id', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
