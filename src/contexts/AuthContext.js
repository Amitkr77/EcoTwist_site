"use client"

// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user-token');

    try {
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('user-token'); 
    }
  }, []);

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
