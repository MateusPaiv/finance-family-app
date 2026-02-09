import api from './api';
import type {
  ApiResponse,
  BudgetOverviewItem,
  Category,
  CategoryWithBudget,
  CategoryWithCounts,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types';

export async function getCategories(): Promise<CategoryWithCounts[]> {
  const { data } =
    await api.get<ApiResponse<CategoryWithCounts[]>>('/api/categories');
  return data.data!;
}

export async function getCategory(id: string): Promise<CategoryWithBudget> {
  const { data } = await api.get<ApiResponse<CategoryWithBudget>>(
    `/api/categories/${id}`,
  );
  return data.data!;
}

export async function createCategory(
  categoryData: CreateCategoryRequest,
): Promise<Category> {
  const { data } = await api.post<ApiResponse<Category>>(
    '/api/categories',
    categoryData,
  );
  return data.data!;
}

export async function updateCategory(
  id: string,
  categoryData: UpdateCategoryRequest,
): Promise<Category> {
  const { data } = await api.put<ApiResponse<Category>>(
    `/api/categories/${id}`,
    categoryData,
  );
  return data.data!;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/categories/${id}`);
}

export async function getBudgetOverview(): Promise<BudgetOverviewItem[]> {
  const { data } = await api.get<ApiResponse<BudgetOverviewItem[]>>(
    '/api/categories/budget/overview',
  );
  return data.data!;
}
