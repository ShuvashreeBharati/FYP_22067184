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
      const response = await api.post("/auth/login", { 
        email, 
        password: pwd 
      });

      const { token, user } = response.data;

      if (!token || !user?.userId) {
        throw new Error("Invalid server response");
      }

      // Save user_id into localStorage for Home.js feedback form
      localStorage.setItem('user_id', user.userId);

      // Update auth context
      login(user, token);

      setEmail("");
      setPwd("");

      navigate(symptoms ? "/form" : from, { 
        state: symptoms ? { symptoms } : null,
        replace: true 
      });

    } catch (err) {
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
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>

      <h1>Sign In</h1>

      {location.state?.from?.pathname === "/form" && (
        <p className="login-notice">
          Please login to save your diagnosis history.
        </p>
      )}

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
