import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Tag, User, Code, Folder } from 'lucide-react';
import { searchAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'all',
    language: searchParams.get('language') || '',
    tags: searchParams.getAll('tag') || [],
    dateRange: searchParams.get('date') || 'all',
    sortBy: searchParams.get('sort') || 'relevance'
  });
  const [results, setResults] = useState({
    snippets: [],
    projects: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const searchInputRef = useRef(null);

  const languages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php',
    'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'sql'
  ];

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Search different types based on filter
      if (filters.type === 'all' || filters.type === 'snippets') {
        const snippetResponse = await searchAPI.searchSnippets(query, {
          language: filters.language,
          tags: filters.tags.join(',')
        });
        setResults(prev => ({ 
          ...prev, 
          snippets: snippetResponse.data || snippetResponse.snippets || []
        }));
      }

      if (filters.type === 'all' || filters.type === 'projects') {
        const projectResponse = await searchAPI.searchProjects(query, {
          language: filters.language,
          tags: filters.tags.join(',')
        });
        setResults(prev => ({ 
          ...prev, 
          projects: projectResponse.data || projectResponse.projects || []
        }));
      }

      if (filters.type === 'all' || filters.type === 'users') {
        const userResponse = await searchAPI.searchUsers(query);
        setResults(prev => ({ 
          ...prev, 
          users: userResponse.data || userResponse.users || []
        }));
      }

      // Update URL params
      const params = new URLSearchParams();
      params.set('q', query);
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.set(key, value);
          }
        }
      });
      setSearchParams(params);
    } catch (error) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const addTag = (tag) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      language: '',
      tags: [],
      dateRange: 'all',
      sortBy: 'relevance'
    });
    setSearchParams(new URLSearchParams({ q: query }));
  };

  const getResultCount = () => {
    return results.snippets.length + results.projects.length + results.users.length;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search DevSpace
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find code snippets, projects, and developers
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for anything..."
                className="input-field pl-10 text-lg h-12 w-full"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {Object.values(filters).some(v => v && v !== 'all' && (!Array.isArray(v) || v.length > 0)) && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </button>

              {query && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {loading ? 'Searching...' : `${getResultCount()} results found`}
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-gray-300 dark:border-gray-700 pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="all">All Content</option>
                      <option value="snippets">Code Snippets</option>
                      <option value="projects">Projects</option>
                      <option value="users">Users</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={filters.language}
                      onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="">Any Language</option>
                      {languages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="input-field w-full"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="recent">Most Recent</option>
                      <option value="stars">Most Starred</option>
                      <option value="forks">Most Forked</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Search Results */}
        {query && !loading && (
          <div className="space-y-8">
            {/* Snippets */}
            {results.snippets.length > 0 && (
              <section>
                <div className="flex items-center space-x-2 mb-4">
                  <Code className="h-5 w-5 text-primary-500" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Code Snippets ({results.snippets.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {results.snippets.map((snippet) => (
                    <div key={snippet.id} className="card hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          <Link
                            to={`/snippet/${snippet.id}`}
                            className="hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {snippet.title}
                          </Link>
                        </h3>
                        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                          {snippet.language}
                        </span>
                      </div>
                      {snippet.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {snippet.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-3">
                          <span>❤️ {snippet.likes || 0}</span>
                          <span>👁️ {snippet.views || 0}</span>
                        </div>
                        <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {getResultCount() === 0 && (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Searching...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;