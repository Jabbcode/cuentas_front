// Public API of the categories feature module

// Types
export type {
  CategoryFormData,
  CategoryPayload,
  UseCategoriesReturn,
  UseCategoriesPageReturn,
} from './types';

// API
export { categoriesApi } from './api';

// Utils
export {
  CATEGORY_COLORS,
  DEFAULT_FORM_DATA,
  buildCategoryPayload,
  buildFormDataFromCategory,
  filterCategoriesByType,
} from './utils';

// Hooks
export { useCategories } from './hooks/useCategories';
export { useCategoriesPage } from './hooks/useCategoriesPage';

// Components
export { CategoryList } from './components/CategoryList';
export { CategoryFormDialog } from './components/CategoryFormDialog';
