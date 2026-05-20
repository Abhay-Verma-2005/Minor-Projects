import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaBuilding, FaCalendarAlt, FaQrcode } from "react-icons/fa";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import "./styles/log-sign.css";

const FEATURES = [
  { icon: <FaBuilding size={16} />, text: "Venue Providers list spaces with full details" },
  { icon: <FaCalendarAlt size={16} />, text: "Organisers create and publish events instantly" },
  { icon: <FaQrcode size={16} />, text: "Users book tickets and get QR codes instantly" },
];

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userData = await loginUser(email, password);
      login(userData);
      navigate("/dashboard");
    } catch {
      setError("Your credentials are incorrect");
    }
  };

  return (
    <div className="login-container">
      <div className="left-panel">
        <div className="form-wrapper">
          <Link to="/" className="logo">
            <img src="/light-logo.png" alt="EvenTick" />
            <span>EvenTick</span>
          </Link>

          <h2 className="title">Welcome back</h2>
          <p className="subtitle">Sign in to your account</p>

          {error && <p className="error-box">{error}</p>}

          <form onSubmit={handleSubmit} className="form">
            <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="Enter email" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter password" />

            <button type="submit" className="submit-btn">
              Sign In
              <FaArrowRight size={14} />
            </button>
          </form>

          <p className="bottom-text">
            Don&apos;t have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>

      <div className="right-panel">
        <div className="circle c1"></div>
        <div className="circle c2"></div>

        <div className="brand-content">
          <img src="/logo.png" alt="logo" />
          <h2>Your Events,<br />All in One Place</h2>
          <p>Manage events, bookings, and tickets easily.</p>

          <div className="features">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature">
                <span className="icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, type, value, onChange, placeholder }) => (
  <div className="field">
    <label>{label}</label>
    <div className="input-box">
      <input type={type} required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  </div>
);

export default LoginPage;