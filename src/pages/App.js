import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthProvider';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Profile from './Profile';
import Form from './Form';
import ContactUs from './ContactUs';
import UserHistory from './UserHistory';
// import AboutUs from './AboutUs';

// Protected Route Component
const RequireAuth = ({ children }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/form"
            element={
              <RequireAuth>
                <Form />
              </RequireAuth>
            }
          />
          
          {/* User History Route (full history) */}
          <Route
            path="/history" 
            element={
              <RequireAuth>
                <UserHistory />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
