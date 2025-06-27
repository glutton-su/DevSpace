/* prettier-ignore-file */
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext
} from 'react';
import jwtDecode from 'jwt-decode';
import api from '../services/api'; // axios instance with refresh logic

const STORAGE_KEY = 'devspace_access';
export const AuthContext = createContext(null);

/**
 * AuthProvider
 * ------------
 * Wrap your <App/> with this provider to expose
 * { user, token, login, logout, refresh } to the tree.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Helpers ------------------------------------------------------------- */

  const decode = (jwt) => {
    try {
      return jwtDecode(jwt);
    } catch {
      return null;
    }
  };

  const persist = (jwt) => {
    localStorage.setItem(STORAGE_KEY, jwt);
    setToken(jwt);
    setUser(decode(jwt));
  };

  /* Public API ---------------------------------------------------------- */

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.accessToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  };

  const refresh = useCallback(async () => {
    const { data } = await api.post('/auth/refresh');
    persist(data.accessToken);
  }, []);

  /* Bootstrap session on first mount ----------------------------------- */

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const claims = decode(stored);
      if (claims && claims.exp * 1000 > Date.now()) {
        setToken(stored);
        setUser(claims);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  /* Silent refresh timer (optional) ------------------------------------ */

  useEffect(() => {
    if (!token) return;
    const { exp } = decode(token);
    const ttl = exp * 1000 - Date.now() - 60_000; // 1 min before expiry
    if (ttl <= 0) return refresh();
    const id = setTimeout(refresh, ttl);
    return () => clearTimeout(id);
  }, [token, refresh]);

  /* Context value ------------------------------------------------------- */

  const value = {
    user,
    token,
    isAuthReady: !loading,
    login,
    logout,
    refresh
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/* Hook wrapper so callers import one thing ----------------------------- */

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;