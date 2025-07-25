import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Shield, 
  Plus,
  Search, 
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  User,
  BarChart3,
  Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';

const Moderation = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [stats, setStats] = useState(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements();
      fetchStats();
    }
  }, [isAdmin, currentPage, searchQuery]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        active: 'false', // Show all announcements for admin
      };
      
      const response = await announcementAPI.getAllAnnouncements(params);
      setAnnouncements(response.announcements || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await announcementAPI.getAnnouncementStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateAnnouncement = async (data) => {
    try {
      await announcementAPI.createAnnouncement(data);
      toast.success('Announcement created and notifications sent!');
      fetchAnnouncements();
      fetchStats();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleUpdateAnnouncement = async (id, data) => {
    try {
      await announcementAPI.updateAnnouncement(id, data);
      toast.success('Announcement updated successfully');
      fetchAnnouncements();
      fetchStats();
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement? This will also delete all related notifications.')) {
      try {
        await announcementAPI.deleteAnnouncement(id);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
        fetchStats();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Failed to delete announcement');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the moderation panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-2">
              <Megaphone className="h-8 w-8" />
              <span>Announcement Management</span>
            </h1>
            <p className="text-dark-300">Create and manage system announcements</p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Announcement</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-300">Total Announcements</p>
                  <p className="text-2xl font-semibold text-white">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-300">Active</p>
                  <p className="text-2xl font-semibold text-white">{stats.active}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-300">High Priority</p>
                  <p className="text-2xl font-semibold text-white">
                    {stats.byPriority?.find(p => p.priority === 'high')?.count || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-dark-300">Urgent</p>
                  <p className="text-2xl font-semibold text-white">
                    {stats.byPriority?.find(p => p.priority === 'urgent')?.count || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading announcements..." />
          </div>
        ) : announcements.length > 0 ? (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTypeIcon(announcement.type)}
                      <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                      {announcement.isActive ? (
                        <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-600 text-white rounded-full">Inactive</span>
                      )}
                    </div>
                    
                    <p className="text-dark-300 mb-3">{announcement.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-dark-400">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>By {announcement.creator?.fullName || announcement.creator?.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(announcement.created_at)}</span>
                      </div>
                      {announcement.expiresAt && (
                        <div className="flex items-center space-x-1">
                          <span>Expires: {formatDate(announcement.expiresAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingAnnouncement(announcement)}
                      className="p-2 text-dark-400 hover:text-blue-400 hover:bg-dark-700 rounded"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Megaphone className="h-16 w-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No announcements found</h3>
            <p className="text-dark-400 mb-6">Create your first announcement to get started!</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Announcement
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingAnnouncement) && (
          <AnnouncementModal
            announcement={editingAnnouncement}
            onSave={editingAnnouncement ? 
              (data) => handleUpdateAnnouncement(editingAnnouncement.id, data) : 
              handleCreateAnnouncement
            }
            onCancel={() => {
              setShowCreateModal(false);
              setEditingAnnouncement(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Announcement Modal Component
const AnnouncementModal = ({ announcement, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: announcement?.title || '',
    content: announcement?.content || '',
    type: announcement?.type || 'info',
    priority: announcement?.priority || 'medium',
    isActive: announcement?.isActive !== undefined ? announcement.isActive : true,
    expiresAt: announcement?.expiresAt ? announcement.expiresAt.split('T')[0] : '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    const submitData = {
      ...formData,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };
    
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-4">
          {announcement ? 'Edit Announcement' : 'Create Announcement'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field w-full"
              placeholder="Enter announcement title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input-field w-full h-32"
              placeholder="Enter announcement content..."
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input-field w-full"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input-field w-full"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Expires At (Optional)</label>
            <input
              type="date"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="input-field w-full"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-dark-600 bg-dark-700 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-dark-300">
              Active (visible to users)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {announcement ? 'Update' : 'Create'} Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Moderation;
