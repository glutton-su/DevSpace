import { useState } from 'react';
import { 
  Code2, 
  Users, 
  Share2, 
  Star, 
  GitFork, 
  Lock, 
  Globe, 
  Plus, 
  Settings, 
  Eye,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Lightbulb,
  Shield,
  Zap,
  Heart,
  Terminal,
  Palette,
  UserPlus
} from 'lucide-react';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedSections, setExpandedSections] = useState(['getting-started']);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Lightbulb,
      subsections: [
        { id: 'overview', title: 'What is DevSpace?' },
        { id: 'registration', title: 'Creating an Account' },
        { id: 'first-snippet', title: 'Your First Code Snippet' },
        { id: 'navigation', title: 'Navigating the Interface' }
      ]
    },
    {
      id: 'code-snippets',
      title: 'Code Snippets',
      icon: Code2,
      subsections: [
        { id: 'creating-snippets', title: 'Creating Snippets' },
        { id: 'editing-snippets', title: 'Editing Snippets' },
        { id: 'snippet-visibility', title: 'Public vs Private' },
        { id: 'tags-organization', title: 'Tags & Organization' },
        { id: 'syntax-highlighting', title: 'Language Support' }
      ]
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: BookOpen,
      subsections: [
        { id: 'project-management', title: 'Managing Projects' },
        { id: 'project-collaboration', title: 'Project Collaboration' },
        { id: 'project-settings', title: 'Project Settings' }
      ]
    },
    {
      id: 'collaboration',
      title: 'Collaboration',
      icon: Users,
      subsections: [
        { id: 'collaborative-snippets', title: 'Collaborative Snippets' },
        { id: 'adding-collaborators', title: 'Adding Collaborators' },
        { id: 'collaboration-permissions', title: 'Permissions & Roles' },
        { id: 'real-time-editing', title: 'Real-time Editing' }
      ]
    },
    {
      id: 'social-features',
      title: 'Social Features',
      icon: Heart,
      subsections: [
        { id: 'starring', title: 'Starring Snippets' },
        { id: 'forking', title: 'Forking Snippets' },
        { id: 'sharing', title: 'Sharing & Discovery' },
        { id: 'user-profiles', title: 'User Profiles' }
      ]
    },
    {
      id: 'account-settings',
      title: 'Account & Settings',
      icon: Settings,
      subsections: [
        { id: 'profile-settings', title: 'Profile Settings' },
        { id: 'security', title: 'Security & Privacy' },
        { id: 'notifications', title: 'Notifications' },
        { id: 'themes', title: 'Themes & Appearance' }
      ]
    },
    {
      id: 'tips-tricks',
      title: 'Tips & Tricks',
      icon: Zap,
      subsections: [
        { id: 'keyboard-shortcuts', title: 'Keyboard Shortcuts' },
        { id: 'best-practices', title: 'Best Practices' },
        { id: 'productivity-tips', title: 'Productivity Tips' }
      ]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What is DevSpace?</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                DevSpace is a collaborative platform for developers to create, share, and collaborate on code snippets. 
                Whether you're working on a solo project or collaborating with a team, DevSpace provides the tools you need 
                to organize and share your code effectively.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <Code2 className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Code Snippets</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Create and organize code snippets with syntax highlighting for 50+ programming languages.
                </p>
              </div>

              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Real-time Collaboration</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Work together on code snippets in real-time with your team members and contributors.
                </p>
              </div>

              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Project Management</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Organize your snippets into projects and manage access permissions for better organization.
                </p>
              </div>

              <div className="card p-6">
                <div className="flex items-center mb-4">
                  <Share2 className="h-6 w-6 text-primary-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Easy Sharing</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  Share your code snippets publicly or keep them private. Fork and star snippets from other developers.
                </p>
              </div>
            </div>
          </div>
        );

      case 'registration':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Creating an Account</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Getting started with DevSpace is quick and easy. Follow these steps to create your account and start coding.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Navigate to Registration</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Click the "Sign Up" button in the top navigation or go directly to the registration page.
                  </p>
                  <div className="card p-4 bg-gray-50 dark:bg-dark-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Tip:</strong> You can also access registration from any login page by clicking "Don't have an account? Sign up".
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fill in Your Details</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Provide the required information to create your account:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                    <li><strong>Username:</strong> Choose a unique username (3-50 characters, alphanumeric and underscores only)</li>
                    <li><strong>Email:</strong> A valid email address for account verification and notifications</li>
                    <li><strong>Full Name:</strong> Your display name (optional but recommended)</li>
                    <li><strong>Password:</strong> Must contain at least one uppercase letter, lowercase letter, and number</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Complete Registration</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    After submitting the form, you'll be automatically logged in and redirected to your dashboard where you can start creating code snippets right away.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'first-snippet':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your First Code Snippet</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Learn how to create your first code snippet and explore the various options available.
              </p>
            </div>

            <div className="space-y-8">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-primary-600" />
                  Creating a New Snippet
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                  <li>Navigate to your dashboard and click the "Create Snippet" button</li>
                  <li>Choose or create a project to organize your snippet</li>
                  <li>Add a descriptive title for your snippet</li>
                  <li>Select the programming language for proper syntax highlighting</li>
                  <li>Write or paste your code in the editor</li>
                  <li>Add tags to help with organization and discovery (optional)</li>
                  <li>Choose visibility settings (public or private)</li>
                  <li>Enable collaboration if you want others to contribute (optional)</li>
                  <li>Click "Create Snippet" to save</li>
                </ol>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-primary-600" />
                  Snippet Options
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-green-500" />
                      Public Snippets
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Visible to everyone, can be starred and forked by other users
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Lock className="h-4 w-4 mr-2 text-red-500" />
                      Private Snippets
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Only visible to you and project collaborators
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      Collaborative
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Others can join and edit the snippet in real-time
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Eye className="h-4 w-4 mr-2 text-purple-500" />
                      View-only
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Others can view but not edit the snippet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'collaborative-snippets':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Collaborative Snippets</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Work together on code in real-time with DevSpace's collaborative features.
              </p>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">How Collaboration Works</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  When you enable collaboration on a snippet, other users can join your project and edit the code together. 
                  All changes are synchronized in real-time, so everyone sees updates instantly.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Project-Level Collaboration</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Collaborators are added at the project level, giving them access to all collaborative snippets within that project.
                  </p>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Enabling Collaboration</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Create or edit a snippet</li>
                  <li>Make sure the snippet is set to "Public"</li>
                  <li>Toggle on "Allow Collaboration"</li>
                  <li>Save the snippet</li>
                  <li>Others can now join by clicking "Join Collaboration" on your snippet</li>
                </ol>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Managing Collaborators</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  As the project owner, you have full control over who can collaborate:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>View all current collaborators in the "Manage" section</li>
                  <li>Remove collaborators when needed</li>
                  <li>All collaborators get "Editor" permissions by default</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'starring':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Starring Snippets</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Star snippets you find useful to bookmark them for later reference.
              </p>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  How to Star Snippets
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Starring a snippet is simple - just click the star icon on any public snippet. You can find starred snippets in several places:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Your profile page under the "Starred" tab</li>
                  <li>The main dashboard in your personal collections</li>
                  <li>Use stars to bookmark useful code patterns, solutions, or inspiring examples</li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <GitFork className="h-5 w-5 mr-2 text-blue-500" />
                  Forking Snippets
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Forking creates your own copy of someone else's snippet that you can modify:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Click the fork icon on any public snippet</li>
                  <li>The snippet is copied to your "Forked Snippets" project</li>
                  <li>You can now edit and modify it as needed</li>
                  <li>Your fork maintains a reference to the original snippet</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'profile-settings':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Customize your profile and account settings to personalize your DevSpace experience.
              </p>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Update your basic profile information in the Settings page:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li><strong>Display Name:</strong> Your full name as it appears to other users</li>
                  <li><strong>Username:</strong> Your unique identifier (can be changed if not taken)</li>
                  <li><strong>Bio:</strong> A short description about yourself or your work</li>
                  <li><strong>Location:</strong> Where you're based (optional)</li>
                  <li><strong>Website:</strong> Link to your personal website or portfolio</li>
                  <li><strong>Social Links:</strong> Connect your GitHub, Twitter, and LinkedIn profiles</li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Security</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Email Settings</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Update your email address in the Account tab. This email is used for notifications and account recovery.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Password Security</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Change your password in the Security tab. Make sure to use a strong password with at least one uppercase letter, lowercase letter, and number.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-500" />
                  Appearance Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Toggle between light and dark themes using the theme switcher in the navigation bar. 
                  Your preference is saved and will persist across sessions.
                </p>
              </div>
            </div>
          </div>
        );

      case 'keyboard-shortcuts':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Speed up your workflow with these handy keyboard shortcuts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Terminal className="h-5 w-5 mr-2 text-green-500" />
                  Editor Shortcuts
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Save snippet</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + S</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Find in code</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + F</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Replace in code</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + H</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Format code</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + Shift + F</code>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Navigation Shortcuts</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">New snippet</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + N</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Go to dashboard</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + D</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Toggle theme</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + Shift + T</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Search snippets</span>
                    <code className="px-2 py-1 bg-gray-100 dark:bg-dark-800 rounded text-sm">Ctrl + K</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'best-practices':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Best Practices</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Follow these best practices to get the most out of DevSpace and create valuable content for the community.
              </p>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Writing Good Snippets</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li><strong>Use descriptive titles:</strong> Make it clear what your snippet does</li>
                  <li><strong>Add comments:</strong> Explain complex logic or provide context</li>
                  <li><strong>Include examples:</strong> Show how to use the code with sample input/output</li>
                  <li><strong>Keep it focused:</strong> Each snippet should solve one specific problem</li>
                  <li><strong>Use proper formatting:</strong> Indent consistently and follow language conventions</li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Organization Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li><strong>Use meaningful project names:</strong> Group related snippets logically</li>
                  <li><strong>Tag consistently:</strong> Use standard tags like "algorithm", "utility", "example"</li>
                  <li><strong>Regular cleanup:</strong> Remove or update outdated snippets</li>
                  <li><strong>Version control:</strong> Use the fork feature to save major changes</li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Collaboration Guidelines</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li><strong>Set clear expectations:</strong> Explain what kind of contributions you're looking for</li>
                  <li><strong>Be responsive:</strong> Review and respond to collaboration requests promptly</li>
                  <li><strong>Document changes:</strong> Use commit messages or comments to explain modifications</li>
                  <li><strong>Maintain quality:</strong> Review contributions before accepting them</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Select a topic from the sidebar
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Choose a section from the navigation to view detailed documentation.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            DevSpace Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about using DevSpace to create, share, and collaborate on code snippets.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documentation</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <div key={section.id}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
                      >
                        <div className="flex items-center">
                          <section.icon className="h-4 w-4 mr-3 text-primary-600" />
                          <span className="text-gray-700 dark:text-gray-300">{section.title}</span>
                        </div>
                        {expandedSections.includes(section.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedSections.includes(section.id) && (
                        <div className="ml-7 mt-2 space-y-1">
                          {section.subsections.map((subsection) => (
                            <button
                              key={subsection.id}
                              onClick={() => setActiveSection(subsection.id)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                activeSection === subsection.id
                                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-800'
                              }`}
                            >
                              {subsection.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
