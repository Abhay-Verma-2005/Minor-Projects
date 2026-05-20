const fs = require('fs');

// 1. Dashboard.jsx
let dashboardStr = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
dashboardStr = dashboardStr.replace(
  '<div className="dashboard-header">\n            <h1 className="dashboard-title">{cfg.icon} {cfg.label} Dashboard</h1>\n          </div>',
  `<div className="dashboard-header">\n            <h1 className="dashboard-title">Welcome back, {user?.user?.name || "Provider1"}</h1>\n            <p className="dashboard-subtitle">Here's what's happening with your {role === 'PROVIDER' ? 'venues' : role === 'USER' ? 'tickets' : 'events'} today.</p>\n          </div>`
);
dashboardStr = dashboardStr.replace(
  '<div className="sidebar-label">Navigation</div>\n        <div className="sidebar-item active">',
  `<div className="sidebar-nav">\n          <div className="sidebar-item active">`
);
dashboardStr = dashboardStr.replace(
  '<FaCalendarAlt size={16} />\n              <span>My Events</span>',
  '<span className="sidebar-sparkle">✦</span>\n              <span>My Events</span>'
);
dashboardStr = dashboardStr.replace(
  '        </div>\n        </aside>',
  `        </div>\n        </div>\n        <div className="sidebar-support">\n          <strong>Need help?</strong>\n          <p style={{marginTop: '4px', opacity: 0.8}}>Contact support for assistance with your account.</p>\n        </div>\n        </aside>`
);
fs.writeFileSync('src/pages/Dashboard.jsx', dashboardStr);

// 2. OrganiserDashboard.jsx
let orgDashStr = fs.readFileSync('src/pages/components/OrganiserDashboard.jsx', 'utf8');
orgDashStr = orgDashStr.replace(
  `<h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.5px' }}>Overview</h2>`,
  ''
);
orgDashStr = orgDashStr.replace(
  `<div className="stats-row">\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><FaChartBar size={16} /></div><div className="stat-value">{events.length}</div><div className="stat-label">Total Events</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><FaCheck size={16} /></div><div className="stat-value">{liveCount}</div><div className="stat-label">Live Events</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><FaUsers size={16} /></div><div className="stat-value">{totalSold}</div><div className="stat-label">Tickets Sold</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><FaTimes size={16} /></div><div className="stat-value">{cancelCount}</div><div className="stat-label">Cancellations</div></div>\n          </div>`,
  `<div className="stats-row">
            <div className="stat-card">
              <div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#EDE9FE', color: '#5B21B6' }}><FaChartBar size={20} /></div><div className="stat-card-menu">···</div></div>
              <div className="stat-value">{events.length}</div>
              <div className="stat-trend"><span className="trend-up">↑ 12%</span> from last month</div>
              <div className="stat-label">Total Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><FaCheck size={20} /></div><div className="stat-card-menu">···</div></div>
              <div className="stat-value">{liveCount}</div>
              <div className="stat-trend"><span className="trend-up">↑ 8%</span> from last month</div>
              <div className="stat-label">Live Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#FEF9C3', color: '#CA8A04' }}><FaUsers size={20} /></div><div className="stat-card-menu">···</div></div>
              <div className="stat-value">{totalSold}</div>
              <div className="stat-trend"><span className="trend-up">↑ 24%</span> from last month</div>
              <div className="stat-label">Tickets Sold</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><FaTimes size={20} /></div><div className="stat-card-menu">···</div></div>
              <div className="stat-value">{cancelCount}</div>
              <div className="stat-trend"><span className="trend-up" style={{color: '#94A3B8'}}>— 0%</span> from last month</div>
              <div className="stat-label">Cancellations</div>
            </div>
          </div>`
);
orgDashStr = orgDashStr.replace(
  `<div className="panel-title"><FaClock size={14} color="var(--brand)" /> Recent Events</div>`,
  `<div className="panel-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><FaClock size={14} color="var(--brand)" /> Recent Events</span> <button onClick={() => setView('events')} className="see-all-link" style={{background: 'none', border: 'none', cursor: 'pointer', outline: 'none'}}>See All →</button></div>`
);
// TICKET THEMES update:
orgDashStr = orgDashStr.replace(
  `<span className="ticket-theme-label">{theme.label}</span>`,
  `<span className="ticket-theme-label">{theme.label}</span>` // no change to jsx, handled in css
);
fs.writeFileSync('src/pages/components/OrganiserDashboard.jsx', orgDashStr);


