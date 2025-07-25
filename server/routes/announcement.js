const express = require('express');
const {
  createAnnouncement,
  getAnnouncements,
  getActiveAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementStats,
} = require('../controllers/announcementController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes (for all users)
router.get('/active', getActiveAnnouncements);

// Protected routes (authentication required)
router.use(auth);

// Admin-only routes
router.post('/', requireRole(['admin']), createAnnouncement);
router.get('/', requireRole(['admin']), getAnnouncements);
router.get('/stats', requireRole(['admin']), getAnnouncementStats);
router.put('/:id', requireRole(['admin']), updateAnnouncement);
router.delete('/:id', requireRole(['admin']), deleteAnnouncement);

module.exports = router;
