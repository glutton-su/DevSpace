import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Save, 
  X, 
  Globe, 
  Lock, 
  Users, 
  Code, 
  Tag,
  Upload,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: [],
    isPrivate: false,
    allowCollaboration: true,
    template: 'blank' // 'blank', 'react', 'python', 'web'
  });
  const [tagInput, setTagInput] = useState('');

  const templates = [
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start with an empty project',
      icon: FileText
    },
    {
      id: 'react',
      name: 'React App',
      description: 'React application with common components',
      icon: Code
    },
    {
      id: 'python',
      name: 'Python Project',
      description: 'Python project with utilities and examples',
      icon: Code
    },
    {
      id: 'web',
      name: 'Web Project',
      description: 'HTML, CSS, and JavaScript project',
      icon: Globe
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      setLoading(true);
      
      // Mock project creation
      const newProject = {
        id: Date.now(),
        ...formData,
        owner: {
          id: user?.id,
          username: user?.username,
          name: user?.name,
          avatar: user?.avatar
        },
        stars: 0,
        forks: 0,
        views: 0,
        snippetsCount: 0,
        collaborators: 0,
        isPrivate: formData.isPrivate,
        allowCollaboration: formData.allowCollaboration,
        template: formData.template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      toast.success('Project created successfully!');
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      toast.error('Failed to create project');
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Project</h1>
          <p className="text-dark-300">Organize your code snippets into a collaborative project</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-6">Project Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field w-full"
                      placeholder="Enter project name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-200 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field w-full h-24 resize-none"
                      placeholder="Describe your project..."
                    />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-6">Choose Template</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => {
                    const Icon = template.icon;
                    return (
                      <label
                        key={template.id}
                        className={`cursor-pointer p-4 border-2 rounded-lg transition-colors ${
                          formData.template === template.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-600 hover:border-dark-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={formData.template === template.id}
                          onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                          className="sr-only"
                        />
                        <div className="flex items-start space-x-3">
                          <Icon className="h-6 w-6 text-primary-400 mt-1" />
                          <div>
                            <h3 className="font-medium text-white">{template.name}</h3>
                            <p className="text-sm text-dark-300 mt-1">{template.description}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="card">
                <h2 className="text-xl font-semibold text-white mb-6">Tags</h2>
                
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="input-field flex-1"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="btn-secondary"
                    >
                      <Tag className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="flex items-center space-x-1 bg-primary-600 text-white px-2 py-1 rounded-full text-xs"
                        >
                          <span>#{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Privacy Settings */}
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Privacy & Access</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-dark-200">Public Project</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!formData.isPrivate}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: !e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-dark-200">Allow Collaboration</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowCollaboration}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowCollaboration: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-dark-800 rounded-lg">
                  <p className="text-xs text-dark-400">
                    {formData.isPrivate 
                      ? "Only you and invited collaborators can see this project"
                      : "Anyone can view and fork this project"
                    }
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="card">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Creating...' : 'Create Project'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="w-full btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;