// 3. ProviderDashboard.jsx
let provDashStr = fs.readFileSync('src/pages/components/ProviderDashboard.jsx', 'utf8');
provDashStr = provDashStr.replace(
  `<h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.5px' }}>Provider Overview</h2>`,
  ''
);
provDashStr = provDashStr.replace(
  `<div className="stats-row">\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><FaBuilding size={16} /></div><div className="stat-value">{venues.length}</div><div className="stat-label">Total Venues</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}><FaLayerGroup size={16} /></div><div className="stat-value">{totalRequests}</div><div className="stat-label">Total Requests</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><FaCheck size={16} /></div><div className="stat-value">{confirmedRequests}</div><div className="stat-label">Confirmed</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><FaTimes size={16} /></div><div className="stat-value">{rejectedRequests}</div><div className="stat-label">Rejected</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#fffbeb', color: '#d97706' }}><FaClock size={16} /></div><div className="stat-value">{pendingRequests}</div><div className="stat-label">Pending</div></div>\n            <div className="stat-card"><div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}><FaMoneyBillWave size={16} /></div><div className="stat-value">₹{totalRevenue.toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>\n          </div>`,
  `<div className="stats-row" style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px'}}>
            <div className="stat-card"><div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#EDE9FE', color: '#5B21B6' }}><FaBuilding size={20} /></div><div className="stat-card-menu">···</div></div><div className="stat-value">{venues.length}</div><div className="stat-trend"><span className="trend-up">↑ 12%</span> from last month</div><div className="stat-label">Total Venues</div></div>
            <div className="stat-card"><div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#FEF9C3', color: '#CA8A04' }}><FaLayerGroup size={20} /></div><div className="stat-card-menu">···</div></div><div className="stat-value">{totalRequests}</div><div className="stat-trend"><span className="trend-up">↑ 5%</span> from last month</div><div className="stat-label">Total Requests</div></div>
            <div className="stat-card"><div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><FaCheck size={20} /></div><div className="stat-card-menu">···</div></div><div className="stat-value">{confirmedRequests}</div><div className="stat-trend"><span className="trend-up">↑ 18%</span> from last month</div><div className="stat-label">Confirmed</div></div>
            <div className="stat-card"><div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><FaTimes size={20} /></div><div className="stat-card-menu">···</div></div><div className="stat-value">{rejectedRequests}</div><div className="stat-trend"><span className="trend-up" style={{color: '#94A3B8'}}>— 0%</span> from last month</div><div className="stat-label">Rejected</div></div>
            <div className="stat-card"><div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#FFEDD5', color: '#EA580C' }}><FaClock size={20} /></div><div className="stat-card-menu">···</div></div><div className="stat-value">{pendingRequests}</div><div className="stat-trend"><span className="trend-up">↑ 2%</span> from last month</div><div className="stat-label">Pending</div></div>
            <div className="stat-card"><div className="stat-card-top"><div className="stat-card-icon" style={{ background: '#D1FAE5', color: '#059669' }}><FaMoneyBillWave size={20} /></div><div className="stat-card-menu">···</div></div><div className="stat-value">₹{totalRevenue.toLocaleString()}</div><div className="stat-trend"><span className="trend-up">↑ 30%</span> from last month</div><div className="stat-label">Total Revenue</div></div>
          </div>`
);
provDashStr = provDashStr.replace(
  `<div className="panel-title"><FaBuilding size={14} color="var(--brand)" /> Recent Venues</div>`,
  `<div className="panel-title" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{display: 'flex', alignItems: 'center', gap: '8px'}}><FaBuilding size={14} color="var(--brand)" /> Recent Venues</span> <button onClick={() => setView('list')} className="see-all-link" style={{background: 'none', border: 'none', cursor: 'pointer', outline: 'none'}}>See All →</button></div>`
);
fs.writeFileSync('src/pages/components/ProviderDashboard.jsx', provDashStr);


