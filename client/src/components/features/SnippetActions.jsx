import { useState } from 'react';
import { Star, GitFork } from 'lucide-react';
import toast from 'react-hot-toast';

const SnippetActions = ({ snippet, onStar, onFork }) => {
  const [isStarred, setIsStarred] = useState(snippet?.isStarred || false);

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