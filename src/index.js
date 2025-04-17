import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css'; 
import App from './pages/App.js'; 
import { AuthProvider } from './context/AuthProvider.js'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
