const express = require('express');
const router = express.Router();
const homeSectionController = require('../controllers/homeSectionController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to fetch all homepage customizable sections
router.get('/', homeSectionController.getAllSections);
router.get('/:sectionKey', homeSectionController.getSectionByKey);

// Admin routes to update content & upload images
router.put('/:sectionKey', authMiddleware, homeSectionController.updateSection);
router.post('/upload', authMiddleware, upload.single('image'), homeSectionController.uploadSectionImage);

module.exports = router;
