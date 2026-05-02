import { createContext, useContext, useReducer, useCallback } from 'react';
import { demoUsers } from '../data/mockData';

const AuthContext = createContext(null);
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return { user: action.payload.user, token: action.payload.token, isAuthenticated: true };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { user: null, token: null, isAuthenticated: false };
    case 'UPDATE_PROFILE': {
      const updatedUser = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { ...state, user: updatedUser };
    }
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
        return { success: true, user: data.user };
      }
      return { success: false, error: data.message || 'Invalid credentials' };
    } catch (err) {
      return { success: false, error: 'Network error. Backend might be down.' };
    }
  }, []);

  const demoLogin = useCallback((role) => {
    const user = demoUsers[role];
    if (user) {
      const { password: _, ...safeUser } = user;
      dispatch({ type: 'LOGIN', payload: safeUser });
      return safeUser;
    }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
        return { success: true, user: data.user };
      }
      return { success: false, error: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, error: 'Network error. Backend might be down.' };
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateProfile = useCallback((updates) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
