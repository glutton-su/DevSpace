import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Users, 
  Edit, 
  Trash2,
  Copy,
  Download,
  Share2
} from 'lucide-react';
import { snippetAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SnippetActions from './SnippetActions';
import CollaboratorManager from './CollaboratorManager';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const SnippetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCollaborators, setShowCollaborators] = useState(false);

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetAPI.getSnippet(id);
      setSnippet(response.codeSnippet || response.snippet || response);
    } catch (error) {
      console.error('Error fetching snippet:', error);
      toast.error('Failed to load snippet');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async () => {
    try {
      await snippetAPI.toggleStar(snippet.id);
      setSnippet(prev => ({
        ...prev,
        isStarred: !prev.isStarred,
        starsCount: prev.isStarred ? (prev.starsCount || 0) - 1 : (prev.starsCount || 0) + 1
      }));
      toast.success(snippet.isStarred ? 'Removed star' : 'Snippet starred!');
    } catch (error) {
      console.error('Error starring snippet:', error);
      toast.error('Failed to star snippet');
    }
  };

  const handleFork = async () => {
    try {
      const response = await snippetAPI.forkSnippet(snippet.id);
      toast.success('Snippet forked successfully!');
      // Handle different response formats
      const forkedSnippetId = response.codeSnippet?.id || response.snippet?.id || response.id;
      if (forkedSnippetId) {
        navigate(`/snippet/${forkedSnippetId}`);
      } else {
        console.warn('Fork response missing snippet ID:', response);
        // Still navigate somewhere useful
        navigate('/projects');
      }
    } catch (error) {
      console.error('Error forking snippet:', error);
      toast.error('Failed to fork snippet');
    }
  };

  const handleEdit = () => {
    navigate(`/create?edit=${snippet.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) {
      try {
        await snippetAPI.deleteSnippet(snippet.id);
        toast.success('Snippet deleted successfully');
        navigate('/projects');
      } catch (error) {
        toast.error('Failed to delete snippet');
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      const codeContent = snippet.content || snippet.code || '';
      await navigator.clipboard.writeText(codeContent);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy code');
    }
  };

  const downloadSnippet = () => {
    try {
      const codeContent = snippet.content || snippet.code || '';
      const element = document.createElement('a');
      const file = new Blob([codeContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${snippet.title}.${getFileExtension(snippet.language)}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success('Snippet downloaded!');
    } catch (error) {
      console.error('Error downloading snippet:', error);
      toast.error('Failed to download snippet');
    }
  };

  const getFileExtension = (language) => {
    const extensions = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      css: 'css',
      html: 'html',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt'
    };
    return extensions[language] || 'txt';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const isOwner = snippet && user && snippet.project?.owner?.id === user.id;
  const canManageCollaborators = isOwner || (snippet?.collaborators?.some(c => 
    c.userId === user?.id && c.role === 'admin'
  ));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading snippet..." />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-50 mb-2">
            Snippet not found
          </h2>
          <p className="text-dark-600 dark:text-dark-300 mb-4">
            The snippet you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="btn-primary"
          >
            Back to Snippets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 
                     dark:hover:text-primary-400 rounded-lg hover:bg-dark-100 
                     dark:hover:bg-dark-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-dark-50">
            {snippet.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Snippet Info */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getLanguageColor(snippet.language)}`}>
                    {snippet.language}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                    <User size={16} />
                    <span>{snippet.project?.owner?.username || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-300">
                    <Calendar size={16} />
                    <span>{formatDate(snippet.created_at || snippet.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 
                             dark:hover:text-primary-400 rounded-lg hover:bg-dark-100 
                             dark:hover:bg-dark-800 transition-colors"
                    title="Copy code"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={downloadSnippet}
                    className="p-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 
                             dark:hover:text-primary-400 rounded-lg hover:bg-dark-100 
                             dark:hover:bg-dark-800 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  {canManageCollaborators && (
                    <button
                      onClick={() => setShowCollaborators(true)}
                      className="p-2 text-dark-600 dark:text-dark-300 hover:text-primary-600 
                               dark:hover:text-primary-400 rounded-lg hover:bg-dark-100 
                               dark:hover:bg-dark-800 transition-colors"
                      title="Manage collaborators"
                    >
                      <Users size={16} />
                    </button>
                  )}
                  {isOwner && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="p-2 text-dark-600 dark:text-dark-300 hover:text-blue-600 
                                 dark:hover:text-blue-400 rounded-lg hover:bg-dark-100 
                                 dark:hover:bg-dark-800 transition-colors"
                        title="Edit snippet"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={handleDelete}
                        className="p-2 text-dark-600 dark:text-dark-300 hover:text-red-600 
                                 dark:hover:text-red-400 rounded-lg hover:bg-dark-100 
                                 dark:hover:bg-dark-800 transition-colors"
                        title="Delete snippet"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {snippet.description && (
                <p className="text-dark-700 dark:text-dark-200 mb-4">
                  {snippet.description}
                </p>
              )}

              {/* Tags */}
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-dark-100 dark:bg-dark-800 
                               text-dark-700 dark:text-dark-300 text-sm rounded-full 
                               cursor-pointer hover:bg-dark-200 dark:hover:bg-dark-700"
                      onClick={() => navigate(`/search?tag=${tag}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Code */}
            <div className="card">
              <div className="rounded-lg overflow-hidden bg-dark-900 border border-dark-700">
                <SyntaxHighlighter
                  language={snippet.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    background: 'transparent',
                    fontSize: '14px'
                  }}
                  showLineNumbers={true}
                >
                  {snippet.content || snippet.code || 'No content available'}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                Actions
              </h3>
              <SnippetActions
                snippet={snippet}
                onStar={handleStar}
                onFork={handleFork}
                vertical={true}
              />
            </div>

            {/* Collaborators Summary */}
            {snippet.collaborators && snippet.collaborators.length > 0 && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-50 mb-4">
                  Collaborators ({snippet.collaborators.length})
                </h3>
                <div className="space-y-3">
                  {snippet.collaborators.slice(0, 5).map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {collaborator.User?.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-50 truncate">
                          {collaborator.User?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-dark-600 dark:text-dark-400">
                          {collaborator.role}
                        </p>
                      </div>
                    </div>
                  ))}
                  {snippet.collaborators.length > 5 && (
                    <p className="text-sm text-dark-600 dark:text-dark-400 text-center">
                      +{snippet.collaborators.length - 5} more
                    </p>
                  )}
                </div>
                {canManageCollaborators && (
                  <button
                    onClick={() => setShowCollaborators(true)}
                    className="w-full mt-4 btn-secondary text-sm"
                  >
                    Manage Collaborators
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collaborator Manager Modal */}
      {showCollaborators && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <CollaboratorManager
              snippetId={snippet.id}
              isOwner={isOwner}
              onClose={() => {
                setShowCollaborators(false);
                fetchSnippet(); // Refresh snippet to get updated collaborators
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetDetail;
