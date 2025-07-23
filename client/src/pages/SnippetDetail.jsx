import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SnippetActions from '../components/features/SnippetActions';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Calendar, 
  User,
  Eye,
  Code,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { snippetAPI } from '../services/api';

const SnippetDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      console.log('Fetching snippet with ID:', id);
      const response = await snippetAPI.getSnippet(id);
      console.log('API response:', response);
      
      // Handle different response structures - backend returns { codeSnippet }
      const snippetData = response.codeSnippet || response.snippet || response.data || response;
      console.log('Snippet data:', snippetData);
      
      setSnippet(snippetData);
    } catch (error) {
      console.error('Error fetching snippet:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load snippet');
      // Don't auto-navigate, let user see the error
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async (snippetId) => {
    try {
      const response = await snippetAPI.toggleStar(snippetId);
      setSnippet(prev => ({
        ...prev,
        starCount: response.starCount !== undefined ? response.starCount : (prev.starCount || 0) + (prev.isStarred ? -1 : 1),
        isStarred: response.isStarred !== undefined ? response.isStarred : !prev.isStarred
      }));
      const isStarred = response.isStarred !== undefined ? response.isStarred : !snippet.isStarred;
      toast.success(isStarred ? 'Snippet starred!' : 'Snippet unstarred!');
    } catch (error) {
      console.error('Error starring snippet:', error);
      toast.error('Failed to star snippet');
    }
  };

  const handleFork = async (snippetId) => {
    try {
      await snippetAPI.forkSnippet(snippetId);
      toast.success('Snippet forked successfully!');
    } catch (error) {
      console.error('Error forking snippet:', error);
      toast.error('Failed to fork snippet');
    }
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
          <Code className="h-16 w-16 text-gray-400 dark:text-dark-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Snippet not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The snippet you're looking for doesn't exist or has been deleted.</p>
          <Link to="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="card mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {snippet.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    {snippet.description}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getLanguageColor(snippet.language)} flex-shrink-0 ml-4`}>
                  {snippet.language}
                </span>
              </div>

              {/* Author Info */}
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={(snippet.author?.avatar || snippet.project?.owner?.avatarUrl) || '/default-avatar.png'}
                  alt={(snippet.author?.name || snippet.project?.owner?.fullName || snippet.project?.owner?.username) || 'User'}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <Link 
                    to={`/profile/${snippet.author?.username || snippet.project?.owner?.username}`}
                    className="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
                  >
                    {snippet.author?.name || snippet.project?.owner?.fullName || snippet.project?.owner?.username}
                  </Link>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(snippet.createdAt || snippet.created_at)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{snippet.views || 0} views</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <SnippetActions
                snippet={snippet}
                onStar={handleStar}
                onFork={handleFork}
              />
            </div>

            {/* Code Content */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Code</h2>
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
                  {snippet.content || snippet.code || '// No code content available'}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Info */}
            {snippet.project && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project</h3>
                <Link 
                  to={`/project/${snippet.project.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-dark-800 rounded-lg p-3 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {snippet.project.name || snippet.project.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {snippet.project.description}
                  </p>
                </Link>
              </div>
            )}

            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {snippet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-sm rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                      onClick={() => navigate(`/search?tag=${tag}`)}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetDetail;
