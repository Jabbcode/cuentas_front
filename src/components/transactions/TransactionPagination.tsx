import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface TransactionPaginationProps {
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  total: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function TransactionPagination({
  currentPage,
  totalPages,
  startItem,
  endItem,
  total,
  onPreviousPage,
  onNextPage,
  hasNextPage,
  hasPreviousPage,
}: TransactionPaginationProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {startItem}-{endItem} de {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={!hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!hasNextPage}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
