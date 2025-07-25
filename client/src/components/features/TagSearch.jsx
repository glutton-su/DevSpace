import { useState, useEffect, useRef } from 'react';
import { Search, Tag, X, Filter } from 'lucide-react';
import { tagAPI } from '../../services/api';

const TagSearch = ({ 
  onSearch, 
  onTagSelect, 
  onLanguageSelect, 
  selectedTags = [], 
  selectedLanguage = '', 
  searchQuery = '',
  onSearchQueryChange,
  placeholder = "Search snippets by title, content...",
  showLanguageFilter = true,
  compact = false
}) => {
  const [allTags, setAllTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const compactDropdownRef = useRef(null);
  const fullDropdownRef = useRef(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const [allTagsResponse, popularTagsResponse] = await Promise.all([
          tagAPI.getAllTags(),
          tagAPI.getPopularTags(20)
        ]);
        setAllTags(allTagsResponse);
        setPopularTags(popularTagsResponse);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    loadTags();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (compactDropdownRef.current && !compactDropdownRef.current.contains(event.target)) &&
        (fullDropdownRef.current && !fullDropdownRef.current.contains(event.target))
      ) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('TagSearch: handleSearchSubmit called with:', {
      search: searchQuery,
      tags: selectedTags,
      language: selectedLanguage
    });
    onSearch && onSearch({
      search: searchQuery,
      tags: selectedTags,
      language: selectedLanguage
    });
  };

  const handleAddTag = (tagName) => {
    console.log('TagSearch: Adding tag:', tagName);
    if (!selectedTags.includes(tagName)) {
      const newTags = [...selectedTags, tagName];
      console.log('TagSearch: New tags:', newTags);
      onTagSelect && onTagSelect(newTags);
    }
    setShowTagDropdown(false);
    setTagSearchQuery('');
  };

  const handleRemoveTag = (tagName) => {
    const newTags = selectedTags.filter(tag => tag !== tagName);
    onTagSelect && onTagSelect(newTags);
  };

  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  );

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'HTML', 'CSS', 'SQL'
  ];

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange && onSearchQueryChange(e.target.value)}
              placeholder={placeholder}
              className="input-field w-full pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-600 text-white"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Language Filter */}
          {showLanguageFilter && (
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageSelect && onLanguageSelect(e.target.value)}
              className="text-xs px-2 py-1 rounded bg-dark-700 text-white border border-dark-600"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          )}

          {/* Tag Selector */}
          <div className="relative" ref={compactDropdownRef}>
            <button
              type="button"
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="text-xs px-2 py-1 rounded bg-dark-700 text-white border border-dark-600 flex items-center"
            >
              <Tag className="h-3 w-3 mr-1" />
              Add Tag
            </button>

            {showTagDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-50">
                <div className="p-2">
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="Search tags..."
                    className="w-full px-2 py-1 text-xs bg-dark-700 border border-dark-600 rounded"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {(tagSearchQuery ? filteredTags : popularTags).slice(0, 10).map(tag => (
                    <button
                      key={tag.name}
                      onClick={() => handleAddTag(tag.name)}
                      className="w-full text-left px-3 py-1 text-xs hover:bg-dark-700 text-white"
                    >
                      {tag.name} {tag.dataValues?.snippetCount && `(${tag.dataValues.snippetCount})`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        {/* Text Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange && onSearchQueryChange(e.target.value)}
            placeholder={placeholder}
            className="input-field w-full pl-12"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language Filter */}
          {showLanguageFilter && (
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageSelect && onLanguageSelect(e.target.value)}
                className="input-field w-full"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tag Selector */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Tags
            </label>
            <div className="relative" ref={fullDropdownRef}>
              <button
                type="button"
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="input-field w-full text-left flex items-center justify-between"
              >
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Select tags...
                </span>
                <Filter className="h-4 w-4" />
              </button>

              {showTagDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-dark-800 border border-dark-600 rounded-lg shadow-lg z-50">
                  <div className="p-3">
                    <input
                      type="text"
                      value={tagSearchQuery}
                      onChange={(e) => setTagSearchQuery(e.target.value)}
                      placeholder="Search tags..."
                      className="input-field w-full"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {(tagSearchQuery ? filteredTags : popularTags).map(tag => (
                      <button
                        key={tag.name}
                        onClick={() => handleAddTag(tag.name)}
                        className="w-full text-left px-3 py-2 hover:bg-dark-700 text-white flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <Tag className="h-3 w-3 mr-2" />
                          {tag.name}
                        </span>
                        {tag.dataValues?.snippetCount && (
                          <span className="text-xs text-dark-400">
                            {tag.dataValues.snippetCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
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

        {/* Search Button */}
        <button
          type="submit"
          className="btn-primary flex items-center space-x-2"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default TagSearch;
