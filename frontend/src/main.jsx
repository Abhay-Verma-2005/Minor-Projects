import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/Login";
import SignUp from "./pages/Signup";
import EventsPage from "./pages/EventsPage";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event" element={<EventsPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);