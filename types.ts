export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Simulated hash
  role: Role;
  name: string;
  joinedAt: string;
  securityQuestion?: string;
  securityAnswer?: string;
  avatarUrl?: string;
}

export enum ModelType {
  DEEPSEEK = 'deepseek-coder-1.3b-instruct',
  GEMMA = 'gemma-2b',
  CODEBERT = 'codebert-base',
  GEMINI_FLASH = 'gemini-2.5-flash' // Our actual engine
}

export enum Language {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  SQL = 'sql',
}

export interface Feedback {
  rating: number; // 1-5
  comment: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  type: 'generation' | 'explanation';
  timestamp: string;
  model: ModelType;
  language: Language;
  input: string;
  output: string;
  feedback?: Feedback;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}