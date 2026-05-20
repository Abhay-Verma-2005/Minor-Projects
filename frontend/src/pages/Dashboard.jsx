import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import ProviderDashboard from "./components/ProviderDashboard";
import OrganiserDashboard from "./components/OrganiserDashboard";
import UserDashboard from "./components/UserDashboard";
import FeedbackModal from "./components/FeedbackModal";
import "./styles/dash.css";
import {
  FaTicketAlt, FaMapMarkerAlt, FaCalendarAlt,
  FaUserCircle, FaHome, FaChartBar, FaBuilding, FaPlus, FaCommentAlt,
  FaBars, FaTimes
} from "react-icons/fa";
import { useState } from "react";

const ROLE_CONFIG = {
  PROVIDER: {
    label: "Venue Provider",
    icon: <FaMapMarkerAlt size={14} />,
    navItems: [
      { id: "dashboard", icon: <FaChartBar size={15} />, label: "Dashboard" },
      { id: "list", icon: <FaBuilding size={15} />, label: "My Venues" },
      { id: "add", icon: <FaPlus size={15} />, label: "Register Venue" },
    ],
    welcomeText: "venues",
  },
  ORGANISER: {
    label: "Event Organiser",
    icon: <FaCalendarAlt size={14} />,
    navItems: [
      { id: "dashboard", icon: <FaChartBar size={15} />, label: "Dashboard" },
      { id: "events", icon: <FaCalendarAlt size={15} />, label: "My Events" },
      { id: "discover", icon: <FaMapMarkerAlt size={15} />, label: "Discover Venues" },
    ],
    welcomeText: "events",
  },
  USER: {
    label: "Ticket Buyer",
    icon: <FaTicketAlt size={14} />,
    navItems: [
      { id: "active", icon: <FaChartBar size={15} />, label: "Active Tickets" },
      { id: "cancelled", icon: <FaTicketAlt size={15} />, label: "Cancelled Tickets" },
      { id: "events", icon: <FaCalendarAlt size={15} />, label: "Browse Events", link: "/events" },
    ],
    welcomeText: "tickets",
  },
};

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.user?.role || "USER";
  const [activeView, setActiveView] = useState(role === "USER" ? "active" : "dashboard");
  const [showFeedback, setShowFeedback] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
  const userName = user?.user?.name || "User";

  return (
    <div className="light-page">
      <Navbar lightLogo />

      <div className="dashboard-layout">
        
        {/* Mobile Header with Hamburger Toggle */}
        <div className="db-mobile-header">
          <button className="db-menu-toggle" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <span className="db-mobile-title">
            {cfg.navItems.find(item => item.id === activeView)?.label || "Dashboard"}
          </span>
          <div className="db-mobile-right">
            <span className="db-mobile-role">{cfg.label}</span>
          </div>
        </div>

        {/* Sidebar backdrop overlay */}
        <div 
          className={`db-sidebar-overlay ${sidebarOpen ? "show" : ""}`} 
          onClick={() => setSidebarOpen(false)} 
        />

        <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-top">
            <div className="db-sidebar-mobile-hdr">
              <span className="db-sidebar-mobile-lbl">Navigation Menu</span>
              <button className="db-sidebar-close" onClick={() => setSidebarOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=7c3aed&color=fff&bold=true`}
              alt="avatar"
              className="avatar-dash"
            />
            <p className="user-name">{userName}</p>
            <p className="user-email">{user?.user?.email}</p>
            <span className="role-badge">{cfg.icon} {cfg.label}</span>
          </div>

          <div className="sidebar-nav">
            <p className="sidebar-label">Navigation</p>
            {cfg.navItems.map((item, i) => (
              <div 
                key={i} 
                className={`sidebar-item ${activeView === item.id ? "active" : ""}`}
                onClick={() => {
                  if (item.link) {
                    navigate(item.link);
                  } else {
                    setActiveView(item.id);
                  }
                  setSidebarOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}

            <p className="sidebar-label">Quick Links</p>
            <Link 
              to="/events" 
              className="sidebar-item db-link-plain" 
              onClick={() => setSidebarOpen(false)}
            >
              <FaHome size={15} />
              <span>Browse Events</span>
            </Link>
            <div 
              className="sidebar-item" 
              onClick={() => { 
                setShowFeedback(true); 
                setSidebarOpen(false); 
              }}
            >
              <FaCommentAlt size={15} />
              <span>Feedback</span>
            </div>
          </div>

          <div className="sidebar-support">
            <strong className="db-dev-title">About Developer</strong>
            <p className="db-dev-text">
              This project is made by Abhay Verma<br />
              B.Tech CSE 3rd year<br />
              GLA University Mathura
            </p>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="welcome-banner">
            <div className="welcome-banner-content">
              <p className="welcome-greeting">Welcome back,</p>
              <h1 className="welcome-name">{userName} <span>👋</span></h1>
              <p className="welcome-subtitle">Here's an overview of your {cfg.welcomeText}. Stay on top of everything.</p>
            </div>
            <div className="welcome-banner-role">
              <span className="welcome-role-tag">{cfg.icon} {cfg.label}</span>
            </div>
          </div>

          {role === "PROVIDER" && <ProviderDashboard activeView={activeView} setActiveView={setActiveView} />}
          {role === "ORGANISER" && <OrganiserDashboard activeView={activeView} setActiveView={setActiveView} />}
          {role === "USER" && <UserDashboard activeView={activeView} setActiveView={setActiveView} />}

          {showFeedback && (
            <FeedbackModal
              userName={userName}
              userEmail={user?.user?.email}
              onClose={() => setShowFeedback(false)}
              onLogout={logout}
            />
          )}
        </main>

      </div>
    </div>
  );
};

export default Dashboard;