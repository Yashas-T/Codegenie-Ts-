import { User, Role, HistoryItem, Feedback } from '../types';

const USERS_KEY = 'codegenie_users';
const HISTORY_KEY = 'codegenie_history';
const CURRENT_USER_KEY = 'codegenie_current_user';

// Initialize with a default admin if empty
const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@codegenie.com',
      passwordHash: 'admin123', // In real app, bcrypt
      role: Role.ADMIN,
      name: 'System Admin',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([adminUser]));
  }
  if (!localStorage.getItem(HISTORY_KEY)) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
  }
};

initStorage();

export const storageService = {
  getUsers: (): User[] => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  saveUser: (user: User) => {
    const users = storageService.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser: (updatedUser: User) => {
    const users = storageService.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  deleteUser: (userId: string) => {
    const users = storageService.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  findUserByEmail: (email: string): User | undefined => {
    return storageService.getUsers().find(u => u.email === email);
  },

  getHistory: (): HistoryItem[] => {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  },

  addHistoryItem: (item: HistoryItem) => {
    const history = storageService.getHistory();
    history.unshift(item); // Newest first
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  addFeedback: (historyId: string, feedback: Feedback) => {
    const history = storageService.getHistory();
    const index = history.findIndex(h => h.id === historyId);
    if (index !== -1) {
      history[index].feedback = feedback;
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  },

  // Mock Session Persistence
  saveSession: (user: User, token: string) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ user, token }));
  },

  getSession: () => {
    const session = localStorage.getItem(CURRENT_USER_KEY);
    return session ? JSON.parse(session) : null;
  },

  clearSession: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
