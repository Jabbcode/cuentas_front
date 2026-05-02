import { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, X, Eye, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import {
  receiptsApi,
  type ScanReceiptData,
  type ExistingTransaction,
} from '../../../api/receipts.api';
import { formatCurrency } from '../../../lib/utils';

interface ReceiptScannerProps {
  open: boolean;
  onClose: () => void;
  onScanned: (data: ScanReceiptData) => void;
  onViewExisting?: (transaction: ExistingTransaction) => void;
}

export function ReceiptScanner({ open, onClose, onScanned, onViewExisting }: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    duplicate: boolean;
    matchType: 'exact' | 'similar' | 'none';
    existingTransaction?: ExistingTransaction;
    scannedData?: ScanReceiptData;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setScanning(true);
    setScanResult(null);

    try {
      const result = await receiptsApi.scan(file);
      setScanResult(result);
    } catch (err) {
      console.error('Error scanning receipt:', err);
      alert('Error al escanear la factura. Por favor intenta de nuevo.');
      setImagePreview(null);
    } finally {
      setScanning(false);
    }
  };

  const handleUseScanned = () => {
    if (scanResult?.scannedData) {
      onScanned(scanResult.scannedData);
      handleCloseModal();
    }
  };

  const handleViewExisting = () => {
    if (scanResult?.existingTransaction && onViewExisting) {
      onViewExisting(scanResult.existingTransaction);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setImagePreview(null);
    setScanResult(null);
    setScanning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleTryAgain = () => {
    setImagePreview(null);
    setScanResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onClose={handleCloseModal}>
      <DialogHeader>
        <DialogTitle>Escanear Factura</DialogTitle>
      </DialogHeader>

      <DialogContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!imagePreview ? (
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Sube una imagen de tu factura</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG o WEBP - Máximo 10MB</p>
              </div>
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Camera className="h-4 w-4" />
              <span>Tip: Asegúrate que la foto esté clara y bien iluminada</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
              />
              {!scanning && !scanResult && (
                <button
                  onClick={handleTryAgain}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {scanning && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm text-gray-600">Procesando factura...</p>
              </div>
            )}

            {scanResult && !scanning && (
              <>
                {scanResult.duplicate &&
                  scanResult.matchType === 'exact' &&
                  scanResult.existingTransaction && (
                    <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-orange-900 mb-2">
                            Factura ya registrada
                          </h3>
                          <p className="text-sm text-orange-800 mb-3">
                            Esta factura fue escaneada el{' '}
                            {format(
                              new Date(scanResult.existingTransaction.createdAt),
                              "d 'de' MMMM, yyyy 'a las' HH:mm",
                              { locale: es }
                            )}
                          </p>
                          <div className="bg-white rounded-md p-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monto:</span>
                              <span className="font-semibold">
                                {formatCurrency(scanResult.existingTransaction.amount)}
                              </span>
                            </div>
                            {scanResult.existingTransaction.description && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Descripción:</span>
                                <span className="font-medium">
                                  {scanResult.existingTransaction.description}
                                </span>
                              </div>
                            )}
                            {scanResult.existingTransaction.account && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Cuenta:</span>
                                <span className="font-medium">
                                  {scanResult.existingTransaction.account.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                {scanResult.duplicate &&
                  scanResult.matchType === 'similar' &&
                  scanResult.existingTransaction &&
                  scanResult.scannedData && (
                    <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-yellow-900 mb-2">
                            Posible duplicado detectado
                          </h3>
                          <p className="text-sm text-yellow-800 mb-3">
                            Encontramos una transacción similar registrada el{' '}
                            {format(
                              new Date(scanResult.existingTransaction.createdAt),
                              "d 'de' MMMM, yyyy",
                              { locale: es }
                            )}
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-md p-3">
                              <p className="text-xs font-semibold text-gray-500 mb-2">EXISTENTE</p>
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold">
                                  {formatCurrency(scanResult.existingTransaction.amount)}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {scanResult.existingTransaction.description || 'Sin descripción'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(
                                    new Date(scanResult.existingTransaction.date),
                                    'd MMM yyyy',
                                    { locale: es }
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
                              <p className="text-xs font-semibold text-blue-600 mb-2">NUEVA</p>
                              <div className="space-y-1 text-sm">
                                <p className="font-semibold">
                                  {formatCurrency(scanResult.scannedData.amount)}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {scanResult.scannedData.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {format(new Date(scanResult.scannedData.date), 'd MMM yyyy', {
                                    locale: es,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          {scanResult.scannedData.items &&
                            scanResult.scannedData.items.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="h-4 w-4 text-blue-600" />
                                  <h4 className="text-xs font-semibold text-gray-900">
                                    Items detectados en nueva factura (
                                    {scanResult.scannedData.items.length})
                                  </h4>
                                </div>
                                <div className="bg-white rounded-md p-2 max-h-32 overflow-y-auto border border-gray-200">
                                  <table className="w-full text-xs">
                                    <thead className="text-gray-600">
                                      <tr>
                                        <th className="text-left pb-1 font-semibold text-[10px]">
                                          Producto
                                        </th>
                                        <th className="text-center pb-1 font-semibold w-12 text-[10px]">
                                          Cant.
                                        </th>
                                        <th className="text-right pb-1 font-semibold w-16 text-[10px]">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {scanResult.scannedData.items.map((item, idx) => (
                                        <tr key={idx}>
                                          <td className="py-1 text-gray-900 text-[10px]">
                                            {item.name}
                                          </td>
                                          <td className="py-1 text-center text-gray-700 text-[10px]">
                                            {item.quantity}
                                          </td>
                                          <td className="py-1 text-right font-semibold text-gray-900 text-[10px]">
                                            {formatCurrency(item.totalPrice)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                {!scanResult.duplicate && scanResult.scannedData && (
                  <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-900 mb-2">
                          Factura procesada correctamente
                        </h3>
                        <div className="bg-white rounded-md p-3 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monto:</span>
                            <span className="font-semibold">
                              {formatCurrency(scanResult.scannedData.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Descripción:</span>
                            <span className="font-medium">
                              {scanResult.scannedData.description}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium">
                              {format(new Date(scanResult.scannedData.date), "d 'de' MMMM, yyyy", {
                                locale: es,
                              })}
                            </span>
                          </div>
                          {scanResult.scannedData.suggestedCategory && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Categoría sugerida:</span>
                              <span className="font-medium">
                                {scanResult.scannedData.suggestedCategory}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-gray-600">Confianza:</span>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                scanResult.scannedData.confidence === 'high'
                                  ? 'bg-green-100 text-green-700'
                                  : scanResult.scannedData.confidence === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {scanResult.scannedData.confidence === 'high'
                                ? 'Alta'
                                : scanResult.scannedData.confidence === 'medium'
                                  ? 'Media'
                                  : 'Baja'}
                            </span>
                          </div>
                        </div>

                        {scanResult.scannedData.items &&
                          scanResult.scannedData.items.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Package className="h-4 w-4 text-green-600" />
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Items detectados ({scanResult.scannedData.items.length})
                                </h4>
                              </div>
                              <div className="bg-gray-50 rounded-md p-3 max-h-48 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="text-gray-600 border-b border-gray-300">
                                    <tr>
                                      <th className="text-left pb-2 font-semibold">Producto</th>
                                      <th className="text-center pb-2 font-semibold w-16">Cant.</th>
                                      <th className="text-right pb-2 font-semibold w-20">
                                        P. Unit.
                                      </th>
                                      <th className="text-right pb-2 font-semibold w-20">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {scanResult.scannedData.items.map((item, idx) => (
                                      <tr key={idx} className="hover:bg-white">
                                        <td className="py-2 text-gray-900">{item.name}</td>
                                        <td className="py-2 text-center text-gray-700">
                                          {item.quantity}
                                        </td>
                                        <td className="py-2 text-right text-gray-700">
                                          {formatCurrency(item.unitPrice)}
                                        </td>
                                        <td className="py-2 text-right font-semibold text-gray-900">
                                          {formatCurrency(item.totalPrice)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="border-t-2 border-gray-300">
                                    <tr>
                                      <td
                                        colSpan={3}
                                        className="pt-2 text-right font-semibold text-gray-700"
                                      >
                                        Suma items:
                                      </td>
                                      <td className="pt-2 text-right font-bold text-gray-900">
                                        {formatCurrency(
                                          scanResult.scannedData.items.reduce(
                                            (sum, item) => sum + item.totalPrice,
                                            0
                                          )
                                        )}
                                      </td>
                                    </tr>
                                    {Math.abs(
                                      scanResult.scannedData.items.reduce(
                                        (sum, item) => sum + item.totalPrice,
                                        0
                                      ) - scanResult.scannedData.amount
                                    ) > 0.01 && (
                                      <tr className="text-xs text-orange-600">
                                        <td colSpan={4} className="pt-1 text-right">
                                          La suma no coincide con el total de la factura
                                        </td>
                                      </tr>
                                    )}
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>

      <DialogFooter>
        {!imagePreview && (
          <Button variant="outline" onClick={handleCloseModal}>
            Cancelar
          </Button>
        )}
        {imagePreview && (scanning || !scanResult) && (
          <Button variant="outline" onClick={handleTryAgain} disabled={scanning}>
            Cancelar
          </Button>
        )}
        {scanResult?.duplicate && scanResult.matchType === 'exact' && (
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            {onViewExisting && (
              <Button onClick={handleViewExisting}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Transacción
              </Button>
            )}
          </>
        )}
        {scanResult?.duplicate && scanResult.matchType === 'similar' && (
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            {onViewExisting && (
              <Button variant="outline" onClick={handleViewExisting}>
                <Eye className="mr-2 h-4 w-4" />
                Usar Existente
              </Button>
            )}
            <Button onClick={handleUseScanned}>Guardar Como Nueva</Button>
          </>
        )}
        {scanResult && !scanResult.duplicate && scanResult.scannedData && (
          <>
            <Button variant="outline" onClick={handleTryAgain}>
              Escanear Otra
            </Button>
            <Button onClick={handleUseScanned}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Usar Datos
            </Button>
          </>
        )}
      </DialogFooter>
    </Dialog>
  );
}
