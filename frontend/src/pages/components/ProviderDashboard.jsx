import { useState, useEffect, useCallback } from "react";
import {
  FaBuilding,
  FaPlus,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaLayerGroup,
  FaTimes,
  FaCheck,
  FaClock,
  FaChartBar,
  FaSyncAlt,
} from "react-icons/fa";
import { getMyVenues, createVenue, deleteVenue } from "../../api/venues";
import { getProviderStats } from "../../api/stats";
import ImagePicker from "./ImagePicker";
import VenueCard from "./VenueCard";
import VenueDetail from "./VenueDetail";
import FormField from "./FormField";

const SHAPE_PRESETS = [
  { label: "None", value: "", preview: null },
  { label: "Theatre", value: "/theatre.png", preview: "/theatre.png" },
  { label: "U-Shaped", value: "/U shaped.png", preview: "/U shaped.png" },
  { label: "Chaired Room", value: "/chaired room.png", preview: "/chaired room.png" },
  { label: "Free Style", value: "/free Style.png", preview: "/free Style.png" },
];

const EMPTY_FORM = {
  name: "",
  state: "",
  city: "",
  address: "",
  capacity: "",
  pricePerDay: "",
  layoutDescription: "",
  imageUrl: "",
  venueShape: "",
  latitude: "",
  longitude: "",
};

function getTrendArrow(trend) {
  if (trend >= 0) return "↑";
  return "↓";
}

function getTrendClass(trend) {
  if (trend >= 0) return "trend-up";
  return "trend-down";
}

