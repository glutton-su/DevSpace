import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetAPI, projectAPI } from '../services/api';
import CodeEditor from '../components/common/CodeEditor';
import { Upload, Code, Save, Eye, Globe, Lock, Tag, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Create = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('write'); // 'write' or 'upload'
  const [redirectTo, setRedirectTo] = useState('profile'); // 'profile' or 'dashboard'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: [],
    isPublic: true,
    allowFork: true,
    allowCollaboration: false
  });
  const [tagInput, setTagInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const languages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php',
    'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'scss',
    'sql', 'json', 'yaml', 'markdown', 'bash', 'powershell'
  ];

  const handleCodeChange = (newCode, newLanguage) => {
    setFormData(prev => ({
      ...prev,
      code: newCode,
      language: newLanguage || prev.language
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error('File size must be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const extension = file.name.split('.').pop().toLowerCase();
      
      // Auto-detect language from file extension
      const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'sql': 'sql',
        'json': 'json',
        'yml': 'yaml',
        'yaml': 'yaml',
        'md': 'markdown',
        'sh': 'bash'
      };

      const detectedLanguage = languageMap[extension] || 'javascript';
      
      setFormData(prev => ({
        ...prev,
        code: content,
        language: detectedLanguage,
        title: prev.title || file.name.replace(/\.[^/.]+$/, "")
      }));
      
      setUploadedFile(file);
      toast.success('File uploaded successfully!');
    };

    reader.readAsText(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.code.trim()) {
      toast.error('Code content is required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare snippet data - remove projectId requirement for now
      const snippetData = {
        title: formData.title,
        content: formData.code,
        language: formData.language,
        tags: formData.tags,
        filePath: uploadedFile ? uploadedFile.name : null,
        isPublic: formData.isPublic,
        allowCollaboration: formData.allowCollaboration,
        allowFork: formData.allowFork
      };
      
      console.log('Creating snippet with data:', snippetData);
      
      const result = await snippetAPI.createSnippet(snippetData);
      const snippet = result.data || result;
      toast.success('Code snippet created successfully!');
      
      // Redirect based on user preference
      if (redirectTo === 'profile') {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create snippet';
      toast.error(errorMessage);
      console.error('Error creating snippet:', error);
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Snippet</h1>
          <p className="text-gray-600 dark:text-gray-300">Share your code with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mode Selection */}
              <div className="card">
                <div className="flex items-center space-x-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Input Method</h3>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setMode('write')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      mode === 'write' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    <span>Write Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      mode === 'upload' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-200 dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-dark-700'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload File</span>
                  </button>
                </div>
              </div>

              {/* File Upload */}
              {mode === 'upload' && (
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Code File</h3>
                  <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 dark:text-dark-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Drag and drop your code file here, or click to browse
                    </p>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.html,.css,.scss,.sql,.json,.yml,.yaml,.md,.sh"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn-primary cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Supported formats: JS, TS, Python, Java, C++, and more (Max 1MB)
                    </p>
                    {uploadedFile && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-dark-800 rounded-lg">
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          ✓ {uploadedFile.name} uploaded successfully
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Code Editor */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Code</h3>
                  <div className="flex items-center space-x-2">
                    
                  </div>
                </div>
                <CodeEditor
                  code={formData.code}
                  language={formData.language}
                  onChange={handleCodeChange}
                  className="border border-gray-300 dark:border-dark-700 rounded-lg overflow-hidden"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Snippet Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field w-full"
                      placeholder="Enter snippet title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field w-full h-24 resize-none"
                      placeholder="Describe what your code does..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="input-field w-full"
                    >
                      {languages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
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

              {/* Privacy & Permissions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy & Permissions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-200">Public</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Code className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-200">Allow Forking</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowFork}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowFork: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-200">Allow Collaboration</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowCollaboration}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          setFormData(prev => ({ 
                            ...prev, 
                            allowCollaboration: newValue,
                            // Auto-enable public when collaboration is enabled
                            isPublic: newValue ? true : prev.isPublic
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 dark:bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Collaboration Note */}
                  {formData.allowCollaboration && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <Users className="inline h-4 w-4 mr-1" />
                        Collaborative snippets are automatically made public so others can discover and contribute to them.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Redirect Preference */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">After Creation</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="redirect"
                      value="profile"
                      checked={redirectTo === 'profile'}
                      onChange={(e) => setRedirectTo(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">Go to my profile</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="redirect"
                      value="dashboard"
                      checked={redirectTo === 'dashboard'}
                      onChange={(e) => setRedirectTo(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">Go to dashboard</span>
                  </label>
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
                    <span>{loading ? 'Creating...' : 'Create Snippet'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
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

export default Create;