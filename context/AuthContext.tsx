import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, AuthState } from '../types';
import { storageService } from '../services/storageService';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, question: string, answer: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const session = storageService.getSession();
    if (session) {
      setState({
        user: session.user,
        token: session.token,
        isAuthenticated: true,
      });
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    const user = storageService.findUserByEmail(email);
    if (user && user.passwordHash === pass) {
      const token = `mock-jwt-token-${Date.now()}`;
      const newState = { user, token, isAuthenticated: true };
      setState(newState);
      storageService.saveSession(user, token);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string, question: string, answer: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));
    
    if (storageService.findUserByEmail(email)) {
      return false; // User exists
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      passwordHash: pass,
      role: Role.USER,
      joinedAt: new Date().toISOString(),
      securityQuestion: question,
      securityAnswer: answer
    };

    storageService.saveUser(newUser);
    return login(email, pass);
  };

  const logout = () => {
    storageService.clearSession();
    setState({ user: null, token: null, isAuthenticated: false });
  };

  const updateProfile = (updatedUser: User) => {
    storageService.updateUser(updatedUser);
    // Update local state if it's the current user
    if (state.user && state.user.id === updatedUser.id) {
       const newState = { ...state, user: updatedUser };
       setState(newState);
       if (state.token) storageService.saveSession(updatedUser, state.token);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};