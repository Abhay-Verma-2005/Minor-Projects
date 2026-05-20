import { useState, useEffect, useCallback } from "react";
import {
  FaBuilding, FaMapMarkerAlt, FaUsers, FaMoneyBillWave,
  FaChevronLeft, FaCalendarAlt, FaCheck, FaTimesCircle
} from "react-icons/fa";
import { getVenueBookings, acceptVenueBooking, rejectVenueBooking } from "../../api/venues";
import VenueCalendar from "./VenueCalendar";

const VenueDetail = ({ venue, onBack, onDelete }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVenueBookings(venue._id);
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [venue._id]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleAccept = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await acceptVenueBooking(venue._id, bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await rejectVenueBooking(venue._id, bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <div>
      <div className="vd-top-wrap">
        <button className="btn-secondary vd-back-btn" onClick={onBack}>
          <FaChevronLeft size={11} /> Back to Venues
        </button>
        <div className="vc-wrap">
          <div className="vc-header">
            {venue.images?.[0]
              ? <img src={venue.images[0]} alt={venue.name} className="vc-thumb" />
              : <div className="vc-thumb-placeholder"><FaBuilding size={24} color="#c4b5fd" /></div>}
            <div className="vc-info">
              <h3 className="vc-name">{venue.name}</h3>
              <div className="vc-chips">
                <span className="meta-chip"><FaMapMarkerAlt size={11} /> {venue.city}, {venue.state}</span>
                <span className="meta-chip"><FaUsers size={11} /> {venue.capacity?.toLocaleString()} cap.</span>
                <span className="meta-chip"><FaMoneyBillWave size={11} /> ₹{venue.pricePerDay?.toLocaleString()}/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner"></div>Loading venue data...</div>
      ) : (
        <>
          <div className="panel vd-cal-panel">
            <div className="panel-title"><FaCalendarAlt size={15} /> Venue Calendar</div>
            <VenueCalendar bookings={bookings} />
          </div>

          <div className="panel">
            <div className="panel-title"><FaCalendarAlt size={15} /> Booking History ({bookings.length})</div>
            {bookings.length === 0 ? (
              <p className="text-muted-sm">No booking history for this venue.</p>
            ) : (
              <div className="vd-table-wrap">
                <table className="vd-table">
                  <thead>
                    <tr>
                      <th>Organiser</th>
                      <th>Event</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Days</th>
                      <th>₹/Day</th>
                      <th>Total ₹</th>
                      <th>Status</th>
                      <th>Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id}>
                        <td>{b.organiserId?.name || "—"}</td>
                        <td>{b.eventId?.title || "—"}</td>
                        <td>{fmt(b.startDate)}</td>
                        <td>{fmt(b.endDate)}</td>
                        <td>{b.days}</td>
                        <td>₹{venue.pricePerDay?.toLocaleString()}</td>
                        <td>₹{Number(b.totalPrice || 0).toLocaleString()}</td>
                        <td>
                          {b.status === 'pending' ? (
                            <div className="vd-request-actions">
                              <button className="vd-accept-btn" disabled={actionLoading === b._id} onClick={() => handleAccept(b._id)}>
                                <FaCheck size={10} /> Accept
                              </button>
                              <button className="vd-reject-btn" disabled={actionLoading === b._id} onClick={() => handleReject(b._id)}>
                                <FaTimesCircle size={10} /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`status-badge status-${b.status}`}>{b.status}</span>
                          )}
                        </td>
                        <td>{fmt(b.bookedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VenueDetail;
