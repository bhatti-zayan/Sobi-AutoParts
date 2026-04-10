import { createContext, useContext, useReducer, useCallback } from 'react';
import { demoUsers } from '../data/mockData';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { user: null, isAuthenticated: false };
    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((email, password) => {
    const user = Object.values(demoUsers).find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      const { password: _, ...safeUser } = user;
      dispatch({ type: 'LOGIN', payload: safeUser });
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const demoLogin = useCallback((role) => {
    const user = demoUsers[role];
    if (user) {
      const { password: _, ...safeUser } = user;
      dispatch({ type: 'LOGIN', payload: safeUser });
      return safeUser;
    }
  }, []);

  const register = useCallback((name, email, password, role) => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    const newUser = {
      id: 'u' + Date.now(),
      name,
      email,
      role,
      initials,
    };
    dispatch({ type: 'LOGIN', payload: newUser });
    return { success: true, user: newUser };
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
