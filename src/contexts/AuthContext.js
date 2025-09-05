"use client"

// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user-token');

    try {
      if (storedUser && storedUser !== 'undefined') {
        // Decode the JWT to extract the payload
        const decodedUser = jwtDecode(storedUser);

        setUser(decodedUser);  // Set user state with decoded information
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('user-token');  // Optionally clear invalid token
    }
  }, []); // Empty dependency array means this effect runs once on mount

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
