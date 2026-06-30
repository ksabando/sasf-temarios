import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_TOKEN_KEY = 'sasf_auth_token';

const AuthContext = createContext({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      try {
        const { hash, exp } = JSON.parse(atob(token));
        if (Date.now() < exp) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setChecked(true);
  }, []);

  const login = useCallback((password) => {
    const storedHash = window.__AUTH_PASSWORD_HASH__;
    if (!storedHash) return false;

    sha256(password).then(hash => {
      if (hash === storedHash) {
        const exp = Date.now() + 24 * 60 * 60 * 1000;
        const token = btoa(JSON.stringify({ hash, exp }));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        setIsAuthenticated(true);
      }
    });

    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  if (!checked) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
