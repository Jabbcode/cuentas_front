import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './table';

describe('Table', () => {
  it('renderiza encabezado, filas, celdas, footer y caption', () => {
    render(
      <Table>
        <TableCaption>Leyenda</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Fila 1</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    expect(screen.getByText('Leyenda')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Fila 1')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
