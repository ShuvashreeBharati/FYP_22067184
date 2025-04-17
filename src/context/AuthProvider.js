import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Token validation (unchanged to match Auth_JWT_Decoder behavior)
  const validateToken = useCallback((token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return !(decoded.exp && Date.now() >= decoded.exp * 1000);
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  }, []);

  // Initialize auth state (unchanged)
  useEffect(() => {
    const tokenName = process.env.REACT_APP_TOKEN_NAME || 'authToken';
    const storedToken = localStorage.getItem(tokenName);
    const storedUser = localStorage.getItem('userData');

    if (storedToken && validateToken(storedToken)) {
      setAuth({
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null
      });
    }
    setIsInitialized(true);
  }, [validateToken]);

  // Login function (only critical change - ensures userId exists)
  const login = (userData, token) => {
    const tokenName = process.env.REACT_APP_TOKEN_NAME || 'authToken';
    
    // Ensure userData contains userId (matches Auth_JWT_Decoder expectations)
    if (!userData.userId) {
      console.error("User data must contain userId");
      return;
    }

    localStorage.setItem(tokenName, token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setAuth({ token, user: userData });
  };

  // Logout (unchanged)
  const logout = () => {
    const tokenName = process.env.REACT_APP_TOKEN_NAME || 'authToken';
    localStorage.removeItem(tokenName);
    localStorage.removeItem('userData');
    setAuth(null);
  };

  // Authentication check (unchanged)
  const isAuthenticated = () => {
    return auth?.token && validateToken(auth.token);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        auth, 
        login, 
        logout, 
        isAuthenticated, 
        isInitialized 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};