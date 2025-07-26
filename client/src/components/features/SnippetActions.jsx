import { useState } from 'react';
import { Star, GitFork, Edit, Users, UserPlus, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { snippetAPI } from '../../services/api';
import CollaborationModal from '../modals/CollaborationModal';
import toast from 'react-hot-toast';

const SnippetActions = ({ snippet, onStar, onFork, onCollaborate, showManageOption = false }) => {
  const [isStarred, setIsStarred] = useState(snippet?.isStarred || false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if current user owns this snippet
  const isOwner = user && snippet?.project && snippet.project.userId === user.id;
  
  // Check if user is already a project collaborator
  const userCollaboration = snippet?.project?.collaborators?.find(
    collab => collab.user?.id === user?.id
  );
  const isCollaborator = Boolean(userCollaboration);
  const collaboratorRole = userCollaboration?.role;
  
  // For collaborative snippets, only owners and actual collaborators with editor/admin role can edit
  const canEdit = isOwner || 
                  (isCollaborator && (collaboratorRole === 'editor' || collaboratorRole === 'admin'));
  
  // Show collaborate button for non-owners who aren't already collaborators
  const canCollaborate = snippet?.allowCollaboration && user && !isOwner && !isCollaborator;
  
  // Check if user can manage collaborators (owners or admin collaborators)
  const canManageCollaborators = isOwner || (isCollaborator && collaboratorRole === 'admin');

  const handleEdit = () => {
    navigate(`/snippet/${snippet.id}/edit`);
  };

  const handleCollaborate = async () => {
    try {
      setIsCollaborating(true);
      // Add the current user as a collaborator with editor role
      await snippetAPI.addCollaborator(snippet.id, user.username);
      toast.success('You joined the project collaboration group! You can now edit all collaborative snippets in this project.');
      
      // Refresh the snippet data to show updated collaboration status
      if (onCollaborate) {
        onCollaborate();
      } else {
        // Fallback: reload the page to refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error joining collaboration:', error);
      if (error.response?.status === 400) {
        toast.error('You are already a collaborator on this snippet');
      } else {
        toast.error('Failed to join collaboration');
      }
    } finally {
      setIsCollaborating(false);
    }
  };

  const handleStar = async () => {
    try {
      setIsStarred(!isStarred);
      if (onStar) {
        await onStar(snippet.id);
      }
      toast.success(isStarred ? 'Removed star' : 'Starred snippet');
    } catch (error) {
      setIsStarred(isStarred); // Revert on error
      toast.error('Failed to update star');
    }
  };

  const handleFork = async () => {
    try {
      if (onFork) {
        await onFork(snippet.id);
      }
      toast.success('Snippet forked successfully!');
    } catch (error) {
      toast.error('Failed to fork snippet');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Collaboration status badge */}
          {isCollaborator && (
            <span className="flex items-center space-x-1 text-purple-400 text-sm">
              <Users className="h-4 w-4" />
              <span>Collaborator ({collaboratorRole})</span>
            </span>
          )}

          {/* Manage Collaborators button - for owners and admin collaborators - only show on specific pages */}
          {showManageOption && canManageCollaborators && (
            <button
              onClick={() => setShowCollaborationModal(true)}
              className="flex items-center space-x-1 text-gray-600 dark:text-dark-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              title="Manage collaborators"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm">Manage</span>
            </button>
          )}

          {/* Collaborate button - for non-owners who aren't already collaborators */}
          {canCollaborate && (          <button
            onClick={handleCollaborate}
            disabled={isCollaborating}
            className="flex items-center space-x-1 text-gray-600 dark:text-dark-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
            title="Join project collaboration group"
          >
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">{isCollaborating ? 'Joining...' : 'Join Group'}</span>
            </button>
          )}

          {/* Edit button - for owners and actual collaborators only */}
          {canEdit && (          <button
            onClick={handleEdit}
            className="flex items-center space-x-1 text-gray-600 dark:text-dark-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            title="Edit snippet"
          >
              <Edit className="h-4 w-4" />
              <span className="text-sm">Edit</span>
            </button>
          )}

          {/* Star */}
          <button
            onClick={handleStar}
            className={`flex items-center space-x-1 transition-colors ${
              isStarred ? 'text-yellow-500' : 'text-gray-600 dark:text-dark-400 hover:text-yellow-500'
            }`}
            title={isStarred ? 'Unstar' : 'Star'}
          >
            <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
            <span className="text-sm">{snippet.starCount || 0}</span>
          </button>

          {/* Fork */}
          <button
            onClick={handleFork}
            className="flex items-center space-x-1 text-gray-600 dark:text-dark-400 hover:text-green-500 dark:hover:text-green-400 transition-colors"
            title="Fork snippet"
          >
            <GitFork className="h-4 w-4" />
            <span className="text-sm">{snippet.forkCount || 0}</span>
          </button>
        </div>
      </div>

      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <CollaborationModal
          snippet={snippet}
          isOpen={showCollaborationModal}
          onClose={() => setShowCollaborationModal(false)}
          onUpdate={() => {
            // Refresh collaboration data
            if (onCollaborate) {
              onCollaborate();
            }
          }}
        />
      )}
    </>
  );
};

export default SnippetActions;