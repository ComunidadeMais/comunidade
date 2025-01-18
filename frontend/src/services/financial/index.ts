import api from '../api';
import {
  FinancialCategory,
  Supplier,
  Expense,
  Revenue,
  FinancialReport,
  PaginatedResponse,
} from '../../types/financial';

const formatToRFC3339 = (date: string) => {
  return new Date(date).toISOString();
};

export const financialService = {
  // Categorias
  createCategory: async (communityId: string, data: Partial<FinancialCategory>) => {
    const response = await api.post(`/${communityId}/financial/categories`, data);
    return response.data;
  },

  updateCategory: async (communityId: string, categoryId: string, data: Partial<FinancialCategory>) => {
    const response = await api.put(`/${communityId}/financial/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (communityId: string, categoryId: string) => {
    const response = await api.delete(`/${communityId}/financial/categories/${categoryId}`);
    return response.data;
  },

  listCategories: async (communityId: string, params?: Record<string, any>): Promise<PaginatedResponse<FinancialCategory>> => {
    const response = await api.get(`/${communityId}/financial/categories`, { params });
    return {
      data: response.data.categories,
      pagination: response.data.pagination
    };
  },

  // Fornecedores
  createSupplier: async (communityId: string, data: Partial<Supplier>) => {
    const response = await api.post(`/${communityId}/financial/suppliers`, data);
    return response.data;
  },

  updateSupplier: async (communityId: string, supplierId: string, data: Partial<Supplier>) => {
    const response = await api.put(`/${communityId}/financial/suppliers/${supplierId}`, data);
    return response.data;
  },

  deleteSupplier: async (communityId: string, supplierId: string) => {
    const response = await api.delete(`/${communityId}/financial/suppliers/${supplierId}`);
    return response.data;
  },

  listSuppliers: async (communityId: string, params?: Record<string, any>): Promise<PaginatedResponse<Supplier>> => {
    const response = await api.get(`/${communityId}/financial/suppliers`, { params });
    return {
      data: response.data.suppliers,
      pagination: response.data.pagination
    };
  },

  // Despesas
  createExpense: async (communityId: string, data: Partial<Expense>) => {
    const formattedData = {
      ...data,
      date: data.date ? formatToRFC3339(data.date) : undefined,
      due_date: data.due_date ? formatToRFC3339(data.due_date) : undefined,
      paid_at: data.paid_at ? formatToRFC3339(data.paid_at) : undefined,
    };
    const response = await api.post(`/${communityId}/financial/expenses`, formattedData);
    return response.data;
  },

  updateExpense: async (communityId: string, expenseId: string, data: Partial<Expense>) => {
    const formattedData = {
      ...data,
      date: data.date ? formatToRFC3339(data.date) : undefined,
      due_date: data.due_date ? formatToRFC3339(data.due_date) : undefined,
      paid_at: data.paid_at ? formatToRFC3339(data.paid_at) : undefined,
    };
    const response = await api.put(`/${communityId}/financial/expenses/${expenseId}`, formattedData);
    return response.data;
  },

  deleteExpense: async (communityId: string, expenseId: string) => {
    const response = await api.delete(`/${communityId}/financial/expenses/${expenseId}`);
    return response.data;
  },

  listExpenses: async (communityId: string, params?: Record<string, any>): Promise<PaginatedResponse<Expense>> => {
    const response = await api.get(`/${communityId}/financial/expenses`, { params });
    return {
      data: response.data.expenses,
      pagination: response.data.pagination
    };
  },

  // Receitas
  createRevenue: async (communityId: string, data: Partial<Revenue>) => {
    const formattedData = {
      ...data,
      date: data.date ? formatToRFC3339(data.date) : undefined,
      received_at: data.received_at ? formatToRFC3339(data.received_at) : undefined,
    };
    const response = await api.post(`/${communityId}/financial/revenues`, formattedData);
    return response.data;
  },

  updateRevenue: async (communityId: string, revenueId: string, data: Partial<Revenue>) => {
    const formattedData = {
      ...data,
      date: data.date ? formatToRFC3339(data.date) : undefined,
      received_at: data.received_at ? formatToRFC3339(data.received_at) : undefined,
    };
    const response = await api.put(`/${communityId}/financial/revenues/${revenueId}`, formattedData);
    return response.data;
  },

  deleteRevenue: async (communityId: string, revenueId: string) => {
    const response = await api.delete(`/${communityId}/financial/revenues/${revenueId}`);
    return response.data;
  },

  listRevenues: async (communityId: string, params?: Record<string, any>): Promise<PaginatedResponse<Revenue>> => {
    const response = await api.get(`/${communityId}/financial/revenues`, { params });
    return {
      data: response.data.revenues,
      pagination: response.data.pagination
    };
  },

  // Relatórios
  generateReport: async (communityId: string, data: { start_date: string; end_date: string; type: string }) => {
    const formattedData = {
      ...data,
      start_date: formatToRFC3339(data.start_date),
      end_date: formatToRFC3339(data.end_date),
    };
    const response = await api.post(`/${communityId}/financial/reports`, formattedData);
    return response.data;
  },

  listReports: async (communityId: string, params?: Record<string, any>): Promise<PaginatedResponse<FinancialReport>> => {
    const response = await api.get(`/${communityId}/financial/reports`, { params });
    return {
      data: response.data.reports,
      pagination: response.data.pagination
    };
  },
}; 