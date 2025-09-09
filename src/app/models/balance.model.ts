export interface Balance {
  id: number;
  date: string;
  balance: number;
}

export interface CreateBalanceRequest {
  date: string;
  balance: number;
}

export interface BalanceFormData {
  date: string;
  balance: number;
}

export interface BalanceError {
  message: string;
  status?: number;
}
