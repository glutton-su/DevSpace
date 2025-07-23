import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { snippetAPI } from '../services/api';
import SnippetCard from '../components/features/SnippetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Plus, 
  TrendingUp, 
  Clock, 
  Grid,
  List,
  ChevronDown,
  X,
  Code
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSnippets();
    // eslint-disable-next-line
  }, [searchQuery, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  }, [searchQuery, setSearchParams]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      
      // Use public snippets for the dashboard
      const response = await snippetAPI.getPublicSnippets(params);
      let filteredSnippets = response.snippets || response.data || response;
      
      if (!Array.isArray(filteredSnippets)) {
        filteredSnippets = [];
      }
      
      switch (sortBy) {
        case 'popular':
          filteredSnippets.sort((a, b) => (b.starCount || 0) - (a.starCount || 0));
          break;
        case 'views':
          filteredSnippets.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case 'recent':
        default:
          filteredSnippets.sort((a, b) => new Date(b.updated_at || b.updatedAt) - new Date(a.updated_at || a.updatedAt));
      }
      setSnippets(filteredSnippets);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast.error('Failed to load snippets');
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async (snippetId) => {
    try {
      const response = await snippetAPI.toggleStar(snippetId);
      setSnippets(prev => prev.map(snippet => 
        snippet.id === snippetId 
          ? { 
              ...snippet, 
              starCount: response.starCount !== undefined ? response.starCount : (snippet.starCount || 0) + (snippet.isStarred ? -1 : 1), 
              isStarred: response.isStarred !== undefined ? response.isStarred : !snippet.isStarred 
            }
          : snippet
      ));
      const isStarred = response.isStarred !== undefined ? response.isStarred : !snippets.find(s => s.id === snippetId)?.isStarred;
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
      fetchSnippets(); // Refresh the list
    } catch (error) {
      console.error('Error forking snippet:', error);
      toast.error('Failed to fork snippet');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSnippets();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = !!searchQuery;
  const itemCount = snippets.length;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isAuthenticated ? `Welcome back, ${user?.username}!` : 'Discover Snippets'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore and share amazing code snippets from the community
            </p>
          </div>
          {isAuthenticated && (
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <Link
                to="/create"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Snippet</span>
              </Link>
            </div>
          )}
        </div>

        {/* Tab Navigation (only Snippets) */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-dark-800 rounded-lg p-1 mb-6">
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded text-sm transition-colors bg-primary-600 text-white"
            disabled
          >
            <Code className="h-4 w-4" />
            <span>Code Snippets</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets..."
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Filter Button (Mobile) */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="recent">Recent</option>
                <option value="popular">Popular</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="hidden lg:flex items-center bg-gray-200 dark:bg-dark-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden mt-4 pt-4 border-t border-gray-300 dark:border-dark-700 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="recent">Recent</option>
                  <option value="popular">Popular</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">View Mode</span>
                <div className="flex items-center bg-gray-200 dark:bg-dark-800 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid' 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list' 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="inline-flex items-center space-x-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full text-sm">
                      <span>Search: "{searchQuery}"</span>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{itemCount} snippets found</span>
            {hasActiveFilters && (
              <span className="text-primary-600 dark:text-primary-400">
                • Filtered results
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {sortBy === 'recent' && <Clock className="h-4 w-4" />}
            {sortBy === 'popular' && <TrendingUp className="h-4 w-4" />}
            {sortBy === 'views' && <TrendingUp className="h-4 w-4" />}
            <span>Sorted by {sortBy}</span>
          </div>
        </div>

        {/* Content Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading snippets..." />
          </div>
        ) : snippets.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {snippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onStar={handleStar}
                onFork={handleFork}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="h-12 w-12 text-gray-400 dark:text-dark-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No snippets found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or clearing filters'
                  : 'Be the first to share a code snippet!'
                }
              </p>
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="btn-secondary mr-3">
                  Clear Filters
                </button>
              ) : null}
              {isAuthenticated && (
                <Link 
                  to="/create"
                  className="btn-primary"
                >
                  Create Your First Snippet
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
