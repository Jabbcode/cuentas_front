import { api } from './client';

export interface ScanReceiptData {
  amount: number;
  description: string;
  date: string;
  suggestedCategory?: string;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
  imageHash: string;
}

export interface ExistingTransaction {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  account?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

export interface ScanReceiptResponse {
  duplicate: boolean;
  matchType: 'exact' | 'similar' | 'none';
  existingTransaction?: ExistingTransaction;
  scannedData?: ScanReceiptData;
}

export const receiptsApi = {
  /**
   * Scan a receipt image and extract data with duplicate detection
   */
  async scan(imageFile: File): Promise<ScanReceiptResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<ScanReceiptResponse>('/receipts/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * OCR only (no AI processing) - FREE
   */
  async ocrOnly(imageFile: File): Promise<{ rawText: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<{ rawText: string }>('/receipts/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
