const mongoose = require('mongoose');

const organiserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'ORGANISER' }
}, { timestamps: true });

module.exports = mongoose.model('Organiser', organiserSchema);
