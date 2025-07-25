const { Announcement, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Create a new announcement (Admin only)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type = 'info', priority = 'medium', expiresAt } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      type,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user.id,
    });

    // Create notifications for all users
    const users = await User.findAll({ attributes: ['id'] });
    const notifications = users.map(user => ({
      userId: user.id,
      type: 'announcement',
      title: `📢 ${title}`,
      message: content,
      priority,
      relatedId: announcement.id,
      relatedType: 'announcement',
    }));

    await Notification.bulkCreate(notifications);

    const createdAnnouncement = await Announcement.findByPk(announcement.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName'],
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created and notifications sent',
      announcement: createdAnnouncement,
    });
  } catch (error) {
    next(error);
  }
};

// Get all announcements
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, active = true } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (active === 'true') {
      whereClause.isActive = true;
      whereClause[Op.or] = [
        { expiresAt: null },
        { expiresAt: { [Op.gte]: new Date() } }
      ];
    }

    const announcements = await Announcement.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName'],
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      announcements: announcements.rows,
      total: announcements.count,
      page: parseInt(page),
      totalPages: Math.ceil(announcements.count / limit),
    });
  } catch (error) {
    next(error);
  }
};

// Get active announcements (for regular users)
exports.getActiveAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gte]: new Date() } }
        ]
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName'],
      }],
      order: [['priority', 'DESC'], ['created_at', 'DESC']],
      limit: 5, // Only show latest 5 active announcements
    });

    res.json({
      success: true,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// Update announcement (Admin only)
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, type, priority, isActive, expiresAt } = req.body;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.update({
      title: title || announcement.title,
      content: content || announcement.content,
      type: type || announcement.type,
      priority: priority || announcement.priority,
      isActive: isActive !== undefined ? isActive : announcement.isActive,
      expiresAt: expiresAt ? new Date(expiresAt) : announcement.expiresAt,
    });

    const updatedAnnouncement = await Announcement.findByPk(id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName'],
      }],
    });

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    next(error);
  }
};

// Delete announcement (Admin only)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Delete related notifications
    await Notification.destroy({
      where: {
        relatedId: id,
        relatedType: 'announcement',
      }
    });

    await announcement.destroy();

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get announcement statistics (Admin only)
exports.getAnnouncementStats = async (req, res, next) => {
  try {
    const totalAnnouncements = await Announcement.count();
    const activeAnnouncements = await Announcement.count({
      where: {
        isActive: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gte]: new Date() } }
        ]
      }
    });

    const announcementsByType = await Announcement.findAll({
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['type'],
      raw: true,
    });

    const announcementsByPriority = await Announcement.findAll({
      attributes: [
        'priority',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['priority'],
      raw: true,
    });

    res.json({
      success: true,
      stats: {
        total: totalAnnouncements,
        active: activeAnnouncements,
        byType: announcementsByType,
        byPriority: announcementsByPriority,
      },
    });
  } catch (error) {
    next(error);
  }
};
