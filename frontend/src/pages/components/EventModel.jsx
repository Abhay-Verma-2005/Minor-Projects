import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaTimes, FaTicketAlt, FaStar, FaRegStar, FaImages, FaExternalLinkAlt, FaTrashAlt, FaImage, FaLayerGroup, FaPaperPlane, FaUser } from "react-icons/fa";
import { cancelTicket, getMyTickets } from "../../api/bookings";
import { addVenueReview, getVenueById } from "../../api/venues";

const Alert = ({ type, text, onClose }) => (
  <div className={`ev-alert ${type}`}>
    <span>{text}</span>
    <button onClick={onClose}><FaTimes size={13} /></button>
  </div>
);

const StarRow = ({ rating }) => (
  <div className="ev-star-row">
    {[1, 2, 3, 4, 5].map(n =>
      n <= rating
        ? <FaStar key={n} size={12} color="#f59e0b" />
        : <FaRegStar key={n} size={12} color="#d1d5db" />
    )}
  </div>
);

const EventModal = ({ event, myId, isAuthenticated, userRole, onClose, onReviewSubmitted }) => {
  const [venue, setVenue] = useState(null);
  const [myTickets, setMyTickets] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (event.venueId?._id) {
      getVenueById(event.venueId._id).then(setVenue).catch(() => {});
    }
    if (isAuthenticated && userRole === "USER") {
      getMyTickets()
        .then(tickets => {
          const active = tickets.filter(t => t.eventId?._id === event._id && !t.cancelled);
          setMyTickets(active);
        })
        .catch(() => {});
    }
  }, [event, isAuthenticated, userRole]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await addVenueReview(venue._id, reviewRating, reviewText);
      setMsg({ type: "success", text: "Review submitted!" });
      setReviewText("");
      onReviewSubmitted();
      getVenueById(venue._id).then(setVenue);
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to submit review." });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancel = async (ticketId) => {
    if (!window.confirm("Cancel this ticket? Cancellation is only allowed >6 hours before the event.")) return;
    setCancelling(ticketId);
    try {
      await cancelTicket(ticketId);
      setMyTickets(prev => prev.filter(t => t._id !== ticketId));
      setMsg({ type: "success", text: "Ticket cancelled. Refund will be processed." });
      onReviewSubmitted();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Cannot cancel." });
    } finally {
      setCancelling(null);
    }
  };

  const photos = [event.bannerImage, ...event.photos].filter(Boolean);
  const reviews = venue?.reviews || [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const mapsUrl = venue
    ? venue.latitude && venue.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.address} ${venue.city}`)}`
    : null;

  const hasVenuePhoto = Boolean(venue?.images?.[0]);
  const hasFloorPlan = Boolean(venue?.venueShape);

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div className="ev-modal" onClick={e => e.stopPropagation()}>

        <div className="ev-modal-top">
          <h2>{event.title}</h2>
          <button className="ev-modal-close" onClick={onClose}><FaTimes size={14} /></button>
        </div>

        {photos.length > 0 && (
          <div className="ev-modal-photos">
            {photos.map((url, i) => (
              <img key={i} src={url} alt="" onError={e => { e.target.style.display = "none"; }} />
            ))}
          </div>
        )}

        <div className="ev-modal-body">
          {msg.text && (
            <Alert type={msg.type} text={msg.text} onClose={() => setMsg({ type: "", text: "" })} />
          )}

          {venue && (
            <div className="ev-venue-card">
              <div className="ev-venue-head">
                <div>
                  <p>{venue.name}</p>
                  <p><FaMapMarkerAlt size={11} /> {venue.address || `${venue.city}, ${venue.state}`}</p>
                </div>
                {avgRating && (
                  <div className="ev-venue-rating">
                    <FaStar size={13} color="#f59e0b" />
                    <span>{avgRating}</span>
                    <span>({reviews.length})</span>
                  </div>
                )}
              </div>

              {(hasVenuePhoto || hasFloorPlan) && (
                <div className={`ev-venue-images ${hasVenuePhoto && hasFloorPlan ? "two-col" : ""}`}>
                  {hasVenuePhoto && (
                    <div className="ev-venue-img-block">
                      <p><FaImage size={11} /> Venue Photo</p>
                      <img src={venue.images[0]} alt={venue.name} className="cover" onError={e => { e.target.style.display = "none"; }} />
                    </div>
                  )}
                  {hasFloorPlan && (
                    <div className="ev-venue-img-block">
                      <p><FaLayerGroup size={11} /> Floor Plan</p>
                      <img src={venue.venueShape} alt="Venue layout" className="contain" onError={e => { e.target.style.display = "none"; }} />
                    </div>
                  )}
                </div>
              )}

              {venue.layoutDescription && <p className="ev-venue-desc">{venue.layoutDescription}</p>}

              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="ev-maps-link">
                  <FaExternalLinkAlt size={11} /> View on Google Maps
                </a>
              )}
            </div>
          )}

          {myTickets.length > 0 && (
            <div className="ev-tickets">
              <p className="ev-tickets-title">
                <FaTicketAlt size={14} color="var(--primary)" /> My Tickets for This Event
              </p>
              <div className="ev-ticket-list">
                {myTickets.map(t => (
                  <div key={t._id} className="ev-ticket-item">
                    <img src={t.qrCode} alt="QR" />
                    <div className="ev-ticket-info">
                      <p>Booking #{t.bookingId?.split("-")[0]}</p>
                      <p>Seat {t.seatNumber || "—"}</p>
                    </div>
                    <button className="ev-cancel-btn" onClick={() => handleCancel(t._id)} disabled={cancelling === t._id}>
                      <FaTrashAlt size={11} /> {cancelling === t._id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                ))}
              </div>
              <p className="ev-tickets-note">Cancellation allowed up to 6 hours before the event.</p>
            </div>
          )}

          {venue && (
            <div className="ev-reviews">
              <p className="ev-reviews-title">
                <FaStar size={14} color="#f59e0b" /> Venue Reviews ({reviews.length})
              </p>
              {reviews.length > 0 && (
                <div className="ev-review-list">
                  {reviews.slice().reverse().map((r, i) => (
                    <div key={i} className="ev-review-item">
                      <div className="ev-review-head">
                        <span>{r.name}</span>
                        <StarRow rating={r.rating} />
                      </div>
                      <p>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {isAuthenticated && userRole !== "PROVIDER" ? (
                <>
                  <div className="ev-review-stars">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewRating(n)}>
                        {n <= reviewRating ? <FaStar size={20} color="#f59e0b" /> : <FaRegStar size={20} color="#d1d5db" />}
                      </button>
                    ))}
                  </div>
                  <form className="ev-review-form" onSubmit={handleReview}>
                    <input
                      className="ev-review-input"
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      placeholder="Share your experience of this venue..."
                    />
                    <button
                      type="submit"
                      className={`ev-review-submit ${reviewText.trim() ? "active" : "inactive"}`}
                      disabled={submittingReview || !reviewText.trim()}
                    >
                      <FaPaperPlane size={12} /> Submit
                    </button>
                  </form>
                </>
              ) : (
                !isAuthenticated && <p className="ev-review-signin">Sign in to leave a review.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
