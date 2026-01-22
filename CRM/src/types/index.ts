export type UserRole = 'chatter' | 'model';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Model {
  id: string;
  username: string;
  isOnline: boolean;
  createdAt: string;
}

export interface CalendarAvailability {
  id: string;
  modelId: string;
  date: string; // YYYY-MM-DD format
  isAvailable: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  modelId: string;
  chatterId: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  confirmedAt?: string;
}

export interface ModelStats {
  modelId: string;
  totalBookings: number;
  totalEarnings: number;
  completedBookings: number;
  pendingBookings: number;
  averageBookingValue: number;
}
