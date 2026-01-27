
export enum OrderStatus {
  PENDING = 'PENDING',
  ESCROW_LOCKED = 'ESCROW_LOCKED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export interface LoginEvent {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  location: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  balance: number;
  is2FAEnabled: boolean;
  loginHistory: LoginEvent[];
  activeSessions: ActiveSession[];
}

export interface Order {
  id: string;
  type: 'BUY' | 'SELL';
  amount: number;
  currency: string;
  price: number;
  status: OrderStatus;
  creatorId: string;
  creatorEmail: string;
  createdAt: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  groundingUrls?: { uri: string; title: string }[];
}
