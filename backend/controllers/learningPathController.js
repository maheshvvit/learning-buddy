const LearningPath = require('../models/LearningPath');

// Get all learning paths
exports.getAllLearningPaths = async (req, res) => {
  try {
    const learningPaths = await LearningPath.find();
    res.json(learningPaths);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch learning paths', error });
  }
};

// Get learning path by ID
exports.getLearningPathById = async (req, res) => {
  try {
    const learningPath = await LearningPath.findById(req.params.id);
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    res.json(learningPath);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch learning path', error });
  }
};

// Create a new learning path
exports.createLearningPath = async (req, res) => {
  try {
    const newLearningPath = new LearningPath(req.body);
    const savedLearningPath = await newLearningPath.save();
    res.status(201).json(savedLearningPath);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create learning path', error });
  }
};

// Update a learning path
exports.updateLearningPath = async (req, res) => {
  try {
    const updatedLearningPath = await LearningPath.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedLearningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    res.json(updatedLearningPath);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update learning path', error });
  }
};

// Delete a learning path
exports.deleteLearningPath = async (req, res) => {
  try {
    const deletedLearningPath = await LearningPath.findByIdAndDelete(req.params.id);
    if (!deletedLearningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }
    res.json({ message: 'Learning path deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete learning path', error });
  }
};
