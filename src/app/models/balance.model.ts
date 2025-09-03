export interface Balance {
  id: number;
  date: string;
  balance: number;
}

export interface CreateBalanceRequest {
  id: number;
  date: string;
  balance: number;
}

export interface BalanceFormData {
  date: string;
  balance: number;
}
