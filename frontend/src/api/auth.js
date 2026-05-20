import axios from "axios";
const API_BASE = (import.meta.env.VITE_API_URL || "/api/v1") + "/auth";
export const registerUser = async (name, email, password, role = "USER") => {
  const response = await axios.post(`${API_BASE}/register`, {
    name,
    email,
    password,
    role
  });
  return response.data;
};
export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE}/login`, {
    email,
    password,
  });
  return response.data;
};
