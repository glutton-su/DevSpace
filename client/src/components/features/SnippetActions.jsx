import { useState } from 'react';
import { Heart, Star, GitFork, Share2, Flag, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

const SnippetActions = ({ snippet, onLike, onStar, onFork }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      if (onLike) {
        await onLike(snippet.id);
      }
      toast.success(isLiked ? 'Removed like' : 'Liked snippet');
    } catch (error) {
      setIsLiked(isLiked); // Revert on error
      toast.error('Failed to update like');
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

  const handleBookmark = async () => {
    try {
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Removed bookmark' : 'Bookmarked snippet');
    } catch (error) {
      setIsBookmarked(isBookmarked); // Revert on error
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = async (method) => {
    const url = `${window.location.origin}/snippet/${snippet.id}`;
    
    try {
      switch (method) {
        case 'copy':
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: snippet.title,
              text: snippet.description,
              url: url
            });
          } else {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
          }
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(snippet.title)}&url=${encodeURIComponent(url)}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
          break;
        default:
          break;
      }
      setShowShareMenu(false);
    } catch (error) {
      toast.error('Failed to share snippet');
    }
  };

  const handleReport = () => {
    toast.info('Report feature coming soon!');
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t border-dark-700">
      {/* Left Actions */}
      <div className="flex items-center space-x-4">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 transition-colors ${
            isLiked ? 'text-red-500' : 'text-dark-400 hover:text-red-500'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{snippet.likes + (isLiked ? 1 : 0)}</span>
        </button>

        {/* Star */}
        <button
          onClick={handleStar}
          className={`flex items-center space-x-1 transition-colors ${
            isStarred ? 'text-yellow-500' : 'text-dark-400 hover:text-yellow-500'
          }`}
          title={isStarred ? 'Unstar' : 'Star'}
        >
          <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
          <span className="text-sm">{snippet.stars || 0}</span>
        </button>

        {/* Fork */}
        <button
          onClick={handleFork}
          className="flex items-center space-x-1 text-dark-400 hover:text-green-500 transition-colors"
          title="Fork snippet"
        >
          <GitFork className="h-4 w-4" />
          <span className="text-sm">{snippet.forks || 0}</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`flex items-center space-x-1 transition-colors ${
            isBookmarked ? 'text-blue-500' : 'text-dark-400 hover:text-blue-500'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        {/* Share */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-800"
            title="Share snippet"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {showShareMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-48 glass-effect rounded-lg shadow-lg py-2 z-10">
              <button
                onClick={() => handleShare('copy')}
                className="w-full text-left px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => handleShare('native')}
                className="w-full text-left px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
              >
                Share via...
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full text-left px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-full text-left px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
              >
                Share on LinkedIn
              </button>
            </div>
          )}
        </div>

        {/* Report */}
        <button
          onClick={handleReport}
          className="p-2 text-dark-400 hover:text-red-400 transition-colors rounded-lg hover:bg-dark-800"
          title="Report snippet"
        >
          <Flag className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SnippetActions;