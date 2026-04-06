import { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, X, Eye } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { receiptsApi, type ScanReceiptData, type ExistingTransaction } from '../../api/receipts.api';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Scan receipt
    setScanning(true);
    setScanResult(null);

    try {
      const result = await receiptsApi.scan(file);
      setScanResult(result);
    } catch (error) {
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
        <DialogTitle>📸 Escanear Factura</DialogTitle>
      </DialogHeader>

      <DialogContent className="space-y-4">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image Preview or Upload Button */}
        {!imagePreview ? (
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">
                  Sube una imagen de tu factura
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG o WEBP - Máximo 10MB
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Camera className="h-4 w-4" />
              <span>Tip: Asegúrate que la foto esté clara y bien iluminada</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
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

            {/* Scanning State */}
            {scanning && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm text-gray-600">Procesando factura...</p>
              </div>
            )}

            {/* Results */}
            {scanResult && !scanning && (
              <>
                {/* Exact Duplicate Alert */}
                {scanResult.duplicate && scanResult.matchType === 'exact' && scanResult.existingTransaction && (
                  <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-orange-900 mb-2">
                          Factura ya registrada
                        </h3>
                        <p className="text-sm text-orange-800 mb-3">
                          Esta factura fue escaneada el{' '}
                          {format(new Date(scanResult.existingTransaction.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
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

                {/* Similar Duplicate Alert */}
                {scanResult.duplicate && scanResult.matchType === 'similar' && scanResult.existingTransaction && scanResult.scannedData && (
                  <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                          Posible duplicado detectado
                        </h3>
                        <p className="text-sm text-yellow-800 mb-3">
                          Encontramos una transacción similar registrada el{' '}
                          {format(new Date(scanResult.existingTransaction.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>

                        {/* Comparison */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Existing */}
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
                                {format(new Date(scanResult.existingTransaction.date), 'd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                          </div>

                          {/* New */}
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
                                {format(new Date(scanResult.scannedData.date), 'd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Duplicate - Success */}
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
                              {format(new Date(scanResult.scannedData.date), "d 'de' MMMM, yyyy", { locale: es })}
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
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                              scanResult.scannedData.confidence === 'high' ? 'bg-green-100 text-green-700' :
                              scanResult.scannedData.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {scanResult.scannedData.confidence === 'high' ? 'Alta' :
                               scanResult.scannedData.confidence === 'medium' ? 'Media' : 'Baja'}
                            </span>
                          </div>
                        </div>
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
        {/* No image selected */}
        {!imagePreview && (
          <Button variant="outline" onClick={handleCloseModal}>
            Cancelar
          </Button>
        )}

        {/* Scanning or no result yet */}
        {imagePreview && (scanning || !scanResult) && (
          <Button variant="outline" onClick={handleTryAgain} disabled={scanning}>
            Cancelar
          </Button>
        )}

        {/* Results - Exact Duplicate */}
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

        {/* Results - Similar Duplicate */}
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
            <Button onClick={handleUseScanned}>
              Guardar Como Nueva
            </Button>
          </>
        )}

        {/* Results - No Duplicate */}
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
