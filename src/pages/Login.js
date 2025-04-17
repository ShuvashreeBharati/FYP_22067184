import { useRef, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import api from "../api/axios_frontend";

const Login = () => {
  const { login } = useAuth();
  const emailRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || "/profile";
  const symptoms = location.state?.symptoms || null;

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrMsg("");

    try {
      // 1. Make login request
      const response = await api.post("/auth/login", { 
        email, 
        password: pwd 
      });

      // 2. Handle response (matches authController.js output)
      const { token, user } = response.data;
      
      if (!token || !user?.userId) {
        throw new Error("Invalid server response");
      }

      // 3. Update auth state (matches AuthProvider expectations)
      login(user, token);
      
      // 4. Clear form
      setEmail("");
      setPwd("");

      // 5. Redirect (preserves symptom data if coming from form)
      navigate(symptoms ? "/form" : from, { 
        state: symptoms ? { symptoms } : null,
        replace: true 
      });

    } catch (err) {
      // Enhanced error handling
      if (!err.response) {
        setErrMsg("Server not responding");
      } else {
        setErrMsg(
          err.response.data?.error || 
          err.message || 
          "Login failed. Please try again."
        );
      }
      errRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login-section">
      {/* Error message display */}
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>

      <h1>Sign In</h1>
      
      {/* Contextual notice for form redirects */}
      {location.state?.from?.pathname === "/form" && (
        <p className="login-notice">
          Please login to save your diagnosis history.
        </p>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          ref={emailRef}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          autoComplete="current-password"
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
          required
        />

        <button disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Registration link */}
      <p>
        Need an Account?<br />
        <span className="line">
          <Link to="/register">Sign Up</Link>
        </span>
      </p>
    </section>
  );
};

export default Login;