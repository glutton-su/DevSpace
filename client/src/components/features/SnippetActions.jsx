import { useState } from 'react';
import { Star, GitFork, Edit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SnippetActions = ({ snippet, onStar, onFork }) => {
  const [isStarred, setIsStarred] = useState(snippet?.isStarred || false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if current user owns this snippet
  const isOwner = user && snippet?.project && snippet.project.userId === user.id;

  const handleEdit = () => {
    navigate(`/snippet/${snippet.id}/edit`);
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
    <div className="flex items-center justify-between pt-4 border-t border-dark-700">
      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Edit button - only for owners */}
        {isOwner && (
          <button
            onClick={handleEdit}
            className="flex items-center space-x-1 text-dark-400 hover:text-blue-500 transition-colors"
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
            isStarred ? 'text-yellow-500' : 'text-dark-400 hover:text-yellow-500'
          }`}
          title={isStarred ? 'Unstar' : 'Star'}
        >
          <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
          <span className="text-sm">{snippet.starCount || 0}</span>
        </button>

        {/* Fork */}
        <button
          onClick={handleFork}
          className="flex items-center space-x-1 text-dark-400 hover:text-green-500 transition-colors"
          title="Fork snippet"
        >
          <GitFork className="h-4 w-4" />
          <span className="text-sm">{snippet.forkCount || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default SnippetActions;