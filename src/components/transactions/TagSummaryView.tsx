import { useState } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { formatCurrency } from '../../lib/utils';
import { TagBadge } from './TagBadge';
import { tagsApi } from '../../api/tags.api';
import type { TagSummary } from '../../types';

interface TagSummaryViewProps {
  summary: TagSummary[];
  loading: boolean;
  onTagClick: (tagName: string) => void;
  onDeleted: () => void;
}

export function TagSummaryView({ summary, loading, onTagClick, onDeleted }: TagSummaryViewProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeletingId(confirmId);
    try {
      await tagsApi.delete(confirmId);
      onDeleted();
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const confirmTag = summary.find((t) => t.id === confirmId);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Tag className="h-10 w-10 text-gray-300" />
          <p className="text-gray-500">No hay etiquetas aún</p>
          <p className="text-sm text-gray-400">Agrega etiquetas al crear o editar transacciones</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((tag) => (
          <Card
            key={tag.id}
            className="cursor-pointer hover:border-indigo-300 transition-colors"
            onClick={() => onTagClick(tag.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <TagBadge name={tag.name} />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{tag.count} transacciones</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-600"
                    title="Eliminar etiqueta"
                    disabled={deletingId === tag.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmId(tag.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                {tag.totalExpenses > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Gastos</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(tag.totalExpenses)}
                    </span>
                  </div>
                )}
                {tag.totalIncome > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ingresos</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(tag.totalIncome)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Eliminar etiqueta"
        description={`¿Eliminar la etiqueta "${confirmTag?.name}"? Se quitará de todas las transacciones que la usen.`}
        confirmText="Eliminar"
        loading={!!deletingId}
      />
    </>
  );
}
