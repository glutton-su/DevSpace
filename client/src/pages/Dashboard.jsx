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
  Heart,
  Grid,
  List,
  ChevronDown,
  X
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const languages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php',
    'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'sql'
  ];

  useEffect(() => {
    fetchSnippets();
  }, [searchQuery, selectedLanguage, selectedTag, sortBy]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLanguage) params.set('language', selectedLanguage);
    if (selectedTag) params.set('tag', selectedTag);
    setSearchParams(params);
  }, [searchQuery, selectedLanguage, selectedTag, setSearchParams]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedLanguage) params.language = selectedLanguage;
      if (selectedTag) params.tag = selectedTag;
      
      const response = await snippetAPI.getSnippets(params);
      let filteredSnippets = response.data || response;

      // Sort snippets
      switch (sortBy) {
        case 'popular':
          filteredSnippets.sort((a, b) => b.likes - a.likes);
          break;
        case 'views':
          filteredSnippets.sort((a, b) => b.views - a.views);
          break;
        case 'recent':
        default:
          filteredSnippets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

  const handleLike = async (snippetId) => {
    try {
      await snippetAPI.toggleLike(snippetId);
      // Update local state
      setSnippets(prev => prev.map(snippet => 
        snippet.id === snippetId 
          ? { ...snippet, likes: snippet.likes + 1 }
          : snippet
      ));
      toast.success('Snippet liked!');
    } catch (error) {
      console.error('Error liking snippet:', error);
      toast.error('Failed to like snippet');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSnippets();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('');
    setSelectedTag('');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedLanguage || selectedTag;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isAuthenticated ? `Welcome back, ${user?.name}!` : 'Discover Code Snippets'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore and share amazing code snippets from the community
            </p>
          </div>
          
          {isAuthenticated && (
            <div className="mt-4 lg:mt-0">
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
                placeholder="Search snippets, tags, or users..."
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
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>

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
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Languages</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>

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
                  {selectedLanguage && (
                    <span className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm">
                      <span>Language: {selectedLanguage}</span>
                      <button
                        onClick={() => setSelectedLanguage('')}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedTag && (
                    <span className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm">
                      <span>Tag: #{selectedTag}</span>
                      <button
                        onClick={() => setSelectedTag('')}
                        className="hover:text-green-600 dark:hover:text-green-400"
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
            <span>{snippets.length} snippets found</span>
            {hasActiveFilters && (
              <span className="text-primary-600 dark:text-primary-400">
                • Filtered results
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {sortBy === 'recent' && <Clock className="h-4 w-4" />}
            {sortBy === 'popular' && <Heart className="h-4 w-4" />}
            {sortBy === 'views' && <TrendingUp className="h-4 w-4" />}
            <span>Sorted by {sortBy}</span>
          </div>
        </div>

        {/* Snippets Grid/List */}
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
                onLike={handleLike}
                showFullCode={viewMode === 'list'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400 dark:text-dark-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No snippets found</h3>
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
                <Link to="/create" className="btn-primary">
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