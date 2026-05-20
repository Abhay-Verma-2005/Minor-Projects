import {
  FaBuilding, FaMapMarkerAlt, FaUsers, FaMoneyBillWave,
  FaTrashAlt, FaStar, FaRegStar, FaLayerGroup,
  FaChevronDown, FaChevronUp, FaExternalLinkAlt,
} from "react-icons/fa";

function getAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / reviews.length).toFixed(1);
}

function getGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function StarRating({ rating }) {
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= rating
          ? <FaStar key={n} size={12} color="#f59e0b" />
          : <FaRegStar key={n} size={12} color="#d1d5db" />
      )}
    </div>
  );
}

const VenueCard = ({ venue, expanded, onToggle, onDelete, onOpenDetail }) => {
  const avgRating = getAverageRating(venue.reviews);
  const pendingCount = (venue.bookings || []).filter((b) => b.status === "pending").length;

  const statusClass = venue.status === "AVAILABLE"
    ? "venue-status-available"
    : "venue-status-booked";

  return (
    <div className="vc-wrap">
      <div className="vc-header vc-hdr-click" onClick={onOpenDetail}>
        {venue.images?.[0] ? (
          <img src={venue.images[0]} alt={venue.name} className="vc-thumb" />
        ) : (
          <div className="vc-thumb-placeholder">
            <FaBuilding size={24} color="#c4b5fd" />
          </div>
        )}

        <div className="vc-info">
          <div className="vc-info-top">
            <div>
              <h3 className="vc-name">{venue.name}</h3>
              <div className="vc-chips">
                <span className="meta-chip">
                  <FaMapMarkerAlt size={11} /> {venue.city}, {venue.state}
                </span>
                <span className="meta-chip">
                  <FaUsers size={11} /> {venue.capacity?.toLocaleString()} capacity
                </span>
                <span className="meta-chip">
                  <FaMoneyBillWave size={11} /> ₹{venue.pricePerDay?.toLocaleString()}/day
                </span>
                {avgRating && (
                  <span className="meta-chip">
                    <FaStar size={11} /> {avgRating} ({venue.reviews.length})
                  </span>
                )}
              </div>
            </div>

            <div className="vc-icon-btns" onClick={(e) => e.stopPropagation()}>
              <span className={`status-badge ${statusClass}`}>{venue.status}</span>

              {pendingCount > 0 && (
                <span className="status-badge status-pending vc-pending-gap">
                  {pendingCount} pending
                </span>
              )}

              <button onClick={onDelete} className="vc-icon-btn vc-icon-btn-delete">
                <FaTrashAlt />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                className="vc-icon-btn vc-icon-btn-toggle"
              >
                {expanded ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="vc-expanded">
          <div className={venue.venueShape ? "vc-detail-grid-2" : "vc-detail-grid-1"}>
            <div>
              {venue.address && (
                <div className="vc-address-row">
                  <FaMapMarkerAlt size={13} color="#7c3aed" />
                  <span className="vc-address-text">{venue.address}</span>
                </div>
              )}

              {venue.layoutDescription && (
                <p className="vc-desc">{venue.layoutDescription}</p>
              )}

              {venue.latitude && venue.longitude && (
                <a
                  href={getGoogleMapsUrl(venue.latitude, venue.longitude)}
                  target="_blank"
                  rel="noreferrer"
                  className="vc-maps-link"
                >
                  <FaExternalLinkAlt size={11} /> View on Google Maps
                </a>
              )}
            </div>

            {venue.venueShape && (
              <div>
                <p className="vc-floorplan-label">
                  <FaLayerGroup size={13} color="#7c3aed" /> Floor Plan
                </p>
                <img src={venue.venueShape} alt="Venue layout" className="vc-floorplan-img" />
              </div>
            )}
          </div>

          <div className="vc-reviews">
            <p className="vc-reviews-title">
              <FaStar size={14} color="#f59e0b" /> Reviews ({venue.reviews?.length || 0})
            </p>

            {venue.reviews?.length > 0 && (
              <div className="vc-reviews-list">
                {venue.reviews.slice().reverse().map((review, i) => (
                  <div key={i} className="vc-review-item">
                    <div className="vc-review-header">
                      <span className="vc-review-name">{review.name}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="vc-review-text">{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="vc-reviews-note">
              Reviews submitted by Users and Organisers who visited this venue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueCard;