function StatCard({ icon, colorClass, value, label, trendValue, trendText, extra }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-card-icon ${colorClass}`}>{icon}</div>
        {extra || <div className="stat-card-menu">···</div>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-trend">
        <span className={getTrendClass(trendValue)}>
          {getTrendArrow(trendValue)} {Math.abs(trendValue || 0)}%
        </span>{" "}
        {trendText}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

const ProviderDashboard = ({ activeView, setActiveView }) => {
  const [venues, setVenues] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [detailVenue, setDetailVenue] = useState(null);
  const [stats, setStats] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState("month");
  const [refreshing, setRefreshing] = useState(false);

  const fetchVenues = useCallback(async () => {
    const data = await getMyVenues();
    setVenues(data);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getProviderStats(revenueFilter);
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, [revenueFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchVenues(), fetchStats()]);
    setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => {
    fetchVenues();
    fetchStats();
  }, [fetchVenues, fetchStats]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await createVenue(form);
    setForm(EMPTY_FORM);
    setActiveView("list");
    fetchVenues();
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this venue?")) return;
    await deleteVenue(id);
    setVenues((prev) => prev.filter((v) => v._id !== id));
    if (detailVenue?._id === id) setDetailVenue(null);
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (detailVenue) {
    return (
      <VenueDetail
        venue={detailVenue}
        onBack={() => {
          setDetailVenue(null);
          fetchVenues();
        }}
        onDelete={() => {
          handleDelete(detailVenue._id);
          setDetailVenue(null);
        }}
        onRefresh={fetchVenues}
      />
    );
  }

  return (
    <div>
      <div className="db-nav-wrap">
        <div className="dash-nav db-nav-nomargin">
          <button
            className={`dash-nav-item ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <FaChartBar size={14} /> Dashboard
          </button>
          <button
            className={`dash-nav-item ${activeView === "venues" ? "active" : ""}`}
            onClick={() => setActiveView("venues")}
          >
            <FaBuilding size={14} /> My Venues
          </button>
          <button
            className={`dash-nav-item ${activeView === "create" ? "active" : ""}`}
            onClick={() => setActiveView("create")}
          >
            <FaPlus size={14} /> Add Venue
          </button>
        </div>

        <button
          className={`refresh-icon-btn ${refreshing ? "spinning" : ""}`}
          onClick={handleRefresh}
          title="Refresh Dashboard"
        >
          <FaSyncAlt size={16} />
        </button>
      </div>

      {activeView === "dashboard" && (
        <div className="overview-section">
          <div className="pd-stats-grid">
            <StatCard
              icon={<FaBuilding size={20} />}
              colorClass="si-purple"
              value={stats?.totalVenues?.value || 0}
              label="Total Venues"
              trendValue={stats?.totalVenues?.trend}
              trendText="from last month"
            />
            <StatCard
              icon={<FaLayerGroup size={20} />}
              colorClass="si-yellow"
              value={stats?.totalRequests?.value || 0}
              label="Total Requests"
              trendValue={stats?.totalRequests?.trend}
              trendText="last 7 days"
            />
            <StatCard
              icon={<FaCheck size={20} />}
              colorClass="si-green"
              value={stats?.confirmed?.value || 0}
              label="Confirmed"
              trendValue={stats?.confirmed?.trend}
              trendText="last 7 days"
            />
            <StatCard
              icon={<FaTimes size={20} />}
              colorClass="si-red"
              value={stats?.rejected?.value || 0}
              label="Rejected"
              trendValue={stats?.rejected?.trend}
              trendText="month wise"
            />
            <StatCard
              icon={<FaClock size={20} />}
              colorClass="si-orange"
              value={stats?.pending?.value || 0}
              label="Pending"
              trendValue={stats?.pending?.trend}
              trendText="1 day"
            />
            <StatCard
              icon={<FaMoneyBillWave size={20} />}
              colorClass="si-mint"
              value={`₹${(stats?.revenue?.value || 0).toLocaleString()}`}
              label="Total Revenue"
              trendValue={stats?.revenue?.trend}
              trendText="filter wise"
              extra={
                <select
                  value={revenueFilter}
                  onChange={(e) => setRevenueFilter(e.target.value)}
                  className="pd-stat-sel"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              }
            />
          </div>

          {venues.length > 0 && (
            <div className="panel pd-recent-panel">
              <div className="panel-title pd-panel-hdr">
                <span className="pd-panel-lbl">
                  <FaBuilding size={14} color="var(--brand)" /> Recent Venues
                </span>
                <button
                  onClick={() => setActiveView("list")}
                  className="see-all-link pd-see-all"
                >
                  See All →
                </button>
              </div>
              <div className="cards-list">
                {venues.slice(0, 2).map((v) => (
                  <VenueCard
                    key={v._id}
                    venue={v}
                    expanded={expanded === v._id}
                    onToggle={() => toggleExpand(v._id)}
                    onDelete={() => handleDelete(v._id)}
                    onOpenDetail={() => setDetailVenue(v)}
                  />
                ))}
              </div>
              {venues.length > 2 && (
                <button
                  className="btn-secondary pd-view-all"
                  onClick={() => setActiveView("list")}
                >
                  View All {venues.length} Venues
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeView === "create" && (
        <div className="panel pd-create-panel">
          <div className="panel-title pd-create-title">
            <FaPlus size={16} /> Register a New Venue
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section-title pd-sec-first">
              <FaBuilding size={14} color="var(--brand)" /> 1. Venue Details
            </div>

            <div className="form-grid">
              <div className="form-full">
                <FormField
                  label="Venue Name *"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Grand Palace Hall"
                  required
                />
              </div>
              <FormField
                label="Capacity *"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                type="number"
                min="1"
                required
                placeholder="500"
              />
              <FormField
                label="Price Per Day (₹) *"
                name="pricePerDay"
                value={form.pricePerDay}
                onChange={handleChange}
                type="number"
                min="0"
                required
                placeholder="50000"
              />

              <div className="form-full">
                <div className="form-section-title">
                  <FaMapMarkerAlt size={14} color="var(--brand)" /> 2. Location
                </div>
              </div>

              <FormField label="State *" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra" required />
              <FormField label="City *" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" required />

              <div className="form-full">
                <FormField label="Full Address" name="address" value={form.address} onChange={handleChange} placeholder="123 Main Rd" />
              </div>

              <FormField label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} type="number" step="any" placeholder="19.0760" />
              <FormField label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} type="number" step="any" placeholder="72.8777" />

              <div className="form-full">
                <div className="form-section-title">
                  <FaLayerGroup size={14} color="var(--brand)" /> 3. Layout & Media
                </div>
              </div>

              <div className="field form-full">
                <label>Layout Description</label>
                <textarea
                  name="layoutDescription"
                  value={form.layoutDescription}
                  onChange={handleChange}
                  placeholder="Seating, stage, parking, A/V..."
                />
              </div>
            </div>

            <div className="form-grid pd-media-grid">
              <div className="field">
                <ImagePicker
                  label="Venue Photo"
                  value={form.imageUrl}
                  onChange={(val) => setForm((prev) => ({ ...prev, imageUrl: val }))}
                  hint="Upload a photo of your venue."
                />
              </div>
              <div className="field">
                <p className="vc-floor-section-title pd-floor-lbl">
                  <FaLayerGroup size={13} /> Floor Plan / Shape
                </p>
                <ImagePicker
                  value={form.venueShape}
                  onChange={(val) => setForm((prev) => ({ ...prev, venueShape: val }))}
                  presets={SHAPE_PRESETS}
                  hint="Choose a preset or upload."
                />
              </div>
            </div>

            <div className="form-actions pd-form-btns">
              <button
                type="submit"
                className="book-btn form-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Registering..." : "Register Venue"}
              </button>
              <button
                type="button"
                className="btn-secondary form-back-btn"
                onClick={() => setActiveView("list")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeView === "venues" && (
        <>
          {venues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-color">
                <FaBuilding size={32} />
              </div>
              <h3>No Venues Yet</h3>
              <p>Register your first venue to start receiving bookings.</p>
              <button
                className="book-btn empty-state-cta"
                onClick={() => setActiveView("add")}
              >
                Register First Venue
              </button>
            </div>
          ) : (
            <div className="cards-list">
              {venues.map((v) => (
                <VenueCard
                  key={v._id}
                  venue={v}
                  expanded={expanded === v._id}
                  onToggle={() => toggleExpand(v._id)}
                  onDelete={() => handleDelete(v._id)}
                  onOpenDetail={() => setDetailVenue(v)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderDashboard;