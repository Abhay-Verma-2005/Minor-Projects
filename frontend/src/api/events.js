import apiClient from "./apiClient";

export const getEvents = async (city = "") => {
  const params = city ? `?city=${encodeURIComponent(city)}` : "";
  const { data } = await apiClient.get(`/events${params}`);
  return data;
};

export const getMyEvents = async () => {
  const { data } = await apiClient.get("/events/my-events");
  return data;
};

export const createEvent = async (eventData) => {
  const { data } = await apiClient.post("/events/create", eventData);
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await apiClient.delete(`/events/${id}`);
  return data;
};

export const updateEventStatus = async (id, status) => {
  const { data } = await apiClient.patch(`/events/${id}/status`, { status });
  return data;
};

export const getEventAttendees = async (id) => {
  const { data } = await apiClient.get(`/events/${id}/attendees`);
  return data;
};

export const getPendingRefunds = async (id) => {
  const { data } = await apiClient.get(`/events/${id}/pending-refunds`);
  return data;
};

export const likeEvent = async (id) => {
  const { data } = await apiClient.post(`/events/${id}/like`);
  return data;
};

export const saveEvent = async (id) => {
  const { data } = await apiClient.post(`/events/${id}/save`);
  return data;
};

export const commentOnEvent = async (id, text) => {
  const { data } = await apiClient.post(`/events/${id}/comment`, { text });
  return data;
};

export const toggleAttendance = async (eventId, ticketId, attended) => {
  const { data } = await apiClient.patch(`/events/${eventId}/attendance/${ticketId}`, { attended });
  return data;
};

export const scanQR = async (eventId, qrData) => {
  const { data } = await apiClient.post(`/events/${eventId}/scan`, { qrData });
  return data;
};
