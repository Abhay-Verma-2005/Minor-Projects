import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { bookTicket } from "../api/bookings";
import { likeEvent, commentOnEvent } from "../api/events";
import { FaTimes, FaSearch, FaCalendarAlt } from "react-icons/fa";
import EventCard from "./components/EventCard";
import EventModal from "./components/EventModel";
import "./styles/event.css";

const Alert = ({ type, text, onClose }) => (
  <div className={`ev-alert ${type}`}>
    <span>{text}</span>
    <button onClick={onClose}><FaTimes size={13} /></button>
  </div>
);

const EventsPage = () => {
  const [events, setEvents]= useState([]);
  const [loading, setLoading]= useState(true);
  const [cityFilter, setCityFilter]= useState("");
  const [searchFilter, setSearchFilter]= useState("");
  const [globalMsg, setGlobalMsg]= useState({ type: "", text: "" });
  const [detailEvent, setDetailEvent] = useState(null);
  const [searchParams]= useSearchParams();
  const { isAuthenticated, user }= useAuth();

  const navigate = useNavigate();
  const myId = user?.user?.id;
  const userRole = user?.user?.role;

  useEffect(() => {
    setCityFilter(searchParams.get("city") || "");
    setSearchFilter(searchParams.get("search") || "");
  }, [searchParams]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "/api/v1";
      const res  = await fetch(`${baseUrl}/events`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setGlobalMsg({ type: "error", text: "Failed to load events." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const filtered = events.filter(e => {
    const matchesCity = cityFilter.trim() ? e.venueId?.city?.toLowerCase().includes(cityFilter.toLowerCase()) : true;
    const matchesSearch = searchFilter.trim() ? (
      e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.venueId?.city?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      e.venueId?.name?.toLowerCase().includes(searchFilter.toLowerCase())
    ) : true;
    return matchesCity && matchesSearch;
  });

  const handleLike = async (eventId) => {
    if (!isAuthenticated) return navigate("/login");
    try {
      const { liked } = await likeEvent(eventId);
      setEvents(prev => prev.map(e => {
        if (e._id !== eventId) return e;
        const likes = liked
          ? [...e.likes, myId]
          : e.likes.filter(id => id.toString() !== myId);
        return { ...e, likes };
      }));
    } catch {}
  };

  const handleComment = async (eventId, text) => {
    if (!isAuthenticated) return navigate("/login");
    await commentOnEvent(eventId, text);
    fetchEvents();
  };

  const handleBook = async (eventId, qty) => {
    if (!isAuthenticated) return navigate("/login");
    if (userRole !== "USER") {
      return setGlobalMsg({ type: "error", text: "Only registered Users can book tickets." });
    }
    try {
      await bookTicket(eventId, qty);
      setGlobalMsg({ type: "success", text: `${qty} ticket${qty > 1 ? "s" : ""} booked! Check your dashboard.` });
      fetchEvents();
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (err) {
      setGlobalMsg({ type: "error", text: err.response?.data?.message || "Booking failed." });
    }
  };

  return (
    <div className="light-page">
      <Navbar lightLogo />
      <div className="ev-page">

        <div className="ev-header">
          <h1>Live Events</h1>
          <p>Discover, like, comment and book tickets</p>
        </div>

        {globalMsg.text && (
          <Alert type={globalMsg.type} text={globalMsg.text} onClose={() => setGlobalMsg({ type: "", text: "" })} />
        )}

        <div className="ev-search">
          <div className="ev-search-inner">
            <FaSearch />
            <input
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
            />
          </div>
          {cityFilter && (
            <button className="ev-search-clear" onClick={() => setCityFilter("")}>
              <FaTimes size={12} /> Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="ev-loading">Loading feed...</div>
        ) : filtered.length === 0 ? (
          <div className="ev-empty">
            <FaCalendarAlt size={32} color="#ddd6fe" className="evp-empty-icon" />
            <p>No events found</p>
            <p>{cityFilter ? `No live events in "${cityFilter}"` : "No live events right now. Check back soon!"}</p>
          </div>
        ) : (
          <div className="ev-feed">
            {filtered.map(event => (
              <EventCard
                key={event._id}
                event={event}
                myId={myId}
                isAuthenticated={isAuthenticated}
                userRole={userRole}
                onLike={() => handleLike(event._id)}
                onComment={text => handleComment(event._id, text)}
                onBook={qty => handleBook(event._id, qty)}
                onOpenDetail={() => setDetailEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      {detailEvent && (
        <EventModal
          event={detailEvent}
          myId={myId}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onClose={() => setDetailEvent(null)}
          onReviewSubmitted={fetchEvents}
        />
      )}
    </div>
  );
};

export default EventsPage;