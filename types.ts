
export enum OrderStatus {
  PENDING = 'PENDING',
  ESCROW_LOCKED = 'ESCROW_LOCKED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  balance: number;
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
}
