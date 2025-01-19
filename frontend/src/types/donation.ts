export interface Campaign {
  id: string;
  name: string;
  description?: string;
  goal_amount: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  campaign_id?: string;
  member_id?: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringDonation {
  id: string;
  member_id?: string;
  amount: number;
  payment_method: string;
  status: string;
  frequency: string;
  next_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AsaasConfig {
  id: string;
  api_key: string;
  sandbox: boolean;
  webhook_token?: string;
  created_at: string;
  updated_at: string;
} 