import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthProvider";  // Corrected path for AuthProvider
import Home from "./Home";  // Home is in the same 'pages' folder
import Login from "./Login";  // Login is in the same 'pages' folder
import Register from "./Register";  // Register is in the same 'pages' folder
import ContactUs from "./ContactUs";  // ContactUs is in the same 'pages' folder
import Form from "./Form";  // Form is in the same 'pages' folder

function App() {
  return (
    <AuthProvider>  {/* AuthProvider wraps the entire app to provide context */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/form" element={<Form />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
