export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  token?: string;
}

export interface UserInfo {
  id: number;
  jobNumber: string;
  name: string;
  role: string;
  company: string;
  lastLoginTime: string;
} 