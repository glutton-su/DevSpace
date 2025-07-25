import { useState, useEffect } from 'react';
import { X, Users, UserPlus, UserMinus, Crown } from 'lucide-react';
import { snippetAPI, projectAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CollaborationModal = ({ snippet, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaboratorUsername, setNewCollaboratorUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [isProjectLevel, setIsProjectLevel] = useState(false);

  useEffect(() => {
    if (isOpen && snippet) {
      fetchCollaborators();
    }
  }, [isOpen, snippet]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      
      // First try to get snippet-level collaborators
      let response;
      let snippetCollaborators = [];
      let isUsingProjectCollaborators = false;
      
      try {
        response = await snippetAPI.getSnippetCollaborators(snippet.id);
        snippetCollaborators = response.collaborators || [];
      } catch (snippetError) {
        console.log('No snippet-level collaborators found');
      }
      
      // If no snippet collaborators and there's a project, check project collaborators
      if (snippetCollaborators.length === 0 && snippet?.project?.id) {
        try {
          response = await projectAPI.getProjectCollaborators(snippet.project.id);
          const projectCollaborators = response.collaborators || [];
          if (projectCollaborators.length > 0) {
            snippetCollaborators = projectCollaborators.map(collab => ({
              user: collab.user || collab,
              role: collab.role || 'editor',
              id: collab.id,
              userId: collab.userId || collab.user?.id
            }));
            isUsingProjectCollaborators = true;
          }
        } catch (projectError) {
          // If project API fails, fall back to project data from snippet
          if (snippet?.project?.collaborators) {
            snippetCollaborators = snippet.project.collaborators.map(collab => ({
              user: collab.user || collab,
              role: collab.role || 'editor',
              id: collab.id,
              userId: collab.userId || collab.user?.id
            }));
            isUsingProjectCollaborators = true;
          }
        }
      }
      
      setCollaborators(snippetCollaborators);
      setIsProjectLevel(isUsingProjectCollaborators);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      toast.error('Failed to load collaborators');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    
    if (!newCollaboratorUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      setAddingCollaborator(true);
      
      if (isProjectLevel && snippet?.project?.id) {
        await projectAPI.addProjectCollaborator(snippet.project.id, newCollaboratorUsername.trim());
      } else {
        await snippetAPI.addCollaborator(snippet.id, newCollaboratorUsername.trim());
      }
      
      toast.success('Collaborator added successfully!');
      setNewCollaboratorUsername('');
      await fetchCollaborators();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      if (error.response?.status === 404) {
        toast.error('User not found');
      } else if (error.response?.status === 400) {
        toast.error('User is already a collaborator');
      } else {
        toast.error('Failed to add collaborator');
      }
    } finally {
      setAddingCollaborator(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      if (isProjectLevel && snippet?.project?.id) {
        await projectAPI.removeProjectCollaborator(snippet.project.id, collaboratorId);
      } else {
        await snippetAPI.removeCollaborator(snippet.id, collaboratorId);
      }
      
      toast.success('Collaborator removed successfully!');
      await fetchCollaborators();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Failed to remove collaborator');
    }
  };

  const isOwner = snippet?.author?.id === user?.id || snippet?.project?.owner?.id === user?.id;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isProjectLevel ? 'Project Collaboration' : 'Snippet Collaboration'}
              </h2>
              <p className="text-sm text-dark-300">{snippet?.title}</p>
              {isProjectLevel && (
                <p className="text-xs text-dark-400">Managing project-level collaborators</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Add Collaborator - Only show if user is owner */}
          {isOwner && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Add Collaborator</h3>
              <form onSubmit={handleAddCollaborator} className="flex space-x-3">
                <input
                  type="text"
                  value={newCollaboratorUsername}
                  onChange={(e) => setNewCollaboratorUsername(e.target.value)}
                  placeholder="Enter username"
                  className="input-field flex-1"
                  disabled={addingCollaborator}
                />
                <button
                  type="submit"
                  disabled={addingCollaborator || !newCollaboratorUsername.trim()}
                  className="btn-primary px-4 py-2 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingCollaborator ? (
                    <Users className="h-4 w-4 animate-pulse" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  <span>Add</span>
                </button>
              </form>
            </div>
          )}

          {/* Collaborators List */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">
              Collaborators ({collaborators.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-dark-400 mx-auto mb-2 animate-pulse" />
                <p className="text-dark-400">Loading collaborators...</p>
              </div>
            ) : collaborators.length > 0 ? (
              <div className="space-y-3">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.user.id}
                    className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {collaborator.user.fullName?.charAt(0) || collaborator.user.username?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {collaborator.user.fullName || collaborator.user.username}
                        </p>
                        <p className="text-sm text-dark-300">@{collaborator.user.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {collaborator.role === 'admin' ? (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Users className="h-4 w-4 text-blue-400" />
                        )}
                        <span className="text-sm text-dark-300 capitalize">
                          {collaborator.role}
                        </span>
                      </div>
                      
                      {isOwner && collaborator.user.id !== user.id && (
                        <button
                          onClick={() => handleRemoveCollaborator(collaborator.user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded"
                          title="Remove collaborator"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-dark-400 mx-auto mb-2" />
                <p className="text-dark-400">No collaborators yet</p>
                {isOwner && (
                  <p className="text-sm text-dark-500 mt-1">
                    Add collaborators using the form above
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-dark-700">
          <div className="text-sm text-dark-400">
            {isOwner ? (
              'You can add and remove collaborators'
            ) : (
              'You are a collaborator on this snippet'
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaborationModal;
