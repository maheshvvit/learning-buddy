const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPathController');

// Get all learning paths
router.get('/', learningPathController.getAllLearningPaths);

// Get learning path by ID
router.get('/:id', learningPathController.getLearningPathById);

// Create a new learning path
router.post('/', learningPathController.createLearningPath);

// Update a learning path
router.put('/:id', learningPathController.updateLearningPath);

// Delete a learning path
router.delete('/:id', learningPathController.deleteLearningPath);

module.exports = router;
