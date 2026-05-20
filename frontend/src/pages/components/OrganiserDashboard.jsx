import { useState, useEffect, useCallback } from "react";
import {
  FaCalendarAlt, FaPlus, FaSearch, FaMapMarkerAlt, FaUsers,
  FaMoneyBillWave, FaTimes, FaHashtag, FaCheck, FaLayerGroup,
  FaPalette, FaChartBar, FaClock, FaUndo, FaSyncAlt, FaHeart,
} from "react-icons/fa";
import { getVenues, bookVenue } from "../../api/venues";
import {
  getMyEvents, createEvent, deleteEvent, updateEventStatus,
  getEventAttendees, toggleAttendance, getPendingRefunds, scanQR,
} from "../../api/events";
import { processRefund } from "../../api/bookings";
import { getOrganiserStats } from "../../api/stats";
import ImagePicker from "./ImagePicker";
import VenueCalendar from "./VenueCalendar";
import OrganiserEventCard from "./OrganiserEventCard";
import VenueSelectCard from "./VenueSelectCard";

const TICKET_THEMES = [
  { id: "red", label: "Red", image: "/redtick.png" },
  { id: "green", label: "Green", image: "/greentick.png" },
  { id: "yellow", label: "Yellow", image: "/yellowtick.png" },
  { id: "blue", label: "Blue", image: "/bluetick.png" },
];

const EMPTY_FORM = {
  title: "", description: "", startTime: "", endTime: "",
  ticketPrice: "", totalTickets: "", bannerImage: "",
  photos: [], hashtags: [], ticketTheme: "",
};

function getTrendClass(val) {
  return val >= 0 ? "trend-up" : "trend-down";
}

function getTrendArrow(val) {
  return val >= 0 ? "↑" : "↓";
}

