import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {FaSearch, FaBuilding, FaCalendarAlt, FaTicketAlt, FaQrcode,FaShieldAlt, FaInstagram, FaLinkedin, FaGithub,FaMapMarkerAlt, FaArrowRight, FaCompass, FaCheckCircle, FaStar} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Navbar from "./Navbar";
import "./styles/home.css";
import { getFeedbackSummary } from "../api/feedback";

const LandingPage = () => (
  <div className="main-container">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <FeedbackSection />
    <FooterSection />
  </div>
);

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) navigate(`/events?search=${encodeURIComponent(query.trim())}`);
    else navigate("/events");
  };

  return (
    <section className="hero">
      <h1 className="hero-title">
        Dream it. Plan it.<br />Your Event,<span className="outline-text"> LIVE.</span>
      </h1>

      <p className="hero-info">
        Experience the easiest way to discover venues, manage events, and
        book digital e-tickets instantly.
      </p>

      <div className="search-bar">
        <FaMapMarkerAlt className="icon" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Search by event or city..."
        />
        <button onClick={handleSearch} className="search-btn">
          <FaSearch /> 
        </button>
      </div>

      <div className="cta-buttons">
        <Link to="/signup" className="signup-btn">
          Get Started <FaArrowRight />
        </Link>
      </div>
    </section>
  );
};

const FEATURES = [
  { icon: FaBuilding, title: "Venue Listing", desc: "List spaces with details, capacity, pricing." },
  { icon: FaCompass, title: "Venue Discovery", desc: "Filter venues by location and reviews." },
  { icon: FaCalendarAlt, title: "Event Management", desc: "Create and manage events easily." },
  { icon: FaTicketAlt, title: "Digital Booking", desc: "Real-time ticket booking system." },
  { icon: FaQrcode, title: "QR E-Ticket", desc: "Instant secure QR tickets." },
  { icon: FaShieldAlt, title: "Auth Security", desc: "Role-based secure access." }
];

const FeaturesSection = () => (
  <section className="home-features">
    <div className="home-features-header">
      <p className="tag"><FaStar /> THE EVENTICK SUITE</p>
      <h2>Platform Features</h2>
      <p className="sub">
        Complete event lifecycle platform from discovery to booking.
      </p>
    </div>

    <div className="home-features-grid">
      {FEATURES.map((f, i) => (
        <div key={i} className="feature-card">
          <div className="icon-box"><f.icon /></div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const FeedbackSection = () => {
  const [data, setData] = useState({ averageRating: 0, totalReviews: 0, topComments: [] });
  
  useEffect(() => {
    getFeedbackSummary().then(res => {
      if (res.success) setData(res.data);
    }).catch(err => console.error(err));
  }, []);


  return (
    <section className="feedback-section">
      <div className="feedback-header">
        <p className="tag"><FaStar /> PEOPLE'S THOUGHT SUITE</p>
        <h2>People's Thoughts</h2>
        {data.totalReviews > 0 ? (
          <div className="feedback-stats-pill">
            <div className="feedback-stars-row">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} color={i < Math.round(data.averageRating) ? '#eab308' : '#e2e8f0'} />
              ))}
            </div>
            <div className="feedback-divider" />
            <span className="feedback-avg">{data.averageRating}</span>
            <span className="feedback-count">({data.totalReviews} global reviews)</span>
          </div>
        ) : (
          <p className="lp-no-reviews">Be the first to experience and review Eventick!</p>
        )}
      </div>
      
      {data.topComments.length > 0 && (
        <div className="testimonial-grid">
          {data.topComments.map(comment => (
            <div key={comment._id} className="testimonial-card">
              <div className="testimonial-quote">"</div>
              
              <div className="testimonial-stars">
                {[...Array(comment.rating)].map((_, i) => <FaStar key={i} />)}
              </div>
              
              <p className="testimonial-text">
                "{comment.comment}"
              </p>
              
              <div className="testimonial-footer">
                <div className="testimonial-avatar">
                  {comment.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong className="testimonial-name">{comment.userName}</strong>
                  <span className="testimonial-role">{comment.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};


const FooterSection = () => (
  <footer className="footer">
    <div className="footer-grid">
      <div>
        <Link to="/" className="logo-link">
          <img src={"/logo.png"} className="logo-img" />
          <span className="logo-text">EvenTick</span>
        </Link>
        <p>All-in-one platform for events.</p>
        <div className="socials">
          <FaInstagram onClick={() => window.open("https://www.instagram.com/the_a.b.h.a.y", "_blank")} />
          <FaXTwitter onClick={() => window.open("https://www.twitter.com/ABHAYVERMA78471", "_blank")} />
          <FaLinkedin onClick={() => window.open("https://www.linkedin.com/in/abhay-verma-990735281/", "_blank")} />
          <FaGithub onClick={() => window.open("https://www.github.com/Abhay-Verma-2005/", "_blank")} />
        </div>
      </div>

      {["Platform", "Resources", "Company"].map(col => (
        <div key={col}>
          <h4>{col}</h4>
          <ul>
            <li>Link 1</li>
            <li>Link 2</li>
            <li>Link 3</li>
          </ul>
        </div>
      ))}
    </div>

    <div className="copyright">
      © {new Date().getFullYear()} EvenTick
    </div>
  </footer>
);

export default LandingPage;