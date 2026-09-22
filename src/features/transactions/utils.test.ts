import { describe, it, expect } from 'vitest';
import { parseInitialFiltersFromSearchParams } from './utils';

describe('parseInitialFiltersFromSearchParams', () => {
  it('devuelve {} cuando no hay ningún param', () => {
    expect(parseInitialFiltersFromSearchParams(new URLSearchParams(''))).toEqual({});
  });

  it('parsea startDate, endDate, type, accountId y categoryIds válidos', () => {
    const params = new URLSearchParams(
      'startDate=2026-01-01&endDate=2026-01-31&type=expense&accountId=acc-1&categoryIds=cat-1,cat-2'
    );

    expect(parseInitialFiltersFromSearchParams(params)).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      type: 'expense',
      accountId: 'acc-1',
      categoryIds: ['cat-1', 'cat-2'],
    });
  });

  it('ignora startDate/endDate con formato inválido', () => {
    const params = new URLSearchParams('startDate=01-01-2026&endDate=not-a-date');

    expect(parseInitialFiltersFromSearchParams(params)).toEqual({});
  });

  it('ignora type fuera de expense/income', () => {
    const params = new URLSearchParams('type=all');

    expect(parseInitialFiltersFromSearchParams(params)).toEqual({});
  });

  it('ignora accountId y categoryIds vacíos', () => {
    const params = new URLSearchParams('accountId=&categoryIds=');

    expect(parseInitialFiltersFromSearchParams(params)).toEqual({});
  });

  it('recorta espacios y descarta entradas vacías en categoryIds', () => {
    const params = new URLSearchParams('categoryIds=' + encodeURIComponent(' cat-1 , ,cat-2'));

    expect(parseInitialFiltersFromSearchParams(params)).toEqual({
      categoryIds: ['cat-1', 'cat-2'],
    });
  });

  it('ignora params desconocidos sin romper', () => {
    const params = new URLSearchParams('foo=bar&startDate=2026-01-01');

    expect(parseInitialFiltersFromSearchParams(params)).toEqual({ startDate: '2026-01-01' });
  });
});
