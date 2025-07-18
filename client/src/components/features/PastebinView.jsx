import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PastebinEditor from '../common/PastebinEditor';
import { snippetAPI } from '../../services/api';
import { Share2, Download, Edit, Delete, Star, Heart, GitFork, Eye, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';

const PastebinView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSnippet();
    }
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetAPI.getSnippet(id);
      setSnippet(response.data?.codeSnippet || response.data);
    } catch (error) {
      toast.error('Failed to load snippet');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedData) => {
    try {
      const response = await snippetAPI.updateSnippet(id, updatedData);
      setSnippet(response.data?.codeSnippet || response.data);
      setIsEditing(false);
      toast.success('Snippet updated successfully!');
    } catch (error) {
      toast.error('Failed to update snippet');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await snippetAPI.deleteSnippet(id);
        toast.success('Snippet deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete snippet');
      }
    }
  };

  const handleLike = async () => {
    try {
      await snippetAPI.likeSnippet(id);
      setIsLiked(!isLiked);
      setSnippet(prev => ({
        ...prev,
        likes: prev.likes + (isLiked ? -1 : 1)
      }));
      toast.success(isLiked ? 'Unliked' : 'Liked');
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleFork = async () => {
    try {
      const response = await snippetAPI.forkSnippet(id);
      toast.success('Snippet forked successfully!');
      navigate(`/snippet/${response.data.id}`);
    } catch (error) {
      toast.error('Failed to fork snippet');
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
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
    } catch (error) {
      toast.error('Failed to share');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([snippet.code || snippet.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.title}.${snippet.language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Snippet not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This snippet may have been deleted or made private.
          </p>
        </div>
      </div>
    );
  }

  const isOwner = user && (user.id === snippet.author?.id || user.id === snippet.userId);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {snippet.title}
              </h1>
              {snippet.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {snippet.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Actions */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{snippet.likes || 0}</span>
              </button>

              <button
                onClick={handleFork}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <GitFork className="h-4 w-4" />
                <span>{snippet.forks || 0}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>

              <button
                onClick={handleDownload}
                className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Delete className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            {snippet.author && (
              <Link 
                to={`/profile/${snippet.author.username}`}
                className="flex items-center space-x-2 hover:text-gray-900 dark:hover:text-white"
              >
                <img
                  src={snippet.author.avatarUrl || 'https://via.placeholder.com/24'}
                  alt={snippet.author.username}
                  className="w-6 h-6 rounded-full"
                />
                <span>{snippet.author.fullName || snippet.author.username}</span>
              </Link>
            )}
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{snippet.views || 0} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Tags */}
          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {snippet.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <PastebinEditor
          code={snippet.code || snippet.content}
          language={snippet.language}
          title={snippet.title}
          readOnly={!isEditing}
          showLineNumbers={true}
        />
      </div>
    </div>
  );
};

export default PastebinView;