require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const venueRoutes = require('./routes/venueRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const statsRoutes = require('./routes/statsRoutes');

const { initCronJobs } = require('./cron/scheduler');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('backend server running');
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventick';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    initCronJobs();
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); // Exit if DB connection fails
  });

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/venues', venueRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/stats', statsRoutes);

const strictRouter = express.Router();
const { authMiddleware, roleMiddleware } = require('./middlewares/auth');

strictRouter.get('/organizer/events', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  const Event = require('./models/Event');
  const events = await Event.find({ organiserId: req.user.id }).select('_id title');
  res.json(events.map(e => ({ event_id: e._id, event_name: e.title })));
});

strictRouter.get('/organizer/events/:event_id/attendees', authMiddleware, roleMiddleware(['ORGANISER']), async (req, res) => {
  req.params.id = req.params.event_id;
  const eventRoutesRouter = require('./routes/eventRoutes');
  req.url = `/${req.params.id}/attendees`;
  eventRoutesRouter(req, res, () => {});
});

strictRouter.post('/organizer/refunds/process', authMiddleware, roleMiddleware(['ORGANISER']), (req, res) => {
  const bookingRoutesRouter = require('./routes/bookingRoutes');
  req.url = '/process-refund';
  bookingRoutesRouter(req, res, () => {});
});

strictRouter.get('/user/notifications', authMiddleware, (req, res) => {
  const notificationRoutesRouter = require('./routes/notificationRoutes');
  req.url = '/';
  notificationRoutesRouter(req, res, () => {});
});

strictRouter.get('/organizer/notifications', authMiddleware, roleMiddleware(['ORGANISER']), (req, res) => {
  const notificationRoutesRouter = require('./routes/notificationRoutes');
  req.url = '/';
  notificationRoutesRouter(req, res, () => {});
});

app.use('/api', strictRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running properly on: http://localhost:${PORT} with Role-based Auth`);
});
