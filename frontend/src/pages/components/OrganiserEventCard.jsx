import React from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaMoneyBillWave,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
  FaExternalLinkAlt,
  FaClock,
  FaUndo,
  FaQrcode,
} from "react-icons/fa";

function getProgressClass(pct) {
  if (pct > 80) return "high";
  if (pct > 50) return "mid";
  return "low";
}

function getStatusClass(status) {
  if (status === "Live") return "event-status-live";
  if (status === "Draft") return "event-status-draft";
  return "event-status-completed";
}

function getMapsUrl(venueId) {
  if (venueId?.latitude && venueId?.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${venueId.latitude},${venueId.longitude}`;
  }
  return null;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTicketStatusBadge(ticket) {
  if (ticket.isCancelled) {
    return <span className="ec-status-badge ec-status-cancelled">Cancelled</span>;
  }
  if (ticket.scannedAt) {
    return <span className="ec-status-badge ec-status-scanned">Checked In</span>;
  }
  return <span className="ec-status-badge ec-status-active">Active</span>;
}

const OrganiserEventCard = ({
  event,
  expanded,
  attendees,
  pendingRefunds,
  onToggleAttendees,
  onDelete,
  onStatusChange,
  onToggleAttendance,
  onProcessRefund,
  onOpenScanner,
  scanEventId,
  scanInput,
  setScanInput,
  scanResult,
  scanLoading,
  onScan,
  onCloseScanner,
  refundProcessing,
  hideAttendeesBtn,
}) => {
  const sold = event.soldTickets || 0;
  const total = event.totalTickets || 1;
  const pct = Math.min(100, Math.round((sold / total) * 100));
  const fillClass = getProgressClass(pct);
  const statusClass = getStatusClass(event.status);
  const mapsUrl = getMapsUrl(event.venueId);
  const isScanOpen = scanEventId === event._id;
  const pendingCount = pendingRefunds?.length || 0;

  return (
    <div className="ec-wrap">

      {event.bannerImage && (
        <img
          src={event.bannerImage}
          alt={event.title}
          className="ec-banner"
        />
      )}

      <div className="ec-body">
        <div className="ec-header">
          <div>
            <span className={`event-status-badge ${statusClass}`}>
              {event.status}
            </span>

            <h3 className="ec-title">{event.title}</h3>

            <div className="ec-chips">
              <span className="meta-chip">
                <FaMapMarkerAlt size={11} />
                {event.venueId?.name}, {event.venueId?.city}
              </span>
              <span className="meta-chip">
                <FaCalendarAlt size={11} />
                {formatDate(event.date)}
              </span>
              <span className="meta-chip">
                <FaMoneyBillWave size={11} />
                ₹{Number(event.ticketPrice).toLocaleString()}
              </span>
            </div>

            {event.hashtags?.length > 0 && (
              <div className="ec-hashtags">
                {event.hashtags.map((tag) => (
                  <span key={tag} className="ec-hashtag">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="ec-actions">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="ec-icon-btn ec-icon-btn-map"
              >
                <FaExternalLinkAlt size={11} /> Map
              </a>
            )}

            {event.status === "Live" && (
              <button
                onClick={onOpenScanner}
                className="ec-icon-btn ec-icon-btn-scan"
                id={`scan-btn-${event._id}`}
              >
                <FaQrcode size={15} /> Scan QR
              </button>
            )}

            <button
              onClick={onDelete}
              className="ec-icon-btn ec-icon-btn-delete"
            >
              <FaTrashAlt />
            </button>

            {!hideAttendeesBtn && (
              <button
                onClick={onToggleAttendees}
                className="ec-icon-btn ec-icon-btn-attendees"
              >
                <FaUsers size={15} /> Attendees{" "}
                {expanded ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
              </button>
            )}
          </div>
        </div>

        <div className="ec-stats">
          <div className="ec-stat-pill">
            <span>Sold</span>
            <strong>{sold}</strong>
          </div>
          <div className="ec-stat-pill">
            <span>Remaining</span>
            <strong>{total - sold}</strong>
          </div>
          {event.cancelledTickets > 0 && (
            <div className="ec-stat-pill cancelled">
              <span>Cancelled</span>
              <strong>{event.cancelledTickets}</strong>
            </div>
          )}
          {pendingCount > 0 && (
            <div className="ec-stat-pill refund">
              <span>Pending Refund</span>
              <strong>{pendingCount}</strong>
            </div>
          )}
        </div>

        <div className="ec-progress-track">
          <div
            className={`ec-progress-fill ${fillClass}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="ec-status-actions">
          {event.status === "Draft" && (
            <span className="meta-chip oec-pending-chip">
              <FaClock size={11} /> Pending Venue Approval
            </span>
          )}
          {event.status === "Live" && (
            <button
              className="btn-secondary status-action-btn"
              onClick={() => onStatusChange("Completed")}
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>

      {isScanOpen && (
        <div className="ec-scanner-panel">
          <div className="ec-scanner-header">
            <span>
              <FaQrcode size={14} color="#7c3aed" /> QR Code Scanner
            </span>
            <button onClick={onCloseScanner} className="ec-scanner-close">
              <FaTimes size={14} />
            </button>
          </div>

          <p className="ec-scanner-hint">
            Paste or enter the QR code hash to validate check-in.
          </p>

          <div className="ec-scanner-input-row">
            <input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Enter QR code hash..."
              className="ec-scanner-input"
              onKeyDown={(e) => e.key === "Enter" && onScan()}
              id={`scan-input-${event._id}`}
            />
            <button
              onClick={onScan}
              disabled={scanLoading || !scanInput.trim()}
              className="book-btn ec-scanner-btn"
            >
              {scanLoading ? "Scanning..." : "Validate"}
            </button>
          </div>

          {scanResult && (
            <div
              className={`ec-scanner-result ${
                scanResult.success ? "ec-scanner-success" : "ec-scanner-fail"
              }`}
            >
              {scanResult.success ? <FaCheck size={12} /> : <FaTimes size={12} />}
              {scanResult.message}
            </div>
          )}
        </div>
      )}

      {expanded && (
        <div className="ec-attendees-expand-area">

          {pendingRefunds?.length > 0 && (
            <div className="ec-refunds-section">
              <p className="ec-attendees-title">
                <FaUndo size={14} color="#ea580c" /> Pending Refunds ({pendingRefunds.length})
              </p>
              <div className="ec-attendees-list-scroll">
                {pendingRefunds.map((booking) => (
                  <div key={booking._id} className="ec-attendee-row ec-refund-row-box">
                    <div className="ec-attendee-info">
                      <p className="ec-attendee-name">
                        {booking.userId?.name || "Unknown"}
                      </p>
                      <p className="ec-attendee-email">
                        {booking.userId?.email || ""}
                      </p>
                    </div>
                    <div className="ec-attendee-meta-box">
                      <p className="ec-attendee-booking-val">
                        ₹{Number(booking.refundAmount || booking.eventId?.ticketPrice || 0).toLocaleString()}
                      </p>
                      <p className="ec-attendee-date-val">
                        {booking.cancelledAt
                          ? new Date(booking.cancelledAt).toLocaleDateString("en-IN")
                          : ""}
                      </p>
                    </div>
                    <button
                      className="ec-refund-action-btn"
                      onClick={() => onProcessRefund(booking._id, event._id)}
                      disabled={refundProcessing === booking._id}
                    >
                      {refundProcessing === booking._id
                        ? "Processing..."
                        : "Process Refund"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="ec-attendees-title">
            Registered Attendees{" "}
            <span className="attendee-count-badge">{attendees?.length || 0}</span>
          </p>

          {!attendees?.length ? (
            <p className="text-muted-sm oec-no-bookings">No bookings yet.</p>
          ) : (
            <div className="ec-attendees-list-scroll">
              {attendees.map((ticket) => {
                const initial = ticket.userId?.name?.charAt(0)?.toUpperCase() || "U";
                const bookingShort = ticket.bookingId?.split("-")[0];
                const purchaseDate = new Date(ticket.purchaseDate).toLocaleDateString("en-IN");

                return (
                  <div key={ticket._id} className="ec-attendee-row-standard">
                    <div className="attendee-avatar-box">{initial}</div>

                    <div className="ec-attendee-info">
                      <p className="ec-attendee-name">{ticket.userId?.name}</p>
                      <p className="ec-attendee-email">{ticket.userId?.email}</p>
                    </div>

                    <div className="ec-attendee-meta-box">
                      <p className="ec-attendee-booking-val">#{bookingShort}</p>
                      <p className="ec-attendee-date-val">{purchaseDate}</p>
                    </div>

                    <div className="ec-attendee-status-column">
                      {getTicketStatusBadge(ticket)}

                      {ticket.refundStatus === "pending" && (
                        <span className="ec-status-badge ec-status-refund">
                          Refund Pending
                        </span>
                      )}
                      {ticket.refundStatus === "completed" && (
                        <span className="ec-status-badge ec-status-refunded">
                          Refunded
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganiserEventCard;
