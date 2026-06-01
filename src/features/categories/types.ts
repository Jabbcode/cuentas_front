import type { Category } from '../../types';

export interface CategoryFormData {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  monthlyLimit: string;
}

export interface CategoryPayload {
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  monthlyLimit: number | null;
}

export interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export interface UseCategoriesPageReturn {
  categories: Category[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  showForm: boolean;
  editingCategory: Category | null;
  deleteId: string | null;
  error: string;
  formData: CategoryFormData;
  openForm: (category?: Category) => void;
  closeForm: () => void;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
  setDeleteId: (id: string | null) => void;
}