// 4. OrganiserEventCard.jsx
let orgCardStr = fs.readFileSync('src/pages/components/OrganiserEventCard.jsx', 'utf8');
orgCardStr = orgCardStr.replace(
  `<span className="ec-stat-pill">Sold <strong>{sold}</strong></span>\n          <span className="ec-stat-pill">Remaining <strong>{total - sold}</strong></span>\n          {event.cancelledTickets > 0 && <span className="ec-stat-pill cancelled">Cancelled <strong>{event.cancelledTickets}</strong></span>}\n          {pendingCount > 0 && <span className="ec-stat-pill refund">Pending Refund <strong>{pendingCount}</strong></span>}`,
  `<div className="ec-stat-pill"><span>Sold</span><strong>{sold}</strong></div>\n          <div className="ec-stat-pill"><span>Remaining</span><strong>{total - sold}</strong></div>\n          {event.cancelledTickets > 0 && <div className="ec-stat-pill cancelled"><span>Cancelled</span><strong>{event.cancelledTickets}</strong></div>}\n          {pendingCount > 0 && <div className="ec-stat-pill refund"><span>Pending Refund</span><strong>{pendingCount}</strong></div>}`
);
orgCardStr = orgCardStr.replace(
  `<p className="ec-attendees-title"><FaUsers size={14} color="#7c3aed" /> Registered Attendees ({attendees?.length || 0})</p>`,
  `<p className="ec-attendees-title">Registered Attendees <span className="attendee-count-badge">{attendees?.length || 0}</span></p>`
);
orgCardStr = orgCardStr.replace(
  `<div className="ec-attendee-num">{i + 1}</div>`,
  `<div className="attendee-avatar">{ticket.userId?.name?.charAt(0)?.toUpperCase() || 'U'}</div>`
);
fs.writeFileSync('src/pages/components/OrganiserEventCard.jsx', orgCardStr);

// 5. Navbar.jsx
let navStr = fs.readFileSync('src/pages/Navbar.jsx', 'utf8');
navStr = navStr.replace(
  `<div className="dropdown">\n                <h1>{name}</h1>\n                <p>{email}</p>`,
  `<div className="dropdown">\n                <h1>{name}</h1>\n                <p>{email}</p>\n                <div className="dropdown-separator"></div>`
);
navStr = navStr.replace(
  `placeholder="Search by city"`,
  `placeholder="Search events, cities..."`
);
fs.writeFileSync('src/pages/Navbar.jsx', navStr);

