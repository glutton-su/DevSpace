import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SnippetCard from '../components/features/SnippetCard';
import { normalizeSnippets } from '../utils/dataUtils';
import { 
  Plus, 
  Users, 
  Code,
  Globe,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const Collaborate = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('all');

  useEffect(() => {
    fetchCollaborativeSnippets();
  }, []);

  const fetchCollaborativeSnippets = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching collaborative snippets...');
      const response = await snippetAPI.getCollaborativeSnippets();
      console.log('📦 API Response:', response);
      console.log('📊 Response snippets:', response.snippets);
      
      if (response && response.snippets && Array.isArray(response.snippets)) {
        console.log('✅ Setting snippets:', response.snippets.length, 'items');
        // Normalize the snippets data (especially tags)
        const normalizedSnippets = normalizeSnippets(response.snippets);
        setSnippets(normalizedSnippets);
      } else {
        console.warn('⚠️  Invalid response format, falling back to empty array');
        setSnippets([]);
      }
    } catch (error) {
      console.error('❌ Error fetching collaborative snippets:', error);
      toast.error('Failed to load collaborative snippets');
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = (() => {
    console.log('🔄 Current snippets state:', snippets);
    console.log('🔄 Is snippets an array?', Array.isArray(snippets));
    
    if (!Array.isArray(snippets)) {
      console.warn('⚠️  snippets is not an array, returning empty array');
      return [];
    }
    
    return snippets.filter(snippet => {
      console.log('🔍 Filtering snippet:', snippet);
      const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (snippet.description && snippet.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesFilter = filterLanguage === 'all' || snippet.language === filterLanguage;
      
      return matchesSearch && matchesFilter;
    });
  })();

  const languages = ['all', ...new Set(snippets.map(s => s.language).filter(Boolean))];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Collaborative Code Snippets</h1>
            <p className="text-gray-600 dark:text-dark-300">
              Discover and collaborate on code snippets shared by the community
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-4">
            <button
              onClick={fetchCollaborativeSnippets}
              disabled={loading}
              className="btn-secondary flex items-center space-x-2"
            >
              <Code className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <Link
              to="/create"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Snippet</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets by title or description..."
                className="input-field pl-10 w-full"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="input-field min-w-[120px]"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <Code className="h-6 w-6 text-primary-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{snippets.length}</span>
            </div>
            <p className="text-gray-600 dark:text-dark-300">Collaborative Snippets</p>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-green-400 mr-2" />
              <span className="text-2xl font-bold text-white">
                {(() => {
                  const allContributors = new Set();
                  
                  // Add snippet owners
                  snippets.forEach(snippet => {
                    if (snippet.User?.username) {
                      allContributors.add(snippet.User.username);
                    }
                    if (snippet.author?.username) {
                      allContributors.add(snippet.author.username);
                    }
                  });
                  
                  // Add direct snippet collaborators
                  snippets.forEach(snippet => {
                    if (snippet.collaborators && Array.isArray(snippet.collaborators)) {
                      snippet.collaborators.forEach(collaborator => {
                        if (collaborator.User?.username) {
                          allContributors.add(collaborator.User.username);
                        }
                        if (collaborator.username) {
                          allContributors.add(collaborator.username);
                        }
                      });
                    }
                  });
                  
                  // Add project collaborators
                  snippets.forEach(snippet => {
                    if (snippet.project?.collaborators && Array.isArray(snippet.project.collaborators)) {
                      snippet.project.collaborators.forEach(collaborator => {
                        if (collaborator.User?.username) {
                          allContributors.add(collaborator.User.username);
                        }
                        if (collaborator.username) {
                          allContributors.add(collaborator.username);
                        }
                      });
                    }
                  });
                  
                  return allContributors.size;
                })()}
              </span>
            </div>
            <p className="text-gray-600 dark:text-dark-300">Active Contributors</p>
          </div>
          
          <div className="card text-center">
            <div className="flex items-center justify-center mb-2">
              <Globe className="h-6 w-6 text-secondary-400 mr-2" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {languages.length - 1}
              </span>
            </div>
            <p className="text-gray-600 dark:text-dark-300">Programming Languages</p>
          </div>
        </div>

        {/* Snippets Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading collaborative snippets..." />
          </div>
        ) : filteredSnippets.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSnippets.map((snippet) => (
              <SnippetCard 
                key={snippet.id} 
                snippet={snippet}
                showCollaborationBadge={true}
                showManageOption={true}
                onCollaborate={fetchCollaborativeSnippets}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="h-12 w-12 text-gray-400 dark:text-dark-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No collaborative snippets found</h3>
            <p className="text-gray-600 dark:text-dark-400 mb-6">
              {searchQuery || filterLanguage !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Be the first to create a collaborative snippet!'
              }
            </p>
            <Link
              to="/create"
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span>Create Collaborative Snippet</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Collaborate;
