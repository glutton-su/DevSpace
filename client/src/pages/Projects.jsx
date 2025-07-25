import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetAPI } from '../services/api';
import SnippetCard from '../components/features/SnippetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { normalizeSnippets } from '../utils/dataUtils';
import { 
  Plus, 
  Search, 
  Filter, 
  Code,
  Star,
  GitFork,
  Archive,
  Grid,
  List,
  Tag,
  X,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
// commit test
const Projects = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [filterType, setFilterType] = useState(user ? 'owned' : 'all'); // Default to 'all' for unauthenticated users
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [showArchived, setShowArchived] = useState(false);

  // Update filter type when user authentication changes
  useEffect(() => {
    if (!user && (filterType === 'owned' || filterType === 'starred' || filterType === 'forked')) {
      setFilterType('all');
    }
  }, [user, filterType]);

  useEffect(() => {
    fetchSnippets();
  }, [filterType, sortBy, showArchived]);

  const fetchSnippets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (showArchived) params.includeArchived = true;
      
      let response;
      switch (filterType) {
        case 'owned':
          if (!user) {
            setSnippets([]);
            return;
          }
          response = await snippetAPI.getUserOwnedSnippets(params);
          break;
        case 'starred':
          if (!user) {
            setSnippets([]);
            return;
          }
          response = await snippetAPI.getUserStarredSnippets(params);
          break;
        case 'forked':
          if (!user) {
            setSnippets([]);
            return;
          }
          response = await snippetAPI.getUserForkedSnippets(params);
          break;
        case 'all':
          response = await snippetAPI.getPublicSnippets(params);
          break;
        default:
          response = await snippetAPI.getPublicSnippets(params);
      }
      
      let allSnippets = response.snippets || response.data || response;

      if (!Array.isArray(allSnippets)) {
        allSnippets = [];
      }

      // Normalize the snippets data (especially tags)
      allSnippets = normalizeSnippets(allSnippets);

      console.log('Setting snippets:', allSnippets.length, 'items');
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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedLanguage('');
  };

  const handleStar = async (snippetId) => {
    try {
      await snippetAPI.toggleStar(snippetId);
      setSnippets(prev => prev.map(snippet => 
        snippet.id === snippetId 
          ? { ...snippet, starCount: (snippet.starCount || 0) + (snippet.isStarred ? -1 : 1), isStarred: !snippet.isStarred }
          : snippet
      ));
      toast.success('Snippet starred!');
    } catch (error) {
      console.error('Error starring snippet:', error);
      toast.error('Failed to star snippet');
    }
  };

  const handleFork = async (snippetId) => {
    try {
      const response = await snippetAPI.forkSnippet(snippetId);
      const forkedSnippet = response.snippet || response.data || response;
      
      setSnippets(prev => [forkedSnippet, ...prev.map(s => 
        s.id === snippetId ? { ...s, forkCount: (s.forkCount || 0) + 1 } : s
      )]);
      toast.success('Snippet forked successfully!');
    } catch (error) {
      console.error('Error forking snippet:', error);
      toast.error('Failed to fork snippet');
    }
  };

  const handleDelete = async (snippetId) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await snippetAPI.deleteSnippet(snippetId);
        setSnippets(prev => prev.filter(s => s.id !== snippetId));
        toast.success('Snippet deleted successfully');
      } catch (error) {
        console.error('Error deleting snippet:', error);
        toast.error('Failed to delete snippet');
      }
    }
  };

  const handleArchive = async (snippetId) => {
    try {
      const snippet = snippets.find(s => s.id === snippetId);
      await snippetAPI.updateSnippet(snippetId, { isArchived: !snippet.isArchived });
      setSnippets(prev => prev.map(snippet => 
        snippet.id === snippetId 
          ? { ...snippet, isArchived: !snippet.isArchived }
          : snippet
      ));
      toast.success(snippet.isArchived ? 'Snippet unarchived' : 'Snippet archived');
    } catch (error) {
      console.error('Error archiving snippet:', error);
      toast.error('Failed to archive snippet');
    }
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
      case 'name':
        filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'stars':
        filtered.sort((a, b) => (b.starCount || 0) - (a.starCount || 0));
        break;
      case 'updated':
      default:
        filtered.sort((a, b) => new Date(b.updated_at || b.updatedAt) - new Date(a.updated_at || a.updatedAt));
    }

    return filtered;
  })();

  const allFilterOptions = [
    { value: 'all', label: 'All Snippets', icon: Code },
    { value: 'owned', label: 'My Snippets', icon: Code },
    { value: 'starred', label: 'Starred', icon: Star },
    { value: 'forked', label: 'Forked', icon: GitFork }
  ];

  // Filter options based on authentication status
  const filterOptions = user 
    ? allFilterOptions 
    : allFilterOptions.filter(option => option.value === 'all');

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user ? 'My Snippets' : 'Code Snippets'}
            </h1>
            <p className="text-gray-600 dark:text-dark-300">
              {user ? 'Manage and organize your code snippets' : 'Discover and explore code snippets'}
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            {user ? (
              <Link
                to="/create"
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Snippet</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-secondary flex items-center space-x-2"
              >
                <span>Login to Create</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-dark-400" />
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
                <option value="updated">Last Updated</option>
                <option value="name">Name</option>
                <option value="stars">Stars</option>
              </select>

              <div className="flex items-center bg-gray-100 dark:bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            {filterOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilterType(option.value)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${
                    filterType === option.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tag Filter */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500 dark:text-dark-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-dark-300">Filter by Tags</span>
              </div>
              {(selectedTags.length > 0 || selectedLanguage || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center space-x-1"
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
                      : 'bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-dark-300 border-gray-300 dark:border-dark-600 hover:bg-gray-200 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  #{tagName}
                </button>
              ))}
              {getAllTags().length > 20 && (
                <span className="px-3 py-1 text-xs text-gray-500 dark:text-dark-500">
                  +{getAllTags().length - 20} more tags available
                </span>
              )}
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 dark:text-dark-400">Selected:</span>
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

          {/* Show Archived Toggle */}
          <div className="mt-4 pt-4 border-t border-dark-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-primary-600 focus:ring-primary-500"
              />
              <Archive className="h-4 w-4 text-gray-500 dark:text-dark-400" />
              <span className="text-gray-700 dark:text-dark-300">Show archived snippets</span>
            </label>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-dark-400">
              {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''} found
              {snippets.length !== filteredSnippets.length && (
                <span className="text-gray-500 dark:text-dark-500"> (from {snippets.length} total)</span>
              )}
            </div>
            
            {/* Active Filters Summary */}
            {(searchQuery || selectedTags.length > 0 || selectedLanguage) && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-500 dark:text-dark-500">Filtered by:</span>
                {searchQuery && (
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                    Search: "{searchQuery}"
                  </span>
                )}
                {selectedLanguage && (
                  <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded">
                    Language: {selectedLanguage}
                  </span>
                )}
                {selectedTags.length > 0 && (
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
                    Tags: {selectedTags.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Snippets Grid/List */}
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
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="h-12 w-12 text-gray-400 dark:text-dark-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No snippets found</h3>
            <p className="text-gray-600 dark:text-dark-400 mb-6">
              {searchQuery || selectedTags.length > 0 || selectedLanguage || filterType !== 'all' 
                ? 'Try adjusting your search criteria or filters'
                : 'Create your first snippet to get started!'
              }
            </p>
            <Link to="/create" className="btn-primary">
              Create Your First Snippet
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;