import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collaborationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Plus, 
  Users, 
  Clock, 
  Globe, 
  Lock, 
  Play, 
  Pause,
  MessageCircle,
  Code,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Collaborate = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await collaborationAPI.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load collaboration rooms');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && room.isActive) ||
                         (filterStatus === 'inactive' && !room.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-600',
      python: 'bg-blue-600',
      java: 'bg-orange-600',
      cpp: 'bg-purple-600',
      css: 'bg-pink-600',
      html: 'bg-red-600',
      typescript: 'bg-blue-500',
      php: 'bg-indigo-600',
      ruby: 'bg-red-500',
      go: 'bg-cyan-600'
    };
    return colors[language] || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Collaboration Rooms</h1>
            <p className="text-dark-300">
              Join or create real-time coding sessions with other developers
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Room</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms by name or description..."
                className="input-field pl-10 w-full"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="all">All Rooms</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-primary-400 mr-2" />
              <span className="text-2xl font-bold text-white">{rooms.length}</span>
            </div>
            <p className="text-dark-300">Total Rooms</p>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <Play className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-2xl font-bold text-white">
                {rooms.filter(r => r.isActive).length}
              </span>
            </div>
            <p className="text-dark-300">Active Sessions</p>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <Code className="h-6 w-6 text-secondary-400 mr-2" />
              <span className="text-2xl font-bold text-white">
                {rooms.reduce((sum, room) => sum + room.participants, 0)}
              </span>
            </div>
            <p className="text-dark-300">Active Participants</p>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading collaboration rooms..." />
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room.id} className="card hover:shadow-2xl transition-all duration-300 group">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {room.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {room.isActive ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400">Live</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Pause className="h-3 w-3 text-dark-400" />
                            <span className="text-xs text-dark-400">Inactive</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-dark-300 text-sm mb-3 line-clamp-2">
                      {room.description}
                    </p>
                  </div>
                </div>

                {/* Language Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getLanguageColor(room.language)}`}>
                    {room.language}
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-dark-400">
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{room.participants}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(room.createdAt)}</span>
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex items-center space-x-4 mb-4 text-xs text-dark-400">
                  <div className="flex items-center space-x-1">
                    <Code className="h-3 w-3" />
                    <span>Live Editing</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>Chat</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {room.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    <span>{room.isPublic ? 'Public' : 'Private'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                  <div className="flex items-center space-x-2">
                    {room.isActive ? (
                      <span className="text-green-400 text-sm font-medium">
                        {room.participants} coding now
                      </span>
                    ) : (
                      <span className="text-dark-400 text-sm">
                        Last active {formatDate(room.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <Link
                    to={`/collaborate/${room.id}`}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    {room.isActive ? 'Join Session' : 'Start Session'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-dark-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No collaboration rooms found</h3>
            <p className="text-dark-400 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Be the first to create a collaboration room!'
              }
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Room
            </button>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(newRoom) => {
              setRooms(prev => [newRoom, ...prev]);
              setShowCreateModal(false);
              toast.success('Collaboration room created successfully!');
            }}
          />
        )}
      </div>
    </div>
  );
};

// Create Room Modal Component
const CreateRoomModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'javascript',
    isPublic: true,
    maxParticipants: 5
  });

  const languages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php',
    'ruby', 'go', 'rust', 'typescript', 'html', 'css'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    try {
      setLoading(true);
      const result = await collaborationAPI.createRoom(formData);
      onSuccess(result.data);
    } catch (error) {
      toast.error('Failed to create room');
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Collaboration Room</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Room Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field w-full"
              placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field w-full h-20 resize-none"
              placeholder="Describe what you'll be working on..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Primary Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              className="input-field w-full"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Max Participants
            </label>
            <select
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
              className="input-field w-full"
            >
              <option value={2}>2 participants</option>
              <option value={3}>3 participants</option>
              <option value={5}>5 participants</option>
              <option value={10}>10 participants</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-dark-200">Public Room</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Collaborate;