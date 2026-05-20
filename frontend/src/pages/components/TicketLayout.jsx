import React from "react";
import {
  FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave,
  FaTimesCircle, FaUser, FaQrcode, FaStar,
  FaHourglassEnd, FaBan, FaInfoCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../styles/ticket.css";

function getBadgeInfo(status) {
  if (status === "expired") return { cls: "pt-badge-expired", text: "Expired" };
  if (status === "cancelled") return { cls: "pt-badge-cancelled", text: "Cancelled" };
  return { cls: "pt-badge-active", text: "Valid Pass" };
}

function getWrapClass(status) {
  if (status === "expired") return "premium-ticket-wrap ticket-expired";
  if (status === "cancelled") return "premium-ticket-wrap ticket-gray";
  return "premium-ticket-wrap";
}

function getScanText(status) {
  if (status === "expired") return "Event Ended";
  if (status === "cancelled") return "Void";
  return "Scan for Entry";
}

function getVenueAddress(venueId) {
  if (venueId?.address) return ` — ${venueId.address}`;
  if (venueId?.city) return `, ${venueId.city}`;
  return "";
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const TicketLayout = ({ ticket, onCancel, cancelTarget, setCancelTarget }) => {
  const { user } = useAuth();
  const ev = ticket.eventId;

  if (!ev) return null;

  const status = ticket.status || (ticket.cancelled ? "cancelled" : "active");
  const isCancelled = status === "cancelled";
  const isExpired = status === "expired";
  const isActive = status === "active";
  const canCancel = ticket.canCancel === true;
  const badge = getBadgeInfo(status);
  const themeImg = ev.ticketTheme || "";

  return (
    <div className={getWrapClass(status)}>

      {themeImg && (
        <div className="pt-theme-bg" aria-hidden="true">
          <img src={themeImg} alt="" className="pt-theme-bg-img" />
        </div>
      )}

      <div className="pt-left">
        <div className="pt-header">
          <div className="pt-title-col">
            <h3 className="pt-title">{ev.title}</h3>
            <p className="pt-admit-name">
              <FaUser className="pt-admit-icon" />
              Admit One: <strong>{user?.user?.name || "Guest"}</strong>
            </p>
          </div>

          <span className={`pt-badge ${badge.cls}`}>
            {isExpired && <FaHourglassEnd size={10} className="pt-icon-gap" />}
            {isCancelled && <FaBan size={10} className="pt-icon-gap" />}
            {badge.text}
          </span>
        </div>

        <div className="pt-details">
          <div className="pt-detail-item">
            <div className="pt-icon-wrap"><FaCalendarAlt className="pt-icon" /></div>
            <div className="pt-detail-text">
              <span className="pt-detail-label">Date & Time</span>
              <span className="pt-detail-value">{formatDateTime(ev.date)}</span>
            </div>
          </div>

          <div className="pt-detail-item">
            <div className="pt-icon-wrap"><FaMapMarkerAlt className="pt-icon" /></div>
            <div className="pt-detail-text">
              <span className="pt-detail-label">Venue & Address</span>
              <span className="pt-detail-value">
                {ev.venueId?.name || "Unknown Venue"}
                {getVenueAddress(ev.venueId)}
              </span>
            </div>
          </div>

          <div className="pt-detail-item">
            <div className="pt-icon-wrap"><FaMoneyBillWave className="pt-icon" /></div>
            <div className="pt-detail-text">
              <span className="pt-detail-label">Amount Paid</span>
              <span className="pt-detail-value">
                ₹{Number(ev.ticketPrice || 0).toLocaleString()}
                <span className="pt-payment-status">
                  {" · "}{ticket.paymentStatus || "SUCCESS"}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="pt-meta-row">
          <div className="pt-meta-col">
            <span className="pt-meta-label">Booking ID</span>
            <span className="pt-meta-val">
              {ticket.bookingId?.split("-")[0].toUpperCase()}
            </span>
          </div>

          {ticket.seatNumber && (
            <div className="pt-meta-col">
              <span className="pt-meta-label">Seat</span>
              <span className="pt-meta-val">{ticket.seatNumber}</span>
            </div>
          )}

          <div className="pt-meta-right">
            {isActive && (
              <>
                {canCancel ? (
                  cancelTarget === ticket._id ? (
                    <div className="pt-cancel-confirm">
                      <span className="pt-confirm-msg">Cancel this booking?</span>
                      <button
                        className="tab-btn tab-btn-danger tab-btn-sm"
                        onClick={() => onCancel(ticket._id)}
                      >
                        Yes, Cancel
                      </button>
                      <button
                        className="tab-btn tab-btn-secondary tab-btn-sm"
                        onClick={() => setCancelTarget(null)}
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      className="pt-cancel-btn"
                      onClick={() => setCancelTarget(ticket._id)}
                    >
                      <FaTimesCircle size={13} /> Cancel Ticket
                    </button>
                  )
                ) : (
                  <div className="pt-cancel-closed" title="Cancellation is closed within 6 hours of the event">
                    <FaInfoCircle size={12} />
                    <span>Cancellation closed</span>
                  </div>
                )}
              </>
            )}

            {isCancelled && ticket.cancelledAt && (
              <div className="pt-cancelled-date">
                <div className="pt-cancel-date-gap">
                  Cancelled on {formatDateTime(ticket.cancelledAt)}
                </div>
                <div className={`pt-refund-status ${ticket.refundStatus === "completed" ? "pt-refund-ok" : "pt-refund-pending"}`}>
                  Refund: {ticket.refundStatus === "completed"
                    ? `Refunded ₹${Number(ticket.refundAmount || 0).toLocaleString()}`
                    : "Pending"
                  }
                </div>
              </div>
            )}

            {isActive && ticket.scannedAt && (
              <div className="pt-cancelled-date pt-checkin-date">
                Checked in at {formatDateTime(ticket.scannedAt)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-divider">
        <div className="pt-notch pt-notch-top"></div>
        <div className="pt-notch pt-notch-bottom"></div>
      </div>

      <div className="pt-right">
        <div className="pt-vip-band"><FaStar size={10} /> ACCESS</div>
        {ticket.qrImage ? (
          <img src={ticket.qrImage} alt="QR Code" className="pt-qr" />
        ) : (
          <div className="pt-no-qr"><FaQrcode size={32} /></div>
        )}
        <p className="pt-scan">{getScanText(status)}</p>
      </div>
    </div>
  );
};

export default TicketLayout;
