function formatDateString(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCellClass(dateStr, todayStr, booked, selected) {
  const isPast = dateStr < todayStr;
  const isToday = dateStr === todayStr;

  if (isToday && booked) return "vcal-cell vcal-today-booked";
  if (isToday) return "vcal-cell vcal-today";
  if (isPast && booked) return "vcal-cell vcal-past-booked";
  if (booked) return "vcal-cell vcal-booked";
  if (isPast) return "vcal-cell vcal-past";
  if (selected) return "vcal-cell vcal-selected";
  return "vcal-cell";
}

function MonthCalendar({ month, today, bookedDates, onDateClick, selectedDates, mode }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const monthName = month.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const todayStr = formatDateString(today);

  const cells = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="vcal-cell vcal-empty" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isBooked = bookedDates.has(dateStr);
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;
    const isSelected = selectedDates?.has(dateStr);
    const canSelect = mode === "select" && !isPast && !isBooked && !isToday;

    let className = getCellClass(dateStr, todayStr, isBooked, isSelected);
    if (canSelect) className += " vcal-selectable";
    if (isBooked && !isPast && !canSelect) className += " vcal-locked";

    cells.push(
      <div
        key={day}
        className={className}
        onClick={canSelect ? () => onDateClick?.(dateStr) : undefined}
      >
        <span className="vcal-day">{day}</span>
      </div>
    );
  }

  return (
    <div className="vcal-month">
      <div className="vcal-month-title">{monthName}</div>
      <div className="vcal-weekdays">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="vcal-wday">{d}</div>
        ))}
      </div>
      <div className="vcal-days">{cells}</div>
    </div>
  );
}

function buildBookedDatesSet(bookings) {
  const bookedDates = new Set();

  (bookings || []).forEach((booking) => {
    if (booking.status !== "confirmed" && booking.status !== "accepted") return;

    const from = new Date(booking.startDate || booking.dateFrom);
    const to = new Date(booking.endDate || booking.dateTo || booking.startDate || booking.dateFrom);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    const cursor = new Date(from);
    while (cursor <= to) {
      bookedDates.add(formatDateString(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return bookedDates;
}

function buildSelectedDatesSet(start, end) {
  const selectedDates = new Set();
  if (!start) return selectedDates;

  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  if (!end) {
    selectedDates.add(formatDateString(startDate));
    return selectedDates;
  }

  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    selectedDates.add(formatDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return selectedDates;
}

const VenueCalendar = ({ bookings, onDateClick, selectionStart, selectionEnd, mode = "view" }) => {
  const today = new Date();
  const months = [
    new Date(today.getFullYear(), today.getMonth() - 1, 1),
    new Date(today.getFullYear(), today.getMonth(), 1),
    new Date(today.getFullYear(), today.getMonth() + 1, 1),
    new Date(today.getFullYear(), today.getMonth() + 2, 1),
  ];

  const bookedDates = buildBookedDatesSet(bookings);
  const selectedDates = buildSelectedDatesSet(selectionStart, selectionEnd);

  return (
    <div className="vcal-grid">
      {months.map((month, index) => (
        <MonthCalendar
          key={index}
          month={month}
          today={today}
          bookedDates={bookedDates}
          onDateClick={onDateClick}
          selectedDates={selectedDates}
          mode={mode}
        />
      ))}

      <div className="vcal-legend vcal-legend-full">
        <span className="vcal-legend-item">
          <span className="vcal-legend-dot vcal-dot-today" /> Today
        </span>
        <span className="vcal-legend-item">
          <span className="vcal-legend-dot vcal-dot-booked" /> Booked
        </span>
        <span className="vcal-legend-item">
          <span className="vcal-legend-dot vcal-dot-past" /> Past Booked
        </span>
        {mode === "select" && (
          <span className="vcal-legend-item">
            <span className="vcal-legend-dot vcal-dot-sel" /> Selected
          </span>
        )}
      </div>
    </div>
  );
};

export default VenueCalendar;
