import { useState } from 'react';
import TagSearch from '../components/features/TagSearch';

const TestTagSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const handleSearch = (searchParams) => {
    console.log('Test: handleSearch called with:', searchParams);
    alert(`Search called with: ${JSON.stringify(searchParams)}`);
  };

  const handleTagSelect = (tags) => {
    console.log('Test: handleTagSelect called with:', tags);
    setSelectedTags(tags);
  };

  const handleLanguageSelect = (language) => {
    console.log('Test: handleLanguageSelect called with:', language);
    setSelectedLanguage(language);
  };

  const handleSearchQueryChange = (query) => {
    console.log('Test: handleSearchQueryChange called with:', query);
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">TagSearch Component Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl mb-4">Current State:</h2>
        <pre className="bg-dark-800 p-4 rounded">
          {JSON.stringify({
            searchQuery,
            selectedTags,
            selectedLanguage
          }, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl mb-4">Compact Version:</h2>
        <TagSearch
          onSearch={handleSearch}
          onTagSelect={handleTagSelect}
          onLanguageSelect={handleLanguageSelect}
          onSearchQueryChange={handleSearchQueryChange}
          selectedTags={selectedTags}
          selectedLanguage={selectedLanguage}
          searchQuery={searchQuery}
          placeholder="Test search..."
          compact={true}
        />
      </div>

      <div>
        <h2 className="text-xl mb-4">Full Version:</h2>
        <TagSearch
          onSearch={handleSearch}
          onTagSelect={handleTagSelect}
          onLanguageSelect={handleLanguageSelect}
          onSearchQueryChange={handleSearchQueryChange}
          selectedTags={selectedTags}
          selectedLanguage={selectedLanguage}
          searchQuery={searchQuery}
          placeholder="Test search..."
          compact={false}
        />
      </div>
    </div>
  );
};

export default TestTagSearch;
