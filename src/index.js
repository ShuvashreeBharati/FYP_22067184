import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Make sure index.css is in the src folder
import App from './pages/App.js'; // App component in the pages folder
import { AuthProvider } from './context/AuthProvider.js'; // AuthProvider in the context folder

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
