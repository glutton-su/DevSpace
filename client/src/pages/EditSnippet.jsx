import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ArrowLeft, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { snippetAPI } from '../services/api';

const EditSnippet = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [snippet, setSnippet] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    language: '',
    tags: [],
    allowCollaboration: false,
    isPublic: false
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css', 
    'sql', 'shell', 'json', 'xml', 'yaml', 'markdown'
  ];

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const response = await snippetAPI.getSnippet(id);
      const snippetData = response.codeSnippet || response.snippet || response.data || response;
      
      // Check if user has edit access (owner or project collaborator with editor/admin role)
      const isOwner = snippetData.project && snippetData.project.userId === user?.id;
      const isCollaborator = snippetData.isCollaborator && (snippetData.collaboratorRole === 'editor' || snippetData.collaboratorRole === 'admin');
      
      if (!isOwner && !isCollaborator) {
        toast.error('You do not have permission to edit this snippet');
        navigate('/dashboard');
        return;
      }
      
      setSnippet(snippetData);
      setFormData({
        title: snippetData.title || '',
        description: snippetData.description || '',
        content: snippetData.content || snippetData.code || '',
        language: snippetData.language || '',
        tags: snippetData.tags ? snippetData.tags.map(tag => tag.name || tag) : [],
        allowCollaboration: snippetData.allowCollaboration || false,
        isPublic: snippetData.isPublic || false
      });
    } catch (error) {
      console.error('Error fetching snippet:', error);
      toast.error('Failed to load snippet');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        language: formData.language,
        tags: formData.tags,
        allowCollaboration: formData.allowCollaboration,
        isPublic: formData.isPublic
      };

      await snippetAPI.updateSnippet(id, updateData);
      toast.success('Snippet updated successfully!');
      navigate(`/snippet/${id}`);
    } catch (error) {
      console.error('Error updating snippet:', error);
      toast.error('Failed to update snippet');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading snippet..." />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Snippet not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The snippet you're trying to edit doesn't exist.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/snippet/${id}`)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Snippet</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Snippet
            </h1>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
              Snippet Details
            </h2>
            
            <div className="space-y-8">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter snippet title"
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter snippet description"
                  rows={4}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select a language</option>
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tags
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyPress={handleTagInputKeyPress}
                    onBlur={addTag}
                    placeholder="Type a tag and press Enter"
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Code Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Paste your code here..."
                  rows={25}
                  className="w-full px-4 py-3 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  required
                />
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowCollaboration"
                    name="allowCollaboration"
                    checked={formData.allowCollaboration}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="allowCollaboration" className="ml-3 block text-base text-gray-700 dark:text-gray-300">
                    Allow collaboration (others can request to edit)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-3 block text-base text-gray-700 dark:text-gray-300">
                    Make public (visible to everyone)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-6">
            <button
              type="button"
              onClick={() => navigate(`/snippet/${id}`)}
              className="px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-base font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSnippet;
