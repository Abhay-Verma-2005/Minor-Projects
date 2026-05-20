import { FaTimes, FaStar, FaCommentAlt } from "react-icons/fa";
import { submitFeedback } from "../../api/feedback";
import { useState } from "react";

const FeedbackModal = ({ userName, userEmail, onClose, onLogout }) => {
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      setFeedbackStatus("Please select a rating.");
      return;
    }
    setFeedbackStatus("Submitting...");
    try {
      await submitFeedback({ rating: feedbackRating, comment: feedbackComment });
      setFeedbackStatus("Feedback submitted! Thank you.");
      setFeedbackRating(0);
      setFeedbackComment("");
      setTimeout(() => setFeedbackStatus(""), 3000);
    } catch {
      setFeedbackStatus("Failed to submit feedback.");
    }
  };

  const isError = feedbackStatus.includes("Failed") || feedbackStatus.includes("Please");

  return (
    <div className="fm-overlay" onClick={onClose}>
      <div className="panel fm-box" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="fm-close">
          <FaTimes />
        </button>
        <div className="panel-title fm-title"><FaCommentAlt size={16} color="var(--brand)" /> Feedback</div>

        <div className="field fm-field-gap">
          <label>Name</label>
          <input type="text" value={userName} readOnly disabled className="fm-input-ro" />
        </div>
        <div className="field fm-field-gap">
          <label>Email Address</label>
          <input type="text" value={userEmail} readOnly disabled className="fm-input-ro" />
        </div>

        <div className="fm-card">
          <h4 className="fm-heading">Give us your feedback</h4>
          <p className="fm-subtext">Your thoughts help us improve Eventick.</p>

          <div className="fm-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <FaStar
                key={star}
                size={24}
                color={star <= feedbackRating ? '#eab308' : '#cbd5e1'}
                className={`fm-star ${star <= feedbackRating ? 'fm-star-active' : ''}`}
                onClick={() => setFeedbackRating(star)}
              />
            ))}
          </div>

          <textarea
            placeholder="Share your experience with us..."
            value={feedbackComment}
            onChange={e => setFeedbackComment(e.target.value)}
            className="fm-textarea"
          />

          <button onClick={handleFeedbackSubmit} className="fm-submit">
            Submit Feedback
          </button>

          {feedbackStatus && (
            <div className={`fm-status ${isError ? 'fm-status-err' : 'fm-status-ok'}`}>
              {feedbackStatus}
            </div>
          )}
        </div>

        <div className="fm-btns">
          <button className="book-btn fm-btn-flex" onClick={onClose}>Done</button>
          <button className="tab-btn-danger fm-logout" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
