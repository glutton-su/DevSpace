import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Folder, 
  Star, 
  GitFork, 
  Eye, 
  Calendar, 
  Code, 
  Users,
  Lock,
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  Archive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { fileAPI } from '../../services/api';

const ProjectCard = ({ project, onStar, onFork, onDelete, onArchive }) => {
  const { user } = useAuth();
  const [isStarred, setIsStarred] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = project.owner.id === user?.id;
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fileAPI.getProjectFiles(project.id);
        setFiles(response.files || response.data || []);
      } catch (e) {
        setFiles([]);
      }
    };
    fetchFiles();
  }, [project.id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-600',
      python: 'bg-blue-600',
      java: 'bg-orange-600',
      cpp: 'bg-purple-600',
      css: 'bg-pink-600',
      html: 'bg-red-600',
      typescript: 'bg-blue-500',
      php: 'bg-indigo-600',
      ruby: 'bg-red-500',
      go: 'bg-cyan-600'
    };
    return colors[language] || 'bg-gray-600';
  };

  const handleStar = async () => {
    try {
      setIsStarred(!isStarred);
      if (onStar) {
        await onStar(project.id);
      }
      toast.success(isStarred ? 'Removed star' : 'Starred project');
    } catch (error) {
      setIsStarred(isStarred);
      toast.error('Failed to update star');
    }
  };

  const handleFork = async () => {
    try {
      if (onFork) {
        await onFork(project.id);
      }
      toast.success('Project forked successfully!');
    } catch (error) {
      toast.error('Failed to fork project');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        if (onDelete) {
          await onDelete(project.id);
        }
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleArchive = async () => {
    try {
      if (onArchive) {
        await onArchive(project.id);
      }
      toast.success(project.isArchived ? 'Project unarchived' : 'Project archived');
    } catch (error) {
      toast.error('Failed to archive project');
    }
  };

  return (
    <div className="card hover:shadow-2xl transition-all duration-300 group relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 bg-primary-600 rounded-lg">
            <Folder className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <Link 
              to={`/project/${project.id}`}
              className="block group-hover:text-primary-400 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                {project.name}
              </h3>
            </Link>
            <p className="text-dark-300 text-sm mb-2 line-clamp-2">
              {project.description}
            </p>
            {files.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-dark-400">Files: </span>
                {files.slice(0, 3).map(file => (
                  <a
                    key={file.id}
                    href={file.url || file.path || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 hover:underline mr-2"
                  >
                    {file.name || file.filename || 'File'}
                  </a>
                ))}
                {files.length > 3 && <span className="text-xs text-dark-400">+{files.length - 3} more</span>}
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-dark-400 hover:text-white transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-48 glass-effect rounded-lg shadow-lg py-2 z-10">
              {isOwner ? (
                <>
                  <Link
                    to={`/project/${project.id}/edit`}
                    className="flex items-center space-x-2 px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleArchive();
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors w-full text-left"
                  >
                    <Archive className="h-4 w-4" />
                    <span>{project.isArchived ? 'Unarchive' : 'Archive'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-dark-800 transition-colors w-full text-left"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleFork();
                      setShowMenu(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors w-full text-left"
                  >
                    <GitFork className="h-4 w-4" />
                    <span>Fork</span>
                  </button>
                  {project.allowCollaboration && (
                    <Link
                      to={`/collaborate/${project.id}`}
                      className="flex items-center space-x-2 px-4 py-2 text-dark-200 hover:bg-dark-800 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Collaborate</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Owner Info */}
      <div className="flex items-center space-x-2 mb-4">
        <img
          src={project.owner.avatar}
          alt={project.owner.name}
          className="h-6 w-6 rounded-full object-cover"
        />
        <Link 
          to={`/profile/${project.owner.username}`}
          className="text-dark-200 hover:text-white transition-colors text-sm font-medium"
        >
          {project.owner.name}
        </Link>
      </div>

      {/* Languages */}
      {project.languages && project.languages.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.languages.slice(0, 3).map((lang, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getLanguageColor(lang)}`}
            >
              {lang}
            </span>
          ))}
          {project.languages.length > 3 && (
            <span className="px-2 py-1 bg-dark-700 text-dark-300 rounded-full text-xs">
              +{project.languages.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag, index) => (
            <Link
              key={tag.id || index}
              to={`/search?tag=${tag.name || tag}`}
              className="px-2 py-1 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white text-xs rounded-full transition-colors"
            >
              #{tag.name || tag}
            </Link>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 bg-dark-700 text-dark-300 rounded-full text-xs">
              +{project.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-dark-400 mb-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Code className="h-3 w-3" />
            <span>{project.snippetsCount || 0}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Users className="h-3 w-3" />
            <span>{project.collaborators || 0}</span>
            {project.allowCollaboration && (
              <span className="text-xs text-green-400 ml-1">• Open</span>
            )}
          </span>
          <span className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{project.views || 0}</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(project.updatedAt)}</span>
          </span>
          <div className="flex items-center space-x-1">
            {project.isPrivate ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleStar}
            className={`flex items-center space-x-1 transition-colors ${
              isStarred ? 'text-yellow-500' : 'text-dark-400 hover:text-yellow-500'
            }`}
          >
            <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
            <span className="text-sm">{project.stars + (isStarred ? 1 : 0)}</span>
          </button>

          <button
            onClick={handleFork}
            className="flex items-center space-x-1 text-dark-400 hover:text-green-500 transition-colors"
          >
            <GitFork className="h-4 w-4" />
            <span className="text-sm">{project.forks || 0}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {!isOwner && project.allowCollaboration && (
            <Link
              to={`/collaborate/${project.id}`}
              className="btn-secondary text-sm px-4 py-2 flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Collaborate</span>
            </Link>
          )}
          <Link
            to={`/project/${project.id}`}
            className="btn-primary text-sm px-4 py-2"
          >
            View Project
          </Link>
        </div>
      </div>

      {/* Archived Badge */}
      {project.isArchived && (
        <div className="absolute top-2 right-2">
          <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">
            Archived
          </span>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;