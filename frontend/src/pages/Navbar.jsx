import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaChevronDown, FaHome, FaCalendarAlt, FaTachometerAlt, FaSignOutAlt, FaBell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from "../api/notifications";
import "./styles/navbar.css";

const Navbar = ({ lightLogo = false }) => {
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user;
  const logout = auth.logout;

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate("/events?search=" + encodeURIComponent(query.trim()));
    } else {
      navigate("/events");
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };


  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCount = async () => {
      try {
        const { count } = await getUnreadCount();
        setUnreadCount(count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const openBell = async () => {
    setBellOpen(prev => !prev);
    setProfileOpen(false);
    if (!bellOpen) {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      try {
        await markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {}
    }
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  let name = "";
  let email = "";
  let role = "";

  if (user && user.user) {
    name = user.user.name;
    email = user.user.email;
    role = user.user.role;
  }

  const fmtTime = (d) => {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60)   return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const currentPath = location.pathname;

  return (
    <>
      <nav className="navbar">

        <div className="logo-container">
          <Link to="/" className="logo-link">
            <img src={lightLogo ? "/light-logo.png" : "/logo.png"} className="logo-img" />
            <span className="logo-text">EvenTick</span>
          </Link>
        </div>

        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${currentPath === "/" ? "active" : ""}`}>
              <FaHome /> Home
            </Link>
          </li>
          <li>
            <Link to="/events" className={`nav-link ${currentPath.startsWith("/events") ? "active" : ""}`}>
              <FaCalendarAlt /> Events
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link to="/dashboard" className={`nav-link ${currentPath.startsWith("/dashboard") ? "active" : ""}`}>
                <FaTachometerAlt /> Dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-search-wrapper">
          <FaSearch className="nav-search-icon" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, cities..."
            className="nav-search-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>

        {!isAuthenticated && (
          <div className="auth-buttons">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="nav-right-group">

            <div className="notif-wrapper" ref={bellRef}>
              <button className="notif-btn" onClick={openBell} id="notification-bell">
                <FaBell size={15} />
                <span className="notif-btn-text">Notifications</span>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </button>

              {bellOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-head">
                    <span className="notif-dropdown-title">Notifications</span>
                    {unreadCount > 0 && (
                      <button className="notif-mark-all" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 20).map(n => (
                        <div
                          key={n._id}
                          className={`notif-item ${n.read ? "" : "notif-unread"}`}
                          onClick={() => handleNotifClick(n)}
                        >
                          <div className="notif-dot-col">
                            {!n.read && <span className="notif-dot" />}
                          </div>
                          <div className="notif-content">
                            <p className="notif-msg">{n.message}</p>
                            <span className="notif-time">{fmtTime(n.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>


            <div className="profile-wrapper" ref={dropdownRef}>
              <button
                className="profile-btn"
                onClick={() => { setProfileOpen(!profileOpen); setBellOpen(false); }}
              >
                <img
                  src={"https://ui-avatars.com/api/?name=" + name}
                  className="avatar"
                />
                <span>{name}</span>
                <FaChevronDown />
              </button>

              {profileOpen && (
                <div className="dropdown">
                  <h1>{name}</h1>
                  <p>{email}</p>
                  <div className="dropdown-separator"></div>

                  <button onClick={() => navigate("/dashboard")}>
                    <FaHome /> Dashboard
                  </button>

                  <button onClick={() => navigate("/events")}>
                    <FaCalendarAlt />  Events
                  </button>

                  <button className="log-out" onClick={handleLogout}>
                    <FaSignOutAlt />Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="mobile-bottom-nav">
        <Link to="/" className={`mobile-nav-item ${currentPath === "/" ? "active" : ""}`}>
          <FaHome />
          <span>Home</span>
        </Link>
        <Link to="/events" className={`mobile-nav-item ${currentPath.startsWith("/events") ? "active" : ""}`}>
          <FaCalendarAlt />
          <span>Events</span>
        </Link>
        {isAuthenticated ? (
          <Link to="/dashboard" className={`mobile-nav-item ${currentPath.startsWith("/dashboard") ? "active" : ""}`}>
            <FaTachometerAlt />
            <span>Dash</span>
          </Link>
        ) : (
          <Link to="/login" className={`mobile-nav-item ${currentPath === "/login" ? "active" : ""}`}>
            <FaSignOutAlt style={{ transform: "rotate(180deg)" }} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </>
  );
};

export default Navbar;