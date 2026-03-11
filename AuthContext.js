// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setToken, clearToken, getToken } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta auto-login com token salvo
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const me = await authAPI.me();
          setUser(me);
        }
      } catch (e) {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const data = await authAPI.login(email, password);
    await setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function signup(name, username, email, password) {
    const data = await authAPI.signup(name, username, email, password);
    await setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
