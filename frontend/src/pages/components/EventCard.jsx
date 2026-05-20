import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHeart, FaRegHeart, FaRegComment, FaTicketAlt,
  FaMapMarkerAlt, FaCalendarAlt, FaTag, FaChair,
  FaPaperPlane, FaUser, FaImages, FaMinus, FaPlus,
} from "react-icons/fa";

function getBarColor(pct) {
  if (pct > 80) return "#ef4444";
  if (pct > 50) return "#f59e0b";
  return "var(--primary)";
}

function formatEventDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const EventCard = ({
  event,
  myId,
  isAuthenticated,
  userRole,
  onLike,
  onComment,
  onBook,
  onOpenDetail,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const liked = event.likes.some((id) => id?.toString() === myId);
  const likeCount = event.likes.length;
  const commCount = event.comments.length;
  const remaining = event.totalTickets - event.soldTickets;
  const isSoldOut = remaining <= 0;
  const pct = Math.min(100, Math.round((event.soldTickets / event.totalTickets) * 100));
  const maxQty = Math.min(10, remaining);
  const barColor = getBarColor(pct);
  const isExpired = event.status === "Completed" || new Date(event.date) < new Date();

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await onComment(commentText.trim());
      setCommentText("");
    } finally {
      setSubmitting(false);
    }
  };

  const decreaseQty = () => setQty((q) => Math.max(1, q - 1));
  const increaseQty = () => setQty((q) => Math.min(maxQty, q + 1));

  const chipData = [
    { icon: <FaCalendarAlt size={10} />, text: formatEventDate(event.date) },
    { icon: <FaMapMarkerAlt size={10} />, text: `${event.venueId?.name || "TBD"}, ${event.venueId?.city || ""}` },
    { icon: <FaTag size={10} />, text: `₹${Number(event.ticketPrice).toLocaleString("en-IN")}` },
    { icon: <FaChair size={10} />, text: `${remaining} seats left` },
  ];

  const canBook = !isExpired && isAuthenticated && !isSoldOut && userRole === "USER";

  return (
    <article className={`ev-card ${isExpired ? "ev-card-expired" : ""}`}>

      <div className="ev-card-head">
        <div className="ev-avatar">
          <FaUser size={14} color="white" />
        </div>
        <div className="ev-card-head-info">
          <p>{event.organiserId?.name || "Organiser"}</p>
          <p><FaMapMarkerAlt size={10} /> {event.venueId?.city || "TBD"}</p>
        </div>
        {isExpired
          ? <span className="ev-ended-badge">Event Ended</span>
          : <span className="ev-live-badge">Live</span>
        }
      </div>

      <div className="ev-banner" onClick={onOpenDetail}>
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.title}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="ev-banner-placeholder">
            <FaTicketAlt size={40} color="#c4b5fd" />
          </div>
        )}
        {event.photos.length > 0 && (
          <div className="ev-photo-hint">
            <FaImages size={12} /> {event.photos.length} more
          </div>
        )}
      </div>

      <div className="ev-actions">
        <button className="ev-action-btn" onClick={onLike}>
          {liked
            ? <FaHeart size={18} color="#ef4444" />
            : <FaRegHeart size={18} />
          }
          <span>{likeCount}</span>
        </button>

        <button className="ev-action-btn" onClick={() => setShowComments((prev) => !prev)}>
          <FaRegComment size={18} />
          <span>{commCount}</span>
        </button>

        <button className="ev-action-btn" onClick={onOpenDetail}>
          <FaImages size={16} />
        </button>

        {isExpired && (
          <span className="ev-book-btn ev-book-btn-disabled" title="This event has ended">
            <FaTicketAlt size={13} /> Event Ended
          </span>
        )}

        {!isExpired && !isAuthenticated && (
          <Link className="ev-signin-link" to="/login">
            <FaTicketAlt size={13} /> Sign in to Book
          </Link>
        )}

        {!isExpired && isAuthenticated && isSoldOut && (
          <span className="ev-soldout">Sold Out</span>
        )}

        {canBook && (
          <div className="ev-qty">
            <div className="ev-qty-picker">
              <button onClick={decreaseQty}><FaMinus size={10} /></button>
              <span>{qty}</span>
              <button onClick={increaseQty}><FaPlus size={10} /></button>
            </div>
            <button className="ev-book-btn" onClick={() => onBook(qty)}>
              <FaTicketAlt size={13} /> Book
            </button>
          </div>
        )}
      </div>

      <div className="ev-body">
        <p className="ev-body-title">{event.title}</p>
        <p className="ev-body-desc">{event.description}</p>

        <div className="ev-chips">
          {chipData.map((chip, i) => (
            <span key={i} className="ev-chip">{chip.icon} {chip.text}</span>
          ))}
        </div>

        {event.hashtags.length > 0 && (
          <div className="ev-hashtags">
            {event.hashtags.map((tag) => (
              <span key={tag} className="ev-hashtag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="ev-seat-bar">
          <div className="ev-seat-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>

        {likeCount > 0 && (
          <p className="ev-like-count">
            {likeCount} {likeCount === 1 ? "person" : "people"} liked this
          </p>
        )}
      </div>

      {showComments && (
        <div className="ev-comments">
          {event.comments.length > 0 ? (
            <div className="ev-comment-list">
              {event.comments.slice().reverse().map((c) => (
                <div key={c._id} className="ev-comment">
                  <div className="ev-comment-avatar">
                    <FaUser size={10} color="var(--primary)" />
                  </div>
                  <div className="ev-comment-bubble">
                    <p>{c.name}</p>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="ev-comment-empty">No comments yet. Be the first!</p>
          )}

          {isAuthenticated ? (
            <form className="ev-comment-form" onSubmit={handleComment}>
              <input
                className="ev-comment-input"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                className={`ev-comment-send ${commentText.trim() ? "active" : "inactive"}`}
                disabled={submitting || !commentText.trim()}
              >
                <FaPaperPlane size={13} />
              </button>
            </form>
          ) : (
            <Link className="ev-comment-signin" to="/login">Sign in to comment</Link>
          )}
        </div>
      )}
    </article>
  );
};

export default EventCard;