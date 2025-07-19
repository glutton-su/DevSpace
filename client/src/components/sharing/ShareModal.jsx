import { useState } from 'react';
import { Share2, Copy, Link, Eye, EyeOff, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, snippet, onVisibilityChange }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isPublic, setIsPublic] = useState(snippet?.isPublic || false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!snippet) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/code/${snippet.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ isPublic }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setShareUrl(data.shareUrl);
        onVisibilityChange?.(isPublic);
        toast.success('Snippet shared successfully!');
      } else {
        toast.error(data.message || 'Failed to share snippet');
      }
    } catch (error) {
      toast.error('Failed to share snippet');
      console.error('Share error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleVisibilityToggle = () => {
    setIsPublic(!isPublic);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Share Code Snippet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Snippet Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              {snippet?.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {snippet?.language} • {snippet?.content?.length || 0} characters
            </p>
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isPublic ? (
                <Eye className="h-4 w-4 text-green-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-gray-700 dark:text-gray-200">
                {isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            <button
              onClick={handleVisibilityToggle}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                isPublic ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 bg-white rounded-full transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>{isLoading ? 'Sharing...' : 'Share Snippet'}</span>
          </button>

          {/* Share URL */}
          {shareUrl && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Share URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p>
              {isPublic 
                ? 'This snippet will be publicly accessible to anyone with the link.'
                : 'This snippet is private and only accessible to you and authorized collaborators.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 