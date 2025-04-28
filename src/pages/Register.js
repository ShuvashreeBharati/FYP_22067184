import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios_frontend";

const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Register = () => {
  const nameRef = useRef();
  const errRef = useRef();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    nameRef.current.focus();
  }, []);

  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [name, email, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Final validation check
    if (!validName || !validEmail || !validPwd || !validMatch) {
      setErrMsg("Invalid Entry");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        "/auth/register",
        JSON.stringify({ name, email, password: pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true
        }
      );

      if (response.data?.user) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        throw new Error("Registration failed - no user data received");
      }
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg(err.response.data?.error || "Invalid input format");
      } else if (err.response?.status === 409) {
        setErrMsg(err.response.data?.error || "Email already registered");
      } else {
        setErrMsg(err.response?.data?.error || "Registration Failed");
      }
      errRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">
          Full Name:
          <FontAwesomeIcon icon={validName ? faCheck : faTimes} className={validName ? "valid" : "hide"} />
        </label>
        <input
          type="text"
          id="name"
          ref={nameRef}
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
          aria-invalid={!validName}
          aria-describedby="namenote"
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
        />
        <p id="namenote" className={nameFocus && !validName ? "instructions" : "offscreen"}>
          <FontAwesomeIcon icon={faInfoCircle} />
          2-24 characters. Letters only.
        </p>

        <label htmlFor="email">
          Email:
          <FontAwesomeIcon icon={validEmail ? faCheck : faTimes} className={validEmail ? "valid" : "hide"} />
        </label>
        <input
          type="email"
          id="email"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          aria-invalid={!validEmail}
          aria-describedby="emailnote"
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setEmailFocus(false)}
        />
        <p id="emailnote" className={emailFocus && !validEmail ? "instructions" : "offscreen"}>
          <FontAwesomeIcon icon={faInfoCircle} />
          Must be a valid email address.
        </p>

        <label htmlFor="password">
          Password:
          <FontAwesomeIcon icon={validPwd ? faCheck : faTimes} className={validPwd ? "valid" : "hide"} />
        </label>
        <input
          type="password"
          id="password"
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
          required
          aria-invalid={!validPwd}
          aria-describedby="pwdnote"
          onFocus={() => setPwdFocus(true)}
          onBlur={() => setPwdFocus(false)}
        />
        <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
          <FontAwesomeIcon icon={faInfoCircle} />
          8-24 characters. Must include uppercase, lowercase, number, and special character.
        </p>

        <label htmlFor="confirm_pwd">
          Confirm Password:
          <FontAwesomeIcon icon={validMatch && matchPwd ? faCheck : faTimes} className={validMatch && matchPwd ? "valid" : "hide"} />
        </label>
        <input
          type="password"
          id="confirm_pwd"
          onChange={(e) => setMatchPwd(e.target.value)}
          value={matchPwd}
          required
          aria-invalid={!validMatch}
          aria-describedby="confirmnote"
          onFocus={() => setMatchFocus(true)}
          onBlur={() => setMatchFocus(false)}
        />
        <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
          <FontAwesomeIcon icon={faInfoCircle} />
          Must match the first password input.
        </p>

        <button disabled={loading || !validName || !validEmail || !validPwd || !validMatch}>
          {loading ? "Loading..." : "Register"}
        </button>
      </form>
      <p>
        Already registered? <Link to="/login">Sign In</Link>
      </p>
    </section>
  );
};

export default Register;