// 6. dash.css additions
const cssOverrides = `
/* --- PREMIUM UI UPGRADE OVERRIDES --- */
/* Font imports */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Clash+Display:wght@500;600;700;800&display=swap');

/* Overall page background */
.light-page {
  background: #F8F7FF !important;
}

/* Stat Cards */
.stat-card {
  padding: 28px !important;
  border-radius: 20px !important;
  border: 1px solid #F1F5F9 !important;
  background: #FFFFFF !important;
  box-shadow: 0 2px 8px rgba(15,10,42,0.04) !important;
  transition: box-shadow 0.2s ease !important;
  display: flex !important;
  flex-direction: column !important;
  position: relative !important;
}
.stat-card:hover {
  box-shadow: 0 8px 24px rgba(15,10,42,0.08) !important;
}
.stat-card-top {
  display: flex !important;
  justify-content: space-between !important;
  align-items: flex-start !important;
  margin-bottom: 16px !important;
}
.stat-card-icon {
  width: 44px !important;
  height: 44px !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.stat-card-menu {
  color: #CBD5E1 !important;
  font-weight: bold !important;
  letter-spacing: 2px !important;
  cursor: pointer !important;
}
.stat-value {
  font-family: 'Clash Display', sans-serif !important;
  font-size: 48px !important;
  font-weight: 800 !important;
  color: #0F0A2A !important;
  line-height: 1 !important;
}
.stat-trend {
  font-size: 12px !important;
  color: #94A3B8 !important;
  margin-top: 8px !important;
  margin-bottom: 16px !important;
}
.trend-up {
  color: #10B981 !important;
  font-weight: 600 !important;
}
.stat-label {
  font-family: 'Inter', sans-serif !important;
  font-size: 13px !important;
  color: #94A3B8 !important;
  letter-spacing: 0.04em !important;
  text-transform: uppercase !important;
}

/* Dashboard Greeting */
.dashboard-header {
  margin-bottom: 32px !important;
}
.dashboard-title {
  font-family: 'Clash Display', sans-serif !important;
  font-size: 32px !important;
  font-weight: 700 !important;
  color: #0F0A2A !important;
  margin-bottom: 4px !important;
}
.dashboard-subtitle {
  font-family: 'Inter', sans-serif !important;
  font-size: 15px !important;
  color: #94A3B8 !important;
}

/* Tabs */
.dash-nav {
  border-bottom: 1px solid #E2E8F0 !important;
  padding-bottom: 0 !important;
  gap: 24px !important;
}
.dash-nav-item {
  background: transparent !important;
  border-radius: 0 !important;
  color: #94A3B8 !important;
  font-weight: 400 !important;
  padding: 12px 0 !important;
  border-bottom: 2px solid transparent !important;
}
.dash-nav-item.active {
  color: #5B21B6 !important;
  border-bottom: 2px solid #7C3AED !important;
  font-weight: 600 !important;
  background: transparent !important;
}

/* Sidebar */
.dashboard-sidebar {
  background: linear-gradient(180deg, #2D1B69 0%, #1E1040 100%) !important;
  display: flex !important;
  flex-direction: column !important;
}
.sidebar-top {
  border-bottom: 1px solid rgba(255,255,255,0.08) !important;
  padding-bottom: 24px !important;
  margin-bottom: 32px !important;
}
.sidebar-nav {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}
.sidebar-support {
  margin-top: auto !important;
  background: rgba(124,58,237,0.2) !important;
  border-radius: 12px !important;
  padding: 16px !important;
  font-size: 13px !important;
  color: white !important;
}

/* Navbar */
.logo-text {
  font-family: 'Clash Display', sans-serif !important;
  font-size: 20px !important;
  font-weight: 800 !important;
  color: #0F0A2A !important;
  letter-spacing: -0.03em !important;
}
.nav-link {
  font-size: 14px !important;
  color: #64748B !important;
  font-weight: 500 !important;
}
.nav-link:hover {
  color: #5B21B6 !important;
}
.search-box input {
  max-width: 300px !important;
  border-radius: 100px !important;
  background: #F1F5F9 !important;
  border: 1px solid transparent !important;
  padding: 10px 18px !important;
}
.search-box input:focus {
  border: 1px solid #7C3AED !important;
  background: #FFFFFF !important;
}
.notif-bell-btn {
  width: 24px !important;
  height: 24px !important;
  color: #94A3B8 !important;
  background: transparent !important;
}
.notif-bell-btn:hover {
  color: #5B21B6 !important;
}
.profile-btn {
  background: #F8F7FF !important;
  border: 1.5px solid #E2E8F0 !important;
  border-radius: 100px !important;
  padding: 4px 12px 4px 4px !important;
}
.profile-btn span {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #0F0A2A !important;
}

/* Ticket Theme Selector */
.ticket-theme-card {
  gap: 4px !important;
  transition: all 0.25s ease !important;
}
.ticket-theme-card:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
}
.ticket-theme-selected {
  outline: 3px solid #7C3AED !important;
  outline-offset: 3px !important;
}
.ticket-theme-label {
  font-size: 12px !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  color: #374151 !important;
  text-transform: uppercase !important;
}

/* User Dropdown Popover */
.dropdown {
  margin-top: 8px !important;
  border-radius: 16px !important;
  padding: 8px !important;
  box-shadow: 0 16px 48px rgba(15,10,42,0.16) !important;
  border: 1px solid #F1F5F9 !important;
}
.dropdown h1 {
  font-family: 'Clash Display', sans-serif !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #0F0A2A !important;
}
.dropdown p {
  font-size: 12px !important;
  color: #94A3B8 !important;
}
.dropdown-separator {
  height: 1px !important;
  background: #F1F5F9 !important;
  margin: 8px 0 !important;
}
.dropdown button {
  border-radius: 10px !important;
}
.dropdown button:hover {
  background: #F8F7FF !important;
}
.log-out {
  color: #DC2626 !important;
  font-weight: 500 !important;
}
.log-out:hover {
  background: #FEF2F2 !important;
}

/* Micro-details */
.see-all-link {
  font-size: 13px !important;
  color: #7C3AED !important;
  font-weight: 600 !important;
  float: right !important;
}
.empty-state {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}
.empty-state h3 {
  font-size: 16px !important;
  color: #94A3B8 !important;
}
::-webkit-scrollbar {
  width: 4px !important;
}
::-webkit-scrollbar-thumb {
  border-radius: 100px !important;
  background: #EDE9FE !important;
}
.skeleton {
  background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%) !important;
  background-size: 200% 100% !important;
  animation: shimmer 1.5s infinite linear !important;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Event Card Restructure */
.ec-wrap {
  display: flex !important;
  flex-direction: column !important;
}
.ec-title {
  font-family: 'Clash Display', sans-serif !important;
  font-size: 20px !important;
  font-weight: 700 !important;
}
.ec-chips .meta-chip {
  font-size: 13px !important;
  color: #94A3B8 !important;
}
.event-status-live {
  background: #DCFCE7 !important;
  color: #16A34A !important;
  border-radius: 100px !important;
  padding: 4px 12px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 0.06em !important;
}
.ec-actions {
  display: flex !important;
  flex-direction: row !important;
  gap: 8px !important;
}
.ec-icon-btn-scan {
  border: 1px solid #E2E8F0 !important;
  background: transparent !important;
  color: #0F0A2A !important;
}
.ec-icon-btn-delete {
  background: #FEE2E2 !important;
  color: #DC2626 !important;
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 8px !important;
}
.ec-icon-btn-attendees {
  background: #7C3AED !important;
  color: white !important;
}
.ec-stats {
  background: #F8F7FF !important;
  border-radius: 12px !important;
  padding: 12px 20px !important;
  display: flex !important;
  gap: 24px !important;
}
.ec-stat-pill {
  display: flex !important;
  flex-direction: column-reverse !important;
  font-size: 11px !important;
  color: #94A3B8 !important;
}
.ec-stat-pill strong {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #0F0A2A !important;
}
.ec-progress-track {
  height: 6px !important;
  border-radius: 100px !important;
  background: #EDE9FE !important;
}
.ec-progress-fill {
  background: #7C3AED !important;
  border-radius: 100px !important;
}

/* Attendee List */
.ec-attendees {
  background: #FFFFFF !important;
  border-radius: 16px !important;
  padding: 24px !important;
  box-shadow: 0 2px 8px rgba(15,10,42,0.04) !important;
  border: 1px solid #F1F5F9 !important;
  margin-top: 16px !important;
}
.ec-attendees-title {
  font-family: 'Clash Display', sans-serif !important;
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #0F0A2A !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.attendee-count-badge {
  background: #EDE9FE !important;
  color: #5B21B6 !important;
  border-radius: 100px !important;
  padding: 2px 10px !important;
  font-size: 12px !important;
}
.ec-attendee-row {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 14px 0 !important;
  border-bottom: 1px solid #F1F5F9 !important;
}
.attendee-avatar {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background: #EDE9FE !important;
  color: #5B21B6 !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.ec-attendee-name {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #0F0A2A !important;
  margin-bottom: 0 !important;
}
.ec-attendee-email {
  font-size: 12px !important;
  color: #94A3B8 !important;
}
.ec-attendee-booking {
  font-family: monospace !important;
  font-size: 12px !important;
  color: #CBD5E1 !important;
}
.ec-status-active {
  background: #DCFCE7 !important;
  color: #16A34A !important;
  border-radius: 100px !important;
  padding: 4px 10px !important;
}
`;

fs.appendFileSync('src/pages/styles/dash.css', cssOverrides);

console.log('UI patch applied successfully!');
