import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SnippetCard from './SnippetCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  Star, 
  GitFork, 
  Eye, 
  Calendar, 
  Code, 
  Users,
  Settings,
  Plus,
  Globe,
  Lock,
  Edit,
  Trash2,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectAPI, snippetAPI } from '../../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStarred, setIsStarred] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const loadProjectData = async () => {
      setLoading(true);
      await fetchProject();
      await fetchProjectSnippets();
      await fetchFiles();
      setLoading(false);
    };
    
    loadProjectData();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectAPI.getProject(id);
      const projectData = response.project || response;
      
      // Map the backend data to frontend expected structure
      const mappedProject = {
        id: projectData.id,
        name: projectData.title,
        description: projectData.description,
        owner: {
          id: projectData.owner?.id || projectData.userId,
          username: projectData.owner?.username,
          name: projectData.owner?.fullName || projectData.owner?.username,
          avatar: projectData.owner?.avatarUrl
        },
        languages: projectData.codeSnippets ? [...new Set(projectData.codeSnippets.map(s => s.language).filter(Boolean))] : [],
        tags: projectData.tags?.map(tag => tag.name) || [],
        stars: projectData.starCount || 0,
        forks: projectData.forkCount || 0,
        views: projectData.viewCount || 0,
        snippetsCount: projectData.codeSnippets?.length || 0,
        collaborators: projectData.collaborators?.length || 0,
        isPrivate: !projectData.isPublic,
        isArchived: projectData.isArchived || false,
        allowCollaboration: projectData.isCollaborative,
        template: projectData.template,
        createdAt: projectData.created_at || projectData.createdAt,
        updatedAt: projectData.updated_at || projectData.updatedAt,
        isStarred: projectData.isStarred || false
      };
      
      setProject(mappedProject);
      setIsStarred(mappedProject.isStarred);
      
      // Also set the snippets from the project data
      if (projectData.codeSnippets) {
        const mappedSnippets = projectData.codeSnippets.map(snippet => ({
          id: snippet.id,
          title: snippet.title,
          description: snippet.description,
          language: snippet.language,
          content: snippet.content,
          code: snippet.content, // For compatibility
          projectId: snippet.projectId,
          author: {
            id: projectData.owner?.id || projectData.userId,
            username: projectData.owner?.username,
            name: projectData.owner?.fullName || projectData.owner?.username,
            avatar: projectData.owner?.avatarUrl
          },
          tags: snippet.tags?.map(tag => tag.name) || [],
          likes: snippet.likeCount || 0,
          stars: snippet.starCount || 0,
          forks: snippet.forkCount || 0,
          views: snippet.viewCount || 0,
          createdAt: snippet.created_at || snippet.createdAt,
          updatedAt: snippet.updated_at || snippet.updatedAt,
          isPublic: snippet.isPublic,
          filePath: snippet.filePath
        }));
        
        setSnippets(mappedSnippets);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      navigate('/projects');
    }
  };

  const fetchProjectSnippets = async () => {
    // Snippets are now fetched as part of fetchProject
    // This function is kept for compatibility but doesn't need to do anything
    setLoading(false);
  };

  const fetchFiles = async () => {
    try {
      const response = await fileAPI.getProjectFiles(id);
      setFiles(response.files || response.data || []);
    } catch (e) {
      setFiles([]);
    }
  };

  const handleStar = async () => {
    try {
      setIsStarred(!isStarred);
      setProject(prev => ({
        ...prev,
        stars: prev.stars + (isStarred ? -1 : 1)
      }));
      toast.success(isStarred ? 'Removed star' : 'Starred project');
    } catch (error) {
      setIsStarred(isStarred);
      toast.error('Failed to update star');
    }
  };

  const handleFork = async () => {
    try {
      toast.success('Project forked successfully!');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to fork project');
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: project.name,
          text: project.description,
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share project');
    }
  };

  const isOwner = project?.owner.id === user?.id;

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Project Header */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Link 
                      to={`/profile/${project.owner.username}`}
                      className="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      {project.owner.name}
                    </Link>
                    <span className="text-dark-400">/</span>
                    <span className="text-dark-200">{project.name}</span>
                    <div className="flex items-center space-x-1 ml-2">
                      {project.isPrivate ? (
                        <Lock className="h-4 w-4 text-dark-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-dark-400" />
                      )}
                      <span className="text-xs text-dark-400">
                        {project.isPrivate ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-dark-300 mb-4 leading-relaxed">{project.description}</p>

              {files.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Project Files</h3>
                  <ul className="list-disc list-inside text-dark-200">
                    {files.map(file => (
                      <li key={file.id}>
                        <a
                          href={file.url || file.path || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-400 hover:underline"
                        >
                          {file.name || file.filename || 'File'}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-dark-800 text-dark-300 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-dark-400">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>{project.stars} stars</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GitFork className="h-4 w-4" />
                  <span>{project.forks} forks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{project.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Code className="h-4 w-4" />
                  <span>{project.snippetsCount} snippets</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 mt-6 lg:mt-0">
              {isOwner ? (
                <>
                  <Link
                    to={`/project/${project.id}/edit`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  <Link
                    to={`/project/${project.id}/settings`}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={handleStar}
                    className={`btn-secondary flex items-center space-x-2 ${
                      isStarred ? 'bg-yellow-600 hover:bg-yellow-700' : ''
                    }`}
                  >
                    <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
                    <span>{isStarred ? 'Starred' : 'Star'}</span>
                  </button>
                  <button
                    onClick={handleFork}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <GitFork className="h-4 w-4" />
                    <span>Fork</span>
                  </button>
                </>
              )}
              
              <button
                onClick={handleShare}
                className="btn-secondary flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>

              {isOwner && (
                <Link
                  to={`/create?project=${project.id}`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Snippet</span>
                </Link>
              )}
              
              {!isOwner && project.allowCollaboration && (
                <Link
                  to={`/collaborate/${project.id}`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Join Collaboration</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-dark-400">Owner:</span>
                  <Link 
                    to={`/profile/${project.owner.username}`}
                    className="ml-2 text-primary-400 hover:text-primary-300"
                  >
                    {project.owner.name}
                  </Link>
                </div>
                
                <div>
                  <span className="text-dark-400">Created:</span>
                  <span className="ml-2 text-dark-200">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div>
                  <span className="text-dark-400">Languages:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-600 text-white rounded text-xs"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {project.allowCollaboration && (
                  <div>
                    <span className="text-dark-400">Collaborators:</span>
                    <div className="flex items-center space-x-1 mt-1">
                      <Users className="h-4 w-4 text-dark-400" />
                      <span className="text-dark-200">{project.collaborators}</span>
                      <span className="text-xs text-green-400 ml-1">• Open to collaboration</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Code Snippets ({snippets.length})
              </h2>
              
              {isOwner && (
                <Link
                  to={`/create?project=${project.id}`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Snippet</span>
                </Link>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading snippets..." />
              </div>
            ) : snippets.length > 0 ? (
              <div className="space-y-6">
                {snippets.map((snippet) => (
                  <SnippetCard
                    key={snippet.id}
                    snippet={snippet}
                    showFullCode={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Code className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No snippets yet</h3>
                <p className="text-dark-400 mb-6">
                  {isOwner 
                    ? "Start building your project by adding code snippets"
                    : "This project doesn't have any snippets yet"
                  }
                </p>
                {isOwner && (
                  <Link
                    to={`/create?project=${project.id}`}
                    className="btn-primary"
                  >
                    Add Your First Snippet
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;