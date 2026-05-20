import React from "react";
import { FaMapMarkerAlt, FaUsers, FaMoneyBillWave, FaCheck, FaImage, FaLayerGroup, FaExternalLinkAlt } from "react-icons/fa";

const VenueSelectCard = ({ venue, selected, onSelect }) => {
  const mapsUrl = venue.latitude && venue.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name} ${venue.city}`)}`;
  const hasTwo = venue.images?.[0] && venue.venueShape;

  return (
    <div onClick={onSelect} className={`venue-select-card${selected ? " selected" : ""}`}>
      <div className="venue-select-card-header">
        <div>
          <h4 className="venue-select-card-name">{venue.name}</h4>
          <div className="venue-select-card-meta">
            <span className="meta-chip"><FaMapMarkerAlt size={11} /> {venue.city}, {venue.state}</span>
            <span className="meta-chip"><FaUsers size={11} /> {venue.capacity?.toLocaleString()} capacity</span>
            <span className="meta-chip"><FaMoneyBillWave size={11} /> ₹{venue.pricePerDay?.toLocaleString()}/day</span>
          </div>
        </div>
        {selected && <FaCheck size={18} color="#16a34a" />}
      </div>
      {venue.layoutDescription && <p className="venue-select-card-desc">{venue.layoutDescription}</p>}
      {(venue.images?.[0] || venue.venueShape) && (
        <div className={hasTwo ? "venue-img-grid-2" : "venue-img-grid-1"}>
          {venue.images?.[0] && (
            <div>
              <p className="venue-img-label"><FaImage size={11} color="#7c3aed" /> Venue Photo</p>
              <img src={venue.images[0]} alt={venue.name} className="venue-img-photo" onClick={e => e.stopPropagation()} />
            </div>
          )}
          {venue.venueShape && (
            <div>
              <p className="venue-img-label"><FaLayerGroup size={11} color="#7c3aed" /> Floor Plan</p>
              <img src={venue.venueShape} alt="Floor plan" className="venue-img-floorplan" onClick={e => e.stopPropagation()} />
            </div>
          )}
        </div>
      )}
      <a href={mapsUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="venue-map-link">
        <FaExternalLinkAlt size={10} /> View Location
      </a>
    </div>
  );
};

export default VenueSelectCard;
