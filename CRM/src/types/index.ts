export type UserRole = 'chatter' | 'model';

export type CustomerLabel = 'shrimp' | 'fish' | 'dolphin' | 'whale';

export type TaskStatus = 'not_started' | 'in_progress' | 'done';

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

export interface Customer {
  id: string;
  modelId: string;
  name: string;
  label: CustomerLabel;
  phoneNumber: string;
  age: number;
  preferences: string;
  interests: string;
  generalNotes: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SpendingRecord {
  id: string;
  customerId: string;
  amount: number;
  service: string;
  date: string;
  time: string;
  createdAt: string;
  createdBy: string;
}

export interface CalendarEntry {
  id: string;
  modelId: string;
  title: string;
  start: Date;
  end: Date;
  notes: string;
  status: TaskStatus;
  isBlocked: boolean;
  isOnline: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkQueueItem {
  id: string;
  modelId: string;
  title: string;
  date: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ModelStats {
  modelId: string;
  totalBookings: number;
  totalEarnings: number;
  completedBookings: number;
  pendingBookings: number;
  averageBookingValue: number;
}
