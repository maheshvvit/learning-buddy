const mongoose = require('mongoose');

const LearningPathSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: Number, default: 0 }, // Duration in hours
  topics: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LearningPath', LearningPathSchema);
