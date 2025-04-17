import { jwtDecode } from 'jwt-decode'; // Correct named import

export const getUserIdFromToken = () => {
  try {
    const tokenName = process.env.REACT_APP_TOKEN_NAME || 'authToken';
    const token = localStorage.getItem(tokenName);
    
    if (!token) {
      console.warn('No token found in localStorage');
      return null;
    }

    const decoded = jwtDecode(token);
    
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn('Token expired');
      return null;
    }

    return (
      decoded?.userId || // Matches what your server.js uses
      decoded?.user_id ||
      decoded?.id || 
      decoded?.sub ||
      decoded?.user?.id ||
      null
    );
  } catch (error) {
    console.error("Token decoding failed:", error);
    localStorage.removeItem(process.env.REACT_APP_TOKEN_NAME);
    return null;
  }
};

export const isTokenValid = () => {
  return !!getUserIdFromToken();
};