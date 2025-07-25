import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { snippetAPI } from '../services/api';
import SnippetCard from '../components/features/SnippetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { normalizeSnippets } from '../utils/dataUtils';
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
  Code,
  Tag
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSnippets();
    // eslint-disable-next-line
  }, [sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  }, [searchQuery, setSearchParams]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Use public snippets for the dashboard
      const response = await snippetAPI.getPublicSnippets(params);
      let allSnippets = response.snippets || response.data || response;
      
      if (!Array.isArray(allSnippets)) {
        allSnippets = [];
      }
      
      // Normalize the snippets data (especially tags)
      allSnippets = normalizeSnippets(allSnippets);
      
      console.log('Setting snippets for dashboard:', allSnippets.length, 'items');
      setSnippets(allSnippets);
    } catch (error) {
      console.error('Error fetching snippets:', error);
      toast.error('Failed to load snippets');
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from snippets
  const getAllTags = () => {
    const tagSet = new Set();
    snippets.forEach(snippet => {
      if (snippet.tags && Array.isArray(snippet.tags)) {
        snippet.tags.forEach(tag => {
          const tagName = typeof tag === 'string' ? tag : tag.name || tag;
          if (tagName) tagSet.add(tagName);
        });
      }
    });
    return Array.from(tagSet).sort();
  };

  // Get all unique languages from snippets
  const getAllLanguages = () => {
    const languageSet = new Set();
    snippets.forEach(snippet => {
      if (snippet.language) {
        languageSet.add(snippet.language);
      }
    });
    return Array.from(languageSet).sort();
  };

  // Handle tag selection
  const handleTagSelect = (tagName) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
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
    setSelectedTags([]);
    setSelectedLanguage('');
    setSearchParams({});
  };

  // Apply all filters and sorting on the client side
  const filteredSnippets = (() => {
    let filtered = [...snippets];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(snippet =>
        snippet.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snippet.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (snippet.tags && snippet.tags.some(tag => {
          const tagName = typeof tag === 'string' ? tag : tag.name || tag;
          return tagName?.toLowerCase().includes(searchQuery.toLowerCase());
        }))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(snippet => {
        if (!snippet.tags || !Array.isArray(snippet.tags)) return false;
        return selectedTags.every(selectedTag => 
          snippet.tags.some(tag => {
            const tagName = typeof tag === 'string' ? tag : tag.name || tag;
            return tagName === selectedTag;
          })
        );
      });
    }

    // Apply language filter
    if (selectedLanguage) {
      filtered = filtered.filter(snippet => snippet.language === selectedLanguage);
    }

    // Sort snippets
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.starCount || 0) - (a.starCount || 0));
        break;
      case 'views':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.updated_at || b.updatedAt) - new Date(a.updated_at || a.updatedAt));
    }

    return filtered;
  })();

  const hasActiveFilters = !!(searchQuery || selectedTags.length > 0 || selectedLanguage);
  const itemCount = filteredSnippets.length;

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
          <div className="flex flex-col lg:flex-row gap-4">
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

            {/* Language Filter */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="input-field min-w-[140px]"
              >
                <option value="">All Languages</option>
                {getAllLanguages().map(language => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort and View Options */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="recent">Recent</option>
                <option value="popular">Popular</option>
                <option value="views">Most Viewed</option>
              </select>

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

          {/* Tag Filter */}
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-dark-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Tags</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-600 hover:text-primary-500 flex items-center space-x-1"
                >
                  <X className="h-3 w-3" />
                  <span>Clear all</span>
                </button>
              )}
            </div>
            
            {/* Available Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {getAllTags().slice(0, 20).map(tagName => (
                <button
                  key={tagName}
                  onClick={() => handleTagSelect(tagName)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedTags.includes(tagName)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-dark-600 hover:bg-gray-200 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  #{tagName}
                </button>
              ))}
              {getAllTags().length > 20 && (
                <span className="px-3 py-1 text-xs text-gray-500 dark:text-gray-500">
                  +{getAllTags().length - 20} more tags available
                </span>
              )}
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Selected:</span>
                {selectedTags.map(tagName => (
                  <span
                    key={tagName}
                    className="flex items-center space-x-1 px-2 py-1 bg-primary-600 text-white text-xs rounded-full"
                  >
                    <span>#{tagName}</span>
                    <button
                      onClick={() => handleTagSelect(tagName)}
                      className="hover:bg-primary-700 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-300 dark:border-dark-700">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Active filters:</span>
                  {searchQuery && (
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {selectedLanguage && (
                    <span className="px-2 py-1 bg-green-600/20 text-green-600 dark:text-green-400 rounded">
                      Language: {selectedLanguage}
                    </span>
                  )}
                  {selectedTags.length > 0 && (
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-600 dark:text-purple-400 rounded">
                      Tags: {selectedTags.length}
                    </span>
                  )}
                </div>
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
        ) : filteredSnippets.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {filteredSnippets.map((snippet) => (
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
