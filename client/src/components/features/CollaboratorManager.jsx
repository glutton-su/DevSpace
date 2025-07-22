import { useState, useEffect } from 'react';
import { snippetAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  UserPlus, 
  UserMinus,
  Shield,
  Edit,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const CollaboratorManager = ({ snippetId, isOwner, onClose }) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCollaborators();
  }, [snippetId]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const response = await snippetAPI.getSnippetCollaborators(snippetId);
      setCollaborators(response.collaborators || []);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await userAPI.searchUsers(query);
      // Filter out users who are already collaborators
      const existingCollaboratorIds = collaborators.map(c => c.user.id);
      const filteredResults = response.users?.filter(u => 
        u.id !== user.id && !existingCollaboratorIds.includes(u.id)
      ) || [];
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearchLoading(false);
    }
  };

  const addCollaborator = async (userId, role = 'viewer') => {
    try {
      const response = await snippetAPI.addSnippetCollaborator(snippetId, { 
        userId, 
        role 
      });
      setCollaborators(prev => [...prev, response.collaborator]);
      setSearchQuery('');
      setSearchResults([]);
      setShowAddForm(false);
      toast.success('Collaborator added successfully');
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Failed to add collaborator');
    }
  };

  const removeCollaborator = async (collaboratorId) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) {
      return;
    }

    try {
      await snippetAPI.removeSnippetCollaborator(snippetId, collaboratorId);
      setCollaborators(prev => prev.filter(c => c.user.id !== collaboratorId));
      toast.success('Collaborator removed successfully');
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'editor':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'viewer':
      default:
        return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'viewer':
      default:
        return 'Viewer';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-400" />
            <h3 className="text-lg font-semibold text-white">Manage Collaborators</h3>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Add Collaborator Section */}
          {isOwner && (
            <div className="p-4 border-b border-dark-700">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Collaborator</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      placeholder="Search users by username or email..."
                      className="input-field pl-10 w-full"
                    />
                  </div>

                  {searchLoading && (
                    <div className="text-center py-2">
                      <div className="text-dark-400">Searching...</div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {searchResults.map((searchUser) => (
                        <div
                          key={searchUser.id}
                          className="flex items-center justify-between p-2 bg-dark-700 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <img
                              src={searchUser.avatarUrl || '/default-avatar.png'}
                              alt={searchUser.username}
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="text-white text-sm">{searchUser.username}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <select
                              id={`role-${searchUser.id}`}
                              className="text-xs bg-dark-600 border border-dark-500 rounded px-2 py-1 text-white"
                              defaultValue="viewer"
                            >
                              <option value="viewer">Viewer</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => {
                                const roleSelect = document.getElementById(`role-${searchUser.id}`);
                                addCollaborator(searchUser.id, roleSelect.value);
                              }}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="btn-secondary w-full text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Collaborators List */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-dark-400">Loading collaborators...</div>
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-dark-600 mx-auto mb-2" />
                <div className="text-dark-400">No collaborators yet</div>
                <div className="text-dark-500 text-sm">Add collaborators to share this snippet</div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-dark-300 mb-2">
                  Collaborators ({collaborators.length})
                </h4>
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 bg-dark-700 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={collaborator.user.avatarUrl || '/default-avatar.png'}
                        alt={collaborator.user.username}
                        className="h-8 w-8 rounded-full"
                      />
                      <div>
                        <div className="text-white font-medium">
                          {collaborator.user.username}
                        </div>
                        <div className="text-dark-400 text-sm">
                          {collaborator.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm">
                        {getRoleIcon(collaborator.role)}
                        <span className="text-dark-300">
                          {getRoleLabel(collaborator.role)}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => removeCollaborator(collaborator.user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorManager;
