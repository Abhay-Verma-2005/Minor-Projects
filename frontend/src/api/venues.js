import apiClient from "./apiClient";

export const getVenues = async (city = "", state = "") => {
  const params = new URLSearchParams();
  if (city)  params.set("city",  city);
  if (state) params.set("state", state);
  const { data } = await apiClient.get(`/venues?${params.toString()}`);
  return data;
};

export const getMyVenues = async () => {
  const { data } = await apiClient.get("/venues/my-venues");
  return data;
};

export const getVenueById = async (id) => {
  const { data } = await apiClient.get(`/venues/${id}`);
  return data;
};

export const createVenue = async (venueData) => {
  const { data } = await apiClient.post("/venues/create", venueData);
  return data;
};

export const deleteVenue = async (id) => {
  const { data } = await apiClient.delete(`/venues/${id}`);
  return data;
};

export const addVenueReview = async (id, rating, text) => {
  const { data } = await apiClient.post(`/venues/${id}/review`, { rating, text });
  return data;
};


export const getVenueBookings = async (venueId) => {
  const { data } = await apiClient.get(`/venues/${venueId}/bookings`);
  return data;
};

export const bookVenue = async (venueId, { eventId, startDate, endDate }) => {
  const { data } = await apiClient.post(`/venues/${venueId}/book`, { eventId, startDate, endDate });
  return data;
};

export const acceptVenueBooking = async (venueId, bookingId) => {
  const { data } = await apiClient.patch(`/venues/${venueId}/booking/${bookingId}/accept`);
  return data;
};

export const rejectVenueBooking = async (venueId, bookingId) => {
  const { data } = await apiClient.patch(`/venues/${venueId}/booking/${bookingId}/reject`);
  return data;
};
