import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Tag, Filter, X } from 'lucide-react';
import { tagAPI, snippetAPI } from '../services/api';
import SnippetCard from '../components/features/SnippetCard';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [snippets, setSnippets] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Parse URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tagParam = params.get('tag');
    const queryParam = params.get('q');
    const langParam = params.get('language');

    if (tagParam) {
      setSelectedTags([tagParam]);
    }
    if (queryParam) {
      setSearchQuery(queryParam);
    }
    if (langParam) {
      setSelectedLanguage(langParam);
    }
  }, [location.search]);

  // Load tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const [allTagsResponse, popularTagsResponse] = await Promise.all([
          tagAPI.getAllTags(),
          tagAPI.getPopularTags(50)
        ]);
        setAllTags(allTagsResponse);
        setPopularTags(popularTagsResponse);
      } catch (error) {
        console.error('Error loading tags:', error);
        toast.error('Failed to load tags');
      }
    };
    loadTags();
  }, []);

  // Perform search when filters change
  useEffect(() => {
    performSearch();
  }, [selectedTags, searchQuery, selectedLanguage, pagination.page]);

  const performSearch = async () => {
    try {
      setLoading(true);
      let searchResults;

      const params = {
        page: pagination.page,
        limit: 20
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedLanguage) params.language = selectedLanguage;

      if (selectedTags.length > 0) {
        // If we have tags selected, search by tags
        if (selectedTags.length === 1) {
          searchResults = await tagAPI.searchSnippetsByTag(selectedTags[0], params);
        } else {
          // For multiple tags, use the general search with tags parameter
          params.tags = selectedTags;
          searchResults = await snippetAPI.getPublicSnippets(params);
        }
      } else {
        // General search without tag filtering
        searchResults = await snippetAPI.getPublicSnippets(params);
      }

      setSnippets(searchResults.snippets || []);
      setPagination({
        page: searchResults.page || 1,
        totalPages: searchResults.totalPages || 1,
        total: searchResults.total || 0
      });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tagName) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
      updateUrl([...selectedTags, tagName], searchQuery, selectedLanguage);
    }
  };

  const handleRemoveTag = (tagName) => {
    const newTags = selectedTags.filter(tag => tag !== tagName);
    setSelectedTags(newTags);
    updateUrl(newTags, searchQuery, selectedLanguage);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrl(selectedTags, searchQuery, selectedLanguage);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    updateUrl(selectedTags, searchQuery, language);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const updateUrl = (tags, query, language) => {
    const params = new URLSearchParams();
    if (tags.length > 0) params.set('tag', tags.join(','));
    if (query) params.set('q', query);
    if (language) params.set('language', language);
    
    const newUrl = `/search${params.toString() ? '?' + params.toString() : ''}`;
    navigate(newUrl, { replace: true });
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSearchQuery('');
    setSelectedLanguage('');
    setPagination(prev => ({ ...prev, page: 1 }));
    navigate('/search', { replace: true });
  };

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'HTML', 'CSS', 'SQL'
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">Search Code Snippets</h1>
          <p className="text-dark-300 text-center">
            Find snippets by keywords, tags, or programming language
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-6">
            {/* Text Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, content, or description..."
                className="input-field w-full pl-12"
              />
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="input-field w-full"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Selected Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
              {(selectedTags.length > 0 || searchQuery || selectedLanguage) && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Tags */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {popularTags.map(tag => (
                  <button
                    key={tag.name}
                    onClick={() => handleAddTag(tag.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedTags.includes(tag.name)
                        ? 'bg-blue-600 text-white'
                        : 'bg-dark-700 hover:bg-dark-600 text-dark-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-2" />
                        {tag.name}
                      </span>
                      <span className="text-xs text-dark-400">
                        {tag.dataValues?.snippetCount || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Search Results ({pagination.total} snippets)
                  </h2>
                </div>

                {snippets.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-dark-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-dark-300 mb-2">
                      No snippets found
                    </h3>
                    <p className="text-dark-400">
                      Try adjusting your search criteria or removing some filters.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {snippets.map(snippet => (
                      <SnippetCard key={snippet.id} snippet={snippet} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex space-x-2">
                      {pagination.page > 1 && (
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white"
                        >
                          Previous
                        </button>
                      )}
                      
                      <span className="px-3 py-2 text-dark-300">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      
                      {pagination.page < pagination.totalPages && (
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          className="px-3 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-white"
                        >
                          Next
                        </button>
                      )}
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
