import { create } from 'zustand';
import type { User, Model, CalendarAvailability, Booking, UserRole, Customer, SpendingRecord, CalendarEntry, WorkQueueItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Store {
  // Users
  currentUser: User | null;
  users: User[];
  models: Model[];
  
  // Data
  customers: Customer[];
  spendingRecords: SpendingRecord[];
  calendarAvailabilities: CalendarAvailability[];
  calendarEntries: CalendarEntry[];
  workQueueItems: WorkQueueItem[];
  bookings: Booking[];
  
  // Selected date for chatter view
  selectedDate: string | null;
  selectedModelId: string | null;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  createUser: (username: string, role: UserRole, avatar?: string) => User;
  createModel: (username: string) => Model;
  toggleModelOnlineStatus: (modelId: string) => void;
  setSelectedModel: (modelId: string | null) => void;
  
  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Spending Records
  addSpendingRecord: (record: Omit<SpendingRecord, 'id' | 'createdAt' | 'createdBy'>) => SpendingRecord;
  updateSpendingRecord: (id: string, updates: Partial<SpendingRecord>) => void;
  deleteSpendingRecord: (id: string) => void;
  getCustomerTotal: (customerId: string) => number;
  getModelTotalEarnings: (modelId: string) => number;
  
  // Calendar Entries
  addCalendarEntry: (entry: Omit<CalendarEntry, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => CalendarEntry;
  updateCalendarEntry: (id: string, updates: Partial<CalendarEntry>) => void;
  deleteCalendarEntry: (id: string) => void;
  moveCalendarEntry: (id: string, newStart: Date, newEnd: Date) => void;
  
  // Work Queue
  addWorkQueueItem: (item: Omit<WorkQueueItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => WorkQueueItem;
  updateWorkQueueItem: (id: string, updates: Partial<WorkQueueItem>) => void;
  deleteWorkQueueItem: (id: string) => void;
  
  // Calendar Availability
  setAvailability: (modelId: string, date: string, isAvailable: boolean, startTime?: string, endTime?: string) => void;
  getModelAvailability: (modelId: string, date: string) => CalendarAvailability | null;
  getAvailableModelsForDate: (date: string) => Model[];
  
  // Bookings
  createBooking: (modelId: string, chatterId: string, date: string, time: string) => Booking;
  confirmBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  getModelBookings: (modelId: string) => Booking[];
  getChatterBookings: (chatterId: string) => Booking[];
  
  // Stats
  getModelStats: (modelId: string) => {
    totalBookings: number;
    totalEarnings: number;
    completedBookings: number;
    pendingBookings: number;
    averageBookingValue: number;
  };
  
  // Date selection
  setSelectedDate: (date: string | null) => void;
  
  // Dummy data
  initializeDummyData: () => void;
}

// Load from localStorage on init
const loadState = (): Partial<Store> => {
  try {
    const stored = localStorage.getItem('crm-storage');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return {};
};

// Save to localStorage
const saveState = (state: Store) => {
  try {
    localStorage.setItem('crm-storage', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

export const useStore = create<Store>()((set, get) => {
  const initialState: Store = {
    currentUser: null,
    users: [],
    models: [],
    customers: [],
    spendingRecords: [],
    calendarAvailabilities: [],
    calendarEntries: [],
    workQueueItems: [],
    bookings: [],
    selectedDate: null,
    selectedModelId: null,
    
    setCurrentUser: (user) => {
      set({ currentUser: user });
      saveState(get());
    },
    
    logout: () => {
      set({ currentUser: null });
      saveState(get());
    },
    
    createUser: (username, role, avatar) => {
      const user: User = {
        id: uuidv4(),
        username,
        role,
        avatar,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const newState = {
          ...state,
          users: [...state.users, user],
          currentUser: user,
        };
        if (role === 'model') {
          const model: Model = {
            id: user.id,
            username,
            isOnline: false,
            createdAt: new Date().toISOString(),
          };
          newState.models = [...newState.models, model];
        }
        saveState(newState);
        return newState;
      });
      return user;
    },
    
    createModel: (username) => {
      const model: Model = {
        id: uuidv4(),
        username,
        isOnline: false,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const newState = { ...state, models: [...state.models, model] };
        saveState(newState);
        return newState;
      });
      return model;
    },
    
    toggleModelOnlineStatus: (modelId) => {
      set((state) => {
        const newState = {
          ...state,
          models: state.models.map((m) =>
            m.id === modelId ? { ...m, isOnline: !m.isOnline } : m
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    setSelectedModel: (modelId) => {
      set({ selectedModelId: modelId });
      saveState(get());
    },
    
    addCustomer: (customerData) => {
      const customer: Customer = {
        ...customerData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: get().currentUser?.username || 'Unknown',
        updatedBy: get().currentUser?.username || 'Unknown',
      };
      set((state) => {
        const newState = { ...state, customers: [...state.customers, customer] };
        saveState(newState);
        return newState;
      });
      return customer;
    },
    
    updateCustomer: (id, updates) => {
      set((state) => {
        const newState = {
          ...state,
          customers: state.customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  updatedBy: get().currentUser?.username || 'Unknown',
                }
              : c
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    deleteCustomer: (id) => {
      set((state) => {
        const newState = {
          ...state,
          customers: state.customers.filter((c) => c.id !== id),
          spendingRecords: state.spendingRecords.filter((r) => r.customerId !== id),
        };
        saveState(newState);
        return newState;
      });
    },
    
    addSpendingRecord: (recordData) => {
      const record: SpendingRecord = {
        ...recordData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        createdBy: get().currentUser?.username || 'Unknown',
      };
      set((state) => {
        const newState = { ...state, spendingRecords: [...state.spendingRecords, record] };
        saveState(newState);
        return newState;
      });
      return record;
    },
    
    updateSpendingRecord: (id, updates) => {
      set((state) => {
        const newState = {
          ...state,
          spendingRecords: state.spendingRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    deleteSpendingRecord: (id) => {
      set((state) => {
        const newState = {
          ...state,
          spendingRecords: state.spendingRecords.filter((r) => r.id !== id),
        };
        saveState(newState);
        return newState;
      });
    },
    
    getCustomerTotal: (customerId) => {
      return get().spendingRecords
        .filter((r) => r.customerId === customerId)
        .reduce((sum, r) => sum + r.amount, 0);
    },
    
    getModelTotalEarnings: (modelId) => {
      const modelCustomers = get().customers.filter((c) => c.modelId === modelId);
      return modelCustomers.reduce((sum, customer) => {
        return sum + get().getCustomerTotal(customer.id);
      }, 0);
    },
    
    addCalendarEntry: (entryData) => {
      const entry: CalendarEntry = {
        ...entryData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: get().currentUser?.username || 'Unknown',
        updatedBy: get().currentUser?.username || 'Unknown',
      };
      set((state) => {
        const newState = { ...state, calendarEntries: [...state.calendarEntries, entry] };
        saveState(newState);
        return newState;
      });
      return entry;
    },
    
    updateCalendarEntry: (id, updates) => {
      set((state) => {
        const newState = {
          ...state,
          calendarEntries: state.calendarEntries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  updatedBy: get().currentUser?.username || 'Unknown',
                }
              : e
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    deleteCalendarEntry: (id) => {
      set((state) => {
        const newState = {
          ...state,
          calendarEntries: state.calendarEntries.filter((e) => e.id !== id),
        };
        saveState(newState);
        return newState;
      });
    },
    
    moveCalendarEntry: (id, newStart, newEnd) => {
      set((state) => {
        const newState = {
          ...state,
          calendarEntries: state.calendarEntries.map((e) =>
            e.id === id
              ? {
                  ...e,
                  start: newStart,
                  end: newEnd,
                  updatedAt: new Date().toISOString(),
                  updatedBy: get().currentUser?.username || 'Unknown',
                }
              : e
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    addWorkQueueItem: (itemData) => {
      const item: WorkQueueItem = {
        ...itemData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: get().currentUser?.username || 'Unknown',
        updatedBy: get().currentUser?.username || 'Unknown',
      };
      set((state) => {
        const newState = { ...state, workQueueItems: [...state.workQueueItems, item] };
        saveState(newState);
        return newState;
      });
      return item;
    },
    
    updateWorkQueueItem: (id, updates) => {
      set((state) => {
        const newState = {
          ...state,
          workQueueItems: state.workQueueItems.map((i) =>
            i.id === id
              ? {
                  ...i,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  updatedBy: get().currentUser?.username || 'Unknown',
                }
              : i
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    deleteWorkQueueItem: (id) => {
      set((state) => {
        const newState = {
          ...state,
          workQueueItems: state.workQueueItems.filter((i) => i.id !== id),
        };
        saveState(newState);
        return newState;
      });
    },
    
    setAvailability: (modelId, date, isAvailable, startTime, endTime) => {
      set((state) => {
        const existing = state.calendarAvailabilities.find(
          (a) => a.modelId === modelId && a.date === date
        );
        
        let newState;
        if (existing) {
          newState = {
            ...state,
            calendarAvailabilities: state.calendarAvailabilities.map((a) =>
              a.id === existing.id
                ? {
                    ...a,
                    isAvailable,
                    startTime,
                    endTime,
                    updatedAt: new Date().toISOString(),
                  }
                : a
            ),
          };
        } else {
          const availability: CalendarAvailability = {
            id: uuidv4(),
            modelId,
            date,
            isAvailable,
            startTime,
            endTime,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          newState = {
            ...state,
            calendarAvailabilities: [...state.calendarAvailabilities, availability],
          };
        }
        saveState(newState);
        return newState;
      });
    },
    
    getModelAvailability: (modelId, date) => {
      return get().calendarAvailabilities.find(
        (a) => a.modelId === modelId && a.date === date
      ) || null;
    },
    
    getAvailableModelsForDate: (date) => {
      const availabilities = get().calendarAvailabilities.filter(
        (a) => a.date === date && a.isAvailable
      );
      const availableModelIds = availabilities.map((a) => a.modelId);
      return get().models.filter((m) => availableModelIds.includes(m.id));
    },
    
    createBooking: (modelId, chatterId, date, time) => {
      const booking: Booking = {
        id: uuidv4(),
        modelId,
        chatterId,
        date,
        time,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        const newState = { ...state, bookings: [...state.bookings, booking] };
        saveState(newState);
        return newState;
      });
      return booking;
    },
    
    confirmBooking: (bookingId) => {
      set((state) => {
        const newState = {
          ...state,
          bookings: state.bookings.map((b) =>
            b.id === bookingId
              ? { ...b, status: 'confirmed' as const, confirmedAt: new Date().toISOString() }
              : b
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    cancelBooking: (bookingId) => {
      set((state) => {
        const newState = {
          ...state,
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    completeBooking: (bookingId) => {
      set((state) => {
        const newState = {
          ...state,
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'completed' as const } : b
          ),
        };
        saveState(newState);
        return newState;
      });
    },
    
    getModelBookings: (modelId) => {
      return get().bookings.filter((b) => b.modelId === modelId);
    },
    
    getChatterBookings: (chatterId) => {
      return get().bookings.filter((b) => b.chatterId === chatterId);
    },
    
    getModelStats: (modelId) => {
      const bookings = get().getModelBookings(modelId);
      const completed = bookings.filter((b) => b.status === 'completed');
      const pending = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
      
      // Assuming each booking is worth $50 (can be made configurable)
      const bookingValue = 50;
      const totalEarnings = completed.length * bookingValue;
      const averageBookingValue = completed.length > 0 ? totalEarnings / completed.length : 0;
      
      return {
        totalBookings: bookings.length,
        totalEarnings,
        completedBookings: completed.length,
        pendingBookings: pending.length,
        averageBookingValue,
      };
    },
    
    setSelectedDate: (date) => {
      set({ selectedDate: date });
    },
    
    initializeDummyData: () => {
      const state = get();
      if (state.models.length === 0) {
        // Create dummy models
        const dummyModels: Model[] = [
          { id: uuidv4(), username: 'Emma', isOnline: true, createdAt: new Date().toISOString() },
          { id: uuidv4(), username: 'Sophia', isOnline: false, createdAt: new Date().toISOString() },
          { id: uuidv4(), username: 'Olivia', isOnline: true, createdAt: new Date().toISOString() },
          { id: uuidv4(), username: 'Isabella', isOnline: true, createdAt: new Date().toISOString() },
          { id: uuidv4(), username: 'Ava', isOnline: false, createdAt: new Date().toISOString() },
        ];
        
        // Set some availability for today and next few days
        const today = new Date();
        const availabilities: CalendarAvailability[] = [];
        const bookings: Booking[] = [];
        
        dummyModels.forEach((model, modelIndex) => {
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            // Make models available on different days
            if ((modelIndex + i) % 2 === 0) {
              availabilities.push({
                id: uuidv4(),
                modelId: model.id,
                date: dateStr,
                isAvailable: true,
                startTime: '09:00',
                endTime: '17:00',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
            
            // Add some dummy bookings
            if (i < 3 && modelIndex < 2) {
              bookings.push({
                id: uuidv4(),
                modelId: model.id,
                chatterId: 'dummy-chatter',
                date: dateStr,
                time: `${9 + i}:00`,
                status: i === 0 ? 'confirmed' : i === 1 ? 'completed' : 'pending',
                createdAt: new Date().toISOString(),
                confirmedAt: i === 0 ? new Date().toISOString() : undefined,
              });
            }
          }
        });
        
        set((currentState) => {
          const newState = {
            ...currentState,
            models: [...currentState.models, ...dummyModels],
            calendarAvailabilities: [...currentState.calendarAvailabilities, ...availabilities],
            bookings: [...currentState.bookings, ...bookings],
          };
          saveState(newState);
          return newState;
        });
      }
    },
  };

  // Load initial state from localStorage
  const loaded = loadState();
  const finalState = { ...initialState, ...loaded };

  return finalState;
});
