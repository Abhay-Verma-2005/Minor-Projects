import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaBuilding, FaCalendarAlt, FaTicketAlt } from "react-icons/fa";
import { registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import "./styles/log-sign.css";

const ROLES = [
  { value: "USER", label: "Ticket Buyer", desc: "Book and explore events", icon: <FaTicketAlt size={14} /> },
  { value: "ORGANISER", label: "Organiser", desc: "Create and manage events", icon: <FaCalendarAlt size={14} /> },
  { value: "PROVIDER", label: "Provider", desc: "List and manage venues", icon: <FaBuilding size={14} /> }
];

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userData = await registerUser(name, email, password, role);
      login(userData);
      navigate("/dashboard");
    } catch {
      setError("Unable to create account");
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

          <h2 className="title">Create your account</h2>
          <p className="subtitle">Get started in your Event Journey</p>

          {error && <p className="error-box">{error}</p>}

          <form onSubmit={handleSubmit} className="form">

            <Field  label="Full Name" type="text" value={name} onChange={setName} placeholder="Enter your name" />
            <Field  label="Email Address" type="email" value={email} onChange={setEmail} placeholder="Enter your email" />
            <Field  label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter password" />

            <div className="role-select">
              {ROLES.map(r => (
                <div
                  key={r.value}
                  className={`role-card ${role === r.value ? "active" : ""}`}
                  onClick={() => setRole(r.value)}
                >
                  <div className="role-icon">{r.icon}</div>
                  <div>
                    <p className="role-title">{r.label}</p>
                    <p className="role-desc">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="submit-btn">
              Create Account
              <FaArrowRight size={14} />
            </button>
          </form>

          <p className="bottom-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>

      <div className="right-panel">
        <div className="circle c1"></div>
        <div className="circle c2"></div>

        <div className="brand-content">
          <img src="/logo.png" alt="logo" />
          <h2>Join the Event Ecosystem</h2>
          <p>From venues to tickets — everything managed in one place.</p>

          <div className="features">
            {ROLES.map((r, i) => (
              <div key={i} className="feature">
                <span className="icon">{r.icon}</span>
                <span>{r.desc}</span>
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

export default SignupPage;