import { useState, useEffect } from "react";
import { getMyTickets, cancelTicket } from "../../api/bookings";
import {
  FaTicketAlt, FaCalendarAlt, FaTimesCircle,
  FaHourglassEnd, FaCheckCircle, FaBan, FaSyncAlt
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import TicketLayout from "./TicketLayout";

const TABS = [
  { key: "active", label: "Active Booking", icon: <FaCheckCircle size={13} /> },
  { key: "cancelled", label: "Cancelled", icon: <FaBan size={13} /> },
  { key: "expired", label: "Expired", icon: <FaHourglassEnd size={13} /> },
];

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="stat-card">
    <div className="stat-card-icon"><Icon size={18} color="#7c3aed" /></div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const UserDashboard = ({ activeView, setActiveView }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      if (Array.isArray(data)) setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleCancel = async (id) => {
    try {
      await cancelTicket(id);
      setCancelTarget(null);
      setTickets(prev => prev.map(t => t._id === id ? { ...t, status: 'cancelled', cancelled: true, cancelledAt: new Date().toISOString(), canCancel: false, refundStatus: 'pending' } : t));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel ticket");
    }
  };

  const activeTickets = tickets.filter(t => t.status === "active");
  const cancelledTickets = tickets.filter(t => t.status === "cancelled");
  const expiredTickets = tickets.filter(t => t.status === "expired");

  const counts = {
    active: activeTickets.length,
    cancelled: cancelledTickets.length,
    expired: expiredTickets.length
  };

  const filteredTickets = { active: activeTickets, cancelled: cancelledTickets, expired: expiredTickets }[activeView] || [];

  return (
    <div>
      <div className="stats-row ud-stats-row">
        <StatCard icon={FaTicketAlt} value={tickets.length} label="Total Bookings" />
        <StatCard icon={FaCalendarAlt} value={counts.active} label="Active" />
        <StatCard icon={FaTimesCircle} value={counts.cancelled} label="Cancelled" />
        <StatCard icon={FaHourglassEnd} value={counts.expired} label="Expired" />
      </div>

      <div className="ud-tab-wrap">
        <div className="ticket-tab-bar ud-tab-bar">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`ticket-tab-btn ${activeView === tab.key ? "ticket-tab-active" : ""}`}
              onClick={() => setActiveView(tab.key)}
              id={`tab-${tab.key}`}
            >
              {tab.icon}
              {tab.label}
              <span className="ticket-tab-count">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        <button 
          className={`refresh-icon-btn ${refreshing ? 'spinning' : ''}`} 
          onClick={handleRefresh}
          title="Refresh Bookings"
        >
          <FaSyncAlt size={16} />
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner"></div>
          Loading your tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon-color">
            {activeView === "active" && <FaTicketAlt size={32} />}
            {activeView === "cancelled" && <FaBan size={32} />}
            {activeView === "expired" && <FaHourglassEnd size={32} />}
          </div>
          <h3>
            {activeView === "active" && "No Active Bookings"}
            {activeView === "cancelled" && "No Cancelled Bookings"}
            {activeView === "expired" && "No Expired Bookings"}
          </h3>
          <p>
            {activeView === "active" && "Book tickets to upcoming events to see them here."}
            {activeView === "cancelled" && "You haven't cancelled any tickets."}
            {activeView === "expired" && "No expired tickets yet — events you've attended will show here."}
          </p>
        </div>
      ) : (
        <div className="cards-list">
          {filteredTickets.map(t => (
            <TicketLayout
              key={t._id}
              ticket={t}
              onCancel={handleCancel}
              cancelTarget={cancelTarget}
              setCancelTarget={setCancelTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;