function StatCard({ icon, colorClass, value, label, trendValue, trendText, extra }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-card-icon ${colorClass}`}>{icon}</div>
        {extra || null}
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

function calcDays(start, end) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diff);
}

const OrganiserDashboard = ({ activeView, setActiveView }) => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [attendees, setAttendees] = useState({});
  const [hashtagInput, setHashtagInput] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [venueStartDate, setVenueStartDate] = useState(null);
  const [venueEndDate, setVenueEndDate] = useState(null);
  const [scanEventId, setScanEventId] = useState(null);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [pendingRefunds, setPendingRefunds] = useState({});
  const [refundProcessing, setRefundProcessing] = useState(null);
  const [stats, setStats] = useState(null);
  const [periodFilter, setPeriodFilter] = useState("total");
  const [eventFilter, setEventFilter] = useState("total");
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    const data = await getMyEvents();
    setEvents(data);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getOrganiserStats(periodFilter, eventFilter);
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, [periodFilter, eventFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEvents(), fetchStats()]);
    setTimeout(() => setRefreshing(false), 600);
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [fetchEvents, fetchStats]);

  const handleSearchVenues = async () => {
    const data = await getVenues(citySearch, stateSearch);
    setVenues(data);
  };

  const addHashtag = () => {
    const tag = hashtagInput.replace(/^#/, "").trim();
    if (tag && !form.hashtags.includes(tag)) {
      setForm((prev) => ({ ...prev, hashtags: [...prev.hashtags, tag] }));
    }
    setHashtagInput("");
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!venueStartDate || !venueEndDate) {
      alert("Please select venue start and end dates from the calendar.");
      return;
    }

    setSubmitting(true);

    try {
      const startTime = form.startTime || "09:00";
      const endTime = form.endTime || "18:00";
      const startDate = new Date(`${venueStartDate}T${startTime}:00`);
      const endDate = new Date(`${venueEndDate}T${endTime}:00`);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert("Invalid date/time. Please re-select dates.");
        setSubmitting(false);
        return;
      }

      const eventData = {
        title: form.title,
        description: form.description,
        ticketPrice: form.ticketPrice,
        totalTickets: form.totalTickets,
        bannerImage: form.bannerImage,
        photos: form.photos,
        hashtags: form.hashtags,
        ticketTheme: form.ticketTheme,
        date: startDate.toISOString(),
        endDate: endDate.toISOString(),
        venueId: selectedVenue._id,
        status: "Draft",
      };

      let newEvent;
      try {
        newEvent = await createEvent(eventData);
      } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to create event");
      }

      try {
        await bookVenue(selectedVenue._id, {
          eventId: newEvent._id,
          startDate: venueStartDate,
          endDate: venueEndDate,
        });
      } catch (err) {
        try { await deleteEvent(newEvent._id); } catch (_) {}
        throw new Error(err.response?.data?.message || "Failed to book venue");
      }

      alert("Event created & venue requested! Awaiting provider confirmation.");
      setForm(EMPTY_FORM);
      setSelectedVenue(null);
      setVenueStartDate(null);
      setVenueEndDate(null);
      setActiveView("events");
      fetchEvents();
    } catch (err) {
      console.error("Create Event Error:", err);
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVenueDateClick = (dateStr) => {
    if (!venueStartDate || (venueStartDate && venueEndDate)) {
      setVenueStartDate(dateStr);
      setVenueEndDate(null);
      return;
    }

    const clicked = new Date(dateStr + "T00:00:00");
    const start = new Date(venueStartDate + "T00:00:00");

    if (clicked < start) {
      setVenueEndDate(venueStartDate);
      setVenueStartDate(dateStr);
    } else {
      setVenueEndDate(dateStr);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    await deleteEvent(id);
    setEvents((prev) => prev.filter((ev) => ev._id !== id));
  };

  const handleStatusChange = async (id, status) => {
    const updated = await updateEventStatus(id, status);
    setEvents((prev) => prev.map((ev) => (ev._id === id ? updated : ev)));
  };

  const loadAttendees = async (eventId) => {
    const data = await getEventAttendees(eventId);
    setAttendees((prev) => ({ ...prev, [eventId]: data }));
  };

  const handleToggleAttendance = async (eventId, ticketId, currentStatus) => {
    try {
      const attended = currentStatus !== "attended";
      await toggleAttendance(eventId, ticketId, attended);
      loadAttendees(eventId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update attendance");
    }
  };

  const loadPendingRefunds = async (eventId) => {
    try {
      const data = await getPendingRefunds(eventId);
      setPendingRefunds((prev) => ({ ...prev, [eventId]: data }));
    } catch (err) {
      console.error("Failed to load refunds:", err);
    }
  };

  const handleProcessRefund = async (bookingId, eventId) => {
    try {
      setRefundProcessing(bookingId);
      await processRefund(bookingId);
      loadPendingRefunds(eventId);
      loadAttendees(eventId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process refund");
    } finally {
      setRefundProcessing(null);
    }
  };

  const handleScanQR = async () => {
    if (!scanInput.trim() || !scanEventId) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const result = await scanQR(scanEventId, scanInput.trim());
      setScanResult({ success: true, message: result.message });
      loadAttendees(scanEventId);
    } catch (err) {
      setScanResult({ success: false, message: err.response?.data?.message || "Scan failed" });
    } finally {
      setScanLoading(false);
      setScanInput("");
    }
  };

  const toggleEventExpand = (eventId) => {
    if (expandedEvent !== eventId) {
      loadAttendees(eventId);
      loadPendingRefunds(eventId);
    }
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  const openScanner = (eventId) => {
    setScanEventId(eventId);
    setScanResult(null);
    setScanInput("");
  };

  const renderEventCard = (event, hideAttendeesBtn) => (
    <OrganiserEventCard
      key={event._id}
      event={event}
      expanded={expandedEvent === event._id}
      attendees={attendees[event._id]}
      pendingRefunds={pendingRefunds[event._id]}
      onToggleAttendees={() => toggleEventExpand(event._id)}
      onDelete={() => handleDelete(event._id)}
      onStatusChange={(status) => handleStatusChange(event._id, status)}
      onToggleAttendance={handleToggleAttendance}
      onProcessRefund={handleProcessRefund}
      onOpenScanner={() => openScanner(event._id)}
      scanEventId={scanEventId}
      scanInput={scanInput}
      setScanInput={setScanInput}
      scanResult={scanResult}
      scanLoading={scanLoading}
      onScan={handleScanQR}
      onCloseScanner={() => setScanEventId(null)}
      refundProcessing={refundProcessing}
      hideAttendeesBtn={hideAttendeesBtn}
    />
  );

  const removeHashtag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((t) => t !== tagToRemove),
    }));
  };

  const removePhoto = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== indexToRemove),
    }));
  };

  const toggleTicketTheme = (themeImage) => {
    setForm((prev) => ({
      ...prev,
      ticketTheme: prev.ticketTheme === themeImage ? "" : themeImage,
    }));
  };

  const isDiscoverActive = activeView === "discover" || activeView === "create";
  const datesSelected = venueStartDate && venueEndDate;

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
            className={`dash-nav-item ${activeView === "events" ? "active" : ""}`}
            onClick={() => setActiveView("events")}
          >
            <FaCalendarAlt size={14} /> My Events
          </button>
          <button
            className={`dash-nav-item ${isDiscoverActive ? "active" : ""}`}
            onClick={() => setActiveView("discover")}
          >
            <FaSearch size={14} /> Discover & Create
          </button>
        </div>

        <div className="od-actions-right">
          {stats?.pendingRefunds?.value > 0 && (
            <div className="ec-floating-badge refund-pulse od-refund-static">
              <FaUndo size={12} /> Refund Pending
            </div>
          )}
          <button
            className={`refresh-icon-btn ${refreshing ? "spinning" : ""}`}
            onClick={handleRefresh}
            title="Refresh Dashboard"
          >
            <FaSyncAlt size={16} />
          </button>
        </div>
      </div>

      {activeView === "dashboard" && (
        <div className="overview-section">
          <div className="pd-stats-grid">
            <StatCard
              icon={<FaChartBar size={20} />}
              colorClass="si-purple"
              value={stats?.totalEvents?.value || 0}
              label="Total Events"
              trendValue={stats?.totalEvents?.trend}
              trendText="global trend"
              extra={
                <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="pd-stat-sel">
                  <option value="total">Total</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              }
            />
            <StatCard icon={<FaCheck size={20} />} colorClass="si-green" value={stats?.liveEvents?.value || 0} label="Live Events" trendValue={0} trendText="now" />
            <StatCard icon={<FaHeart size={20} />} colorClass="si-pink" value={stats?.totalLikes?.value || 0} label="Total Likes" trendValue={0} trendText="Engagement" />
            <StatCard
              icon={<FaMoneyBillWave size={20} />}
              colorClass="si-mint"
              value={`₹${(stats?.revenue?.value || 0).toLocaleString()}`}
              label="Total Revenue"
              trendValue={stats?.revenue?.trend}
              trendText="trend"
              extra={
                <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="od-stat-sel">
                  <option value="total">All Events</option>
                  {stats?.availableEvents?.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              }
            />
            <StatCard icon={<FaUsers size={20} />} colorClass="si-yellow" value={stats?.ticketsSold?.value || 0} label="Tickets Sold" trendValue={stats?.ticketsSold?.trend} trendText="active sales" />
            <StatCard icon={<FaTimes size={20} />} colorClass="si-red" value={stats?.cancellations?.value || 0} label="Cancellations" trendValue={0} trendText="rate" />
          </div>

          {events.length > 0 && (
            <div className="panel pd-recent-panel">
              <div className="panel-title pd-panel-hdr">
                <span className="pd-panel-lbl">
                  <FaClock size={14} color="var(--brand)" /> Recent Events
                </span>
                <button onClick={() => setActiveView("events")} className="see-all-link pd-see-all">
                  See All →
                </button>
              </div>
              <div className="cards-list">
                {events.slice(0, 2).map((event) => renderEventCard(event, true))}
              </div>
              {events.length > 2 && (
                <button className="btn-secondary pd-view-all" onClick={() => setActiveView("events")}>
                  View All {events.length} Events
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeView === "events" && (
        <>
          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon-color"><FaCalendarAlt size={32} /></div>
              <h3>No Events Yet</h3>
              <p>Find a venue and create your first event.</p>
              <button className="book-btn empty-state-cta" onClick={() => setActiveView("discover")}>Find a Venue</button>
            </div>
          ) : (
            <div className="cards-list">
              {events.map((event) => renderEventCard(event, false))}
            </div>
          )}
        </>
      )}

      {activeView === "discover" && (
        <div>
          <div className="panel">
            <div className="panel-title"><FaSearch size={14} /> Search Venues by Location</div>
            <div className="filter-bar">
              <div className="field">
                <label>City</label>
                <input
                  placeholder="e.g. Mathura"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchVenues()}
                />
              </div>
              <div className="field">
                <label>State</label>
                <input
                  placeholder="e.g. Uttar Pradesh"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchVenues()}
                />
              </div>
              <button className="book-btn filter-search-btn" onClick={handleSearchVenues}>Search</button>
            </div>
          </div>

          {venues.length > 0 && (
            <div className="cards-list">
              <p className="venues-count">
                {venues.length} venue{venues.length !== 1 ? "s" : ""} found
              </p>
              {venues.map((venue) => (
                <VenueSelectCard
                  key={venue._id}
                  venue={venue}
                  selected={selectedVenue?._id === venue._id}
                  onSelect={() => {
                    setSelectedVenue(venue);
                    setActiveView("create");
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === "create" && (
        <div className="panel pd-create-panel">
          <div className="panel-title pd-create-title">
            <FaPlus size={16} /> Create Event
          </div>

          {selectedVenue && (
            <div className="od-venue-wrap">
              <div className="form-section-title pd-sec-first">
                <FaMapMarkerAlt size={14} color="var(--brand)" /> 1. Selected Venue
              </div>

              <div className="venue-info-box od-venue-info-box">
                <div className="od-venue-row">
                  {selectedVenue.images?.[0]
                    ? <img src={selectedVenue.images[0]} className="od-venue-thumb" alt="" />
                    : <div className="od-venue-thumb-empty" />
                  }
                  <div className="venue-info-box-body">
                    <p className="venue-info-name od-venue-name">{selectedVenue.name}</p>
                    <p className="venue-info-meta">
                      {selectedVenue.city}, {selectedVenue.state} · Capacity: {selectedVenue.capacity?.toLocaleString()} · ₹{selectedVenue.pricePerDay?.toLocaleString()}/day
                    </p>
                  </div>
                </div>
                <button className="btn-secondary btn-change" onClick={() => setActiveView("discover")}>
                  Change Venue
                </button>
              </div>

              <div className="od-cal-wrap">
                <p className="od-cal-label">Select Dates from Calendar</p>
                <VenueCalendar
                  bookings={selectedVenue.bookings || []}
                  mode="select"
                  onDateClick={handleVenueDateClick}
                  selectionStart={venueStartDate}
                  selectionEnd={venueEndDate}
                />
                {datesSelected && (
                  <div className="od-booking-sum">
                    <strong>Booking Summary:</strong>{" "}
                    {calcDays(venueStartDate, venueEndDate)} days × ₹{selectedVenue.pricePerDay?.toLocaleString()}/day ={" "}
                    <strong className="od-sum-total">
                      ₹{(calcDays(venueStartDate, venueEndDate) * selectedVenue.pricePerDay).toLocaleString()} total
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateEvent}>
            <div className="form-section-title">
              <FaLayerGroup size={14} color="var(--brand)" /> 2. Event Core Details
            </div>
            <div className="form-grid">
              <div className="field form-full">
                <label>Event Title *</label>
                <input required placeholder="e.g. Tech Summit 2026" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              </div>
              <div className="field">
                <label>Event Start Time</label>
                <input type="time" value={form.startTime} onChange={(e) => updateForm("startTime", e.target.value)} />
                <p className="field-hint od-hint">Default: 09:00 AM</p>
              </div>
              <div className="field">
                <label>Event End Time</label>
                <input type="time" value={form.endTime} onChange={(e) => updateForm("endTime", e.target.value)} />
                <p className="field-hint od-hint">Default: 06:00 PM</p>
              </div>
              <div className="field">
                <label>Ticket Price (₹) *</label>
                <input type="number" required min="0" placeholder="999" value={form.ticketPrice} onChange={(e) => updateForm("ticketPrice", e.target.value)} />
              </div>
              <div className="field">
                <label>Total Tickets *</label>
                <input type="number" required min="1" max={selectedVenue?.capacity} placeholder={`Max ${selectedVenue?.capacity}`} value={form.totalTickets} onChange={(e) => updateForm("totalTickets", e.target.value)} />
              </div>
              <div className="field form-full">
                <ImagePicker label="Banner Image" value={form.bannerImage} onChange={(val) => updateForm("bannerImage", val)} hint="Upload an event banner." />
              </div>
              <div className="field form-full">
                <label>Event Description *</label>
                <textarea required placeholder="Describe your event..." value={form.description} onChange={(e) => updateForm("description", e.target.value)} />
              </div>

              <div className="form-full">
                <div className="form-section-title">
                  <FaPalette size={14} color="var(--brand)" /> 3. Media & Ticketing
                </div>
              </div>

              <div className="field form-full">
                <label>Hashtags</label>
                <div className="hashtag-input-row">
                  <input
                    className="hashtag-text-input"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    placeholder="#music #tech"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHashtag(); } }}
                  />
                  <button type="button" onClick={addHashtag} className="btn-secondary hashtag-add-btn">
                    <FaHashtag size={13} />
                  </button>
                </div>
                {form.hashtags.length > 0 && (
                  <div className="hashtag-pills">
                    {form.hashtags.map((tag) => (
                      <span key={tag} className="hashtag-pill">
                        #{tag}
                        <button type="button" onClick={() => removeHashtag(tag)} className="hashtag-pill-remove">
                          <FaTimes size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="field form-full">
                <label>
                  <FaPalette size={13} className="od-palette-icon" /> Ticket Theme
                </label>
                <p className="field-hint">Choose a theme for your event tickets.</p>
                <div className="ticket-theme-grid">
                  {TICKET_THEMES.map((theme) => {
                    const isSelected = form.ticketTheme === theme.image;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        className={`ticket-theme-card${isSelected ? " ticket-theme-selected" : ""}`}
                        onClick={() => toggleTicketTheme(theme.image)}
                      >
                        <img src={theme.image} alt={theme.label} className="ticket-theme-img" />
                        <span className="ticket-theme-label">{theme.label}</span>
                        {isSelected && (
                          <span className="ticket-theme-check"><FaCheck size={12} /></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field form-full">
                <ImagePicker
                  label="Additional Photos"
                  value=""
                  onChange={(val) => {
                    if (val) setForm((prev) => ({ ...prev, photos: [...prev.photos, val] }));
                  }}
                  hint="Each upload adds to the gallery."
                />
                {form.photos.length > 0 && (
                  <div className="photo-gallery">
                    {form.photos.map((url, i) => (
                      <div key={i} className="photo-thumb-wrap">
                        <img src={url} alt="" className="photo-thumb" />
                        <button type="button" className="photo-thumb-remove" onClick={() => removePhoto(i)}>
                          <FaTimes size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="book-btn form-submit-btn" disabled={submitting || !datesSelected}>
                {submitting ? "Requesting..." : "Request Venue & Create Event"}
              </button>
              <button type="button" className="btn-secondary form-back-btn" onClick={() => setActiveView("discover")}>
                Back
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrganiserDashboard;