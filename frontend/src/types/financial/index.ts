export type ExpenseStatus = 'pending' | 'paid' | 'cancelled';
export type RevenueStatus = 'pending' | 'received' | 'cancelled';

export interface FinancialCategory {
  id: string;
  community_id: string;
  user_id: string;
  name: string;
  type: 'expense' | 'revenue';
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  community_id: string;
  user_id: string;
  name: string;
  cnpj: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  community_id: string;
  user_id: string;
  category_id: string;
  supplier_id?: string;
  event_id?: string;
  amount: number;
  date: string;
  description?: string;
  status: ExpenseStatus;
  payment_type?: string;
  due_date: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  category?: FinancialCategory;
  supplier?: Supplier;
}

export interface Revenue {
  id: string;
  community_id: string;
  user_id: string;
  category_id: string;
  event_id?: string;
  amount: number;
  date: string;
  description?: string;
  status: RevenueStatus;
  payment_type?: string;
  received_at?: string;
  created_at: string;
  updated_at: string;
  category?: FinancialCategory;
}

export interface FinancialReport {
  id: string;
  community_id: string;
  user_id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date: string;
  total_revenue: number;
  total_expense: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
} 