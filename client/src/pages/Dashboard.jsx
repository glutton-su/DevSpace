import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import ProjectCard from '../components/features/ProjectCard';
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
  X,
  Folder
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line
  }, [searchQuery, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  }, [searchQuery, setSearchParams]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const response = await projectAPI.getProjects(params);
      let filteredProjects = response.projects || response.data || response;
      switch (sortBy) {
        case 'popular':
          filteredProjects.sort((a, b) => (b.starCount || 0) - (a.starCount || 0));
          break;
        case 'views':
          filteredProjects.sort((a, b) => (b.views || 0) - (a.views || 0));
          break;
        case 'recent':
        default:
          filteredProjects.sort((a, b) => new Date(b.updated_at || b.updatedAt) - new Date(a.updated_at || a.updatedAt));
      }
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async (projectId) => {
    try {
      await projectAPI.starProject(projectId);
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, starCount: (project.starCount || 0) + 1, isStarred: !project.isStarred }
          : project
      ));
      toast.success('Project starred!');
    } catch (error) {
      console.error('Error starring project:', error);
      toast.error('Failed to star project');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = !!searchQuery;
  const itemCount = projects.length;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isAuthenticated ? `Welcome back, ${user?.name}!` : 'Discover Projects'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore and share amazing projects from the community
            </p>
          </div>
          {isAuthenticated && (
            <div className="mt-4 lg:mt-0 flex space-x-3">
              <Link
                to="/projects/new"
                className="btn-secondary flex items-center space-x-2"
              >
                <Folder className="h-4 w-4" />
                <span>New Project</span>
              </Link>
            </div>
          )}
        </div>

        {/* Tab Navigation (only Projects) */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-dark-800 rounded-lg p-1 mb-6">
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded text-sm transition-colors bg-primary-600 text-white"
            disabled
          >
            <Folder className="h-4 w-4" />
            <span>Projects</span>
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
                placeholder="Search projects..."
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
            <span>{itemCount} projects found</span>
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

        {/* Content Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading projects..." />
          </div>
        ) : projects.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onStar={handleStar}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="h-12 w-12 text-gray-400 dark:text-dark-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or clearing filters'
                  : 'Be the first to share a project!'
                }
              </p>
              {hasActiveFilters ? (
                <button onClick={clearFilters} className="btn-secondary mr-3">
                  Clear Filters
                </button>
              ) : null}
              {isAuthenticated && (
                <Link 
                  to="/projects/new"
                  className="btn-primary"
                >
                  Create Your First Project
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
