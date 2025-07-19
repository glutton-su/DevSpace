import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI } from '../services/api';
import ProjectCard from '../components/features/ProjectCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter, 
  Folder,
  Star,
  GitFork,
  Archive,
  Grid,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'owned', 'starred', 'forked'
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [filterType, sortBy, showArchived]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.filter = filterType;
      if (showArchived) params.includeArchived = true;
      
      const response = await projectAPI.getProjects(params);
      let filteredProjects = response.projects || response.data || response;

      // Apply client-side filters if needed
      if (filterType === 'owned') {
        filteredProjects = filteredProjects.filter(p => p.owner?.id === user?.id);
      } else if (filterType === 'starred') {
        // This would be handled by backend with user's starred projects
        filteredProjects = filteredProjects.filter(p => p.isStarred);
      } else if (filterType === 'forked') {
        // This would be handled by backend with user's forked projects
        filteredProjects = filteredProjects.filter(p => p.forkedFrom);
      }

      // Show/hide archived
      if (!showArchived) {
        filteredProjects = filteredProjects.filter(p => !p.isArchived);
      }

      // Sort projects
      switch (sortBy) {
        case 'name':
          filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'stars':
          filteredProjects.sort((a, b) => b.starCount - a.starCount);
          break;
        case 'updated':
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
          ? { ...project, starCount: project.starCount + 1, isStarred: !project.isStarred }
          : project
      ));
      toast.success('Project starred!');
    } catch (error) {
      console.error('Error starring project:', error);
      toast.error('Failed to star project');
    }
  };

  const handleFork = async (projectId) => {
    try {
      const response = await projectAPI.forkProject(projectId);
      const forkedProject = response.project || response.data || response;
      
      setProjects(prev => [forkedProject, ...prev.map(p => 
        p.id === projectId ? { ...p, forkCount: p.forkCount + 1 } : p
      )]);
      toast.success('Project forked successfully!');
    } catch (error) {
      console.error('Error forking project:', error);
      toast.error('Failed to fork project');
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        toast.success('Project deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleArchive = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      await projectAPI.updateProject(projectId, { isArchived: !project.isArchived });
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, isArchived: !project.isArchived }
          : project
      ));
      toast.success(project.isArchived ? 'Project unarchived' : 'Project archived');
    } catch (error) {
      console.error('Error archiving project:', error);
      toast.error('Failed to archive project');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.tags && project.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filterOptions = [
    { value: 'all', label: 'All Projects', icon: Folder },
    { value: 'owned', label: 'My Projects', icon: Folder },
    { value: 'starred', label: 'Starred', icon: Star },
    { value: 'forked', label: 'Forked', icon: GitFork }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-dark-300">
              Organize your code snippets into projects for better collaboration
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <Link
              to="/projects/new"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="input-field pl-10 w-full"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-dark-800 rounded-lg p-1">
              {filterOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded text-sm transition-colors ${
                      filterType === option.value
                        ? 'bg-primary-600 text-white'
                        : 'text-dark-300 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
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

              <div className="flex items-center bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Show Archived Toggle */}
          <div className="mt-4 pt-4 border-t border-dark-700">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded border-dark-600 bg-dark-700 text-primary-600 focus:ring-primary-500"
              />
              <Archive className="h-4 w-4 text-dark-400" />
              <span className="text-dark-300">Show archived projects</span>
            </label>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-dark-400">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Projects Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading projects..." />
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-6'
          }>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onStar={handleStar}
                onFork={handleFork}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="h-12 w-12 text-dark-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-dark-400 mb-6">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search criteria'
                : 'Create your first project to organize your code snippets!'
              }
            </p>
            <Link to="/projects/new" className="btn-primary">
              Create Your First Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;