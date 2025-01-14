export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone: string;
  avatar: string;
  avatar_url: string;
  bio: string;
  date_of_birth: string | null;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  last_login_at: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
  language: string;
  theme: 'light' | 'dark';
  timezone: string;
  notify_by_email: boolean;
  notify_by_phone: boolean;
  two_factor_enabled: boolean;
  last_password_change: string;
}

export interface UpdateProfileRequest {
  name: string;
  email?: string;
  phone: string;
  bio: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  language: string;
  theme: 'light' | 'dark';
  timezone: string;
  notify_by_email: boolean;
  notify_by_phone: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
} 