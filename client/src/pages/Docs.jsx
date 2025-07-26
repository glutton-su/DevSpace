import React, { useState } from 'react';
import { Book, Code, Users, Settings, ChevronRight } from 'lucide-react';

const Docs = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sidebarItems = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'project-code-snippets', label: 'Project Code Snippets', icon: Code },
    { id: 'snippet-collaboration', label: 'Snippet Collaboration', icon: Users },
    { id: 'account-settings', label: 'Account Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Getting Started</h1>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Welcome to DevSpace</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                DevSpace is a collaborative platform designed for developers to share, manage, and collaborate on code snippets and projects. 
                Whether you're working solo or with a team, DevSpace provides the tools you need to organize your code efficiently.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Quick Start Guide</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Create an Account:</strong> Sign up with your email and create a secure password.</li>
                <li><strong className="text-gray-900 dark:text-white">Set Up Your Profile:</strong> Add your name and customize your profile information.</li>
                <li><strong className="text-gray-900 dark:text-white">Create Your First Project:</strong> Start by creating a project to organize your code snippets.</li>
                <li><strong className="text-gray-900 dark:text-white">Add Code Snippets:</strong> Upload or create code snippets within your projects.</li>
                <li><strong className="text-gray-900 dark:text-white">Invite Collaborators:</strong> Share your projects with team members for collaborative development.</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Key Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Project Organization:</strong> Group related code snippets into projects for better organization.</li>
                <li><strong className="text-gray-900 dark:text-white">Real-time Collaboration:</strong> Work together with team members on shared projects.</li>
                <li><strong className="text-gray-900 dark:text-white">Syntax Highlighting:</strong> Support for multiple programming languages with beautiful syntax highlighting.</li>
                <li><strong className="text-gray-900 dark:text-white">Version Control:</strong> Keep track of changes and updates to your code snippets.</li>
                <li><strong className="text-gray-900 dark:text-white">Secure Sharing:</strong> Control who can view and edit your projects and snippets.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Navigation</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The main navigation includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Dashboard:</strong> Overview of your recent activity and projects.</li>
                <li><strong className="text-gray-900 dark:text-white">Projects:</strong> Manage all your projects and their associated code snippets.</li>
                <li><strong className="text-gray-900 dark:text-white">Collaborate:</strong> View and manage collaborative projects you're part of.</li>
                <li><strong className="text-gray-900 dark:text-white">Public Snippets:</strong> Browse publicly shared code snippets from the community.</li>
                <li><strong className="text-gray-900 dark:text-white">Profile:</strong> Manage your account settings and profile information.</li>
              </ul>
            </div>
          </div>
        );

      case 'project-code-snippets':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Code Snippets</h1>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Managing Your Code</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Code snippets are organized within projects, making it easy to group related code together. 
                Each project can contain multiple snippets with different programming languages and purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Creating Projects</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li>Navigate to the <strong className="text-gray-900 dark:text-white">Projects</strong> page from the main navigation.</li>
                <li>Click the <strong className="text-gray-900 dark:text-white">"Create New Project"</strong> button.</li>
                <li>Enter a descriptive project name and optional description.</li>
                <li>Choose the project's visibility (Private or Public).</li>
                <li>Click <strong className="text-gray-900 dark:text-white">"Create Project"</strong> to save.</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Adding Code Snippets</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Within each project, you can add multiple code snippets:</p>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li>Open your project from the Projects page.</li>
                <li>Click <strong className="text-gray-900 dark:text-white">"Add Snippet"</strong> or the <strong className="text-gray-900 dark:text-white">"+"</strong> button.</li>
                <li>Enter a title and description for your snippet.</li>
                <li>Select the programming language for proper syntax highlighting.</li>
                <li>Paste or type your code in the editor.</li>
                <li>Choose visibility settings (inherit from project or override).</li>
                <li>Save your snippet.</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Snippet Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Syntax Highlighting:</strong> Automatic highlighting for popular programming languages.</li>
                <li><strong className="text-gray-900 dark:text-white">Code Formatting:</strong> Maintain clean, readable code with automatic formatting.</li>
                <li><strong className="text-gray-900 dark:text-white">Copy to Clipboard:</strong> Easily copy snippets for use in your development environment.</li>
                <li><strong className="text-gray-900 dark:text-white">Download:</strong> Export snippets as files for local development.</li>
                <li><strong className="text-gray-900 dark:text-white">Search:</strong> Find specific snippets quickly using the search functionality.</li>
                <li><strong className="text-gray-900 dark:text-white">Tags:</strong> Organize snippets with custom tags for better categorization.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Supported Languages</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">DevSpace supports syntax highlighting for many popular programming languages:</p>
              <div className="grid grid-cols-3 gap-4 text-gray-600 dark:text-gray-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>JavaScript</li>
                  <li>Python</li>
                  <li>Java</li>
                  <li>C++</li>
                  <li>C#</li>
                </ul>
                <ul className="list-disc list-inside space-y-1">
                  <li>TypeScript</li>
                  <li>React JSX</li>
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>PHP</li>
                </ul>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ruby</li>
                  <li>Go</li>
                  <li>Rust</li>
                  <li>SQL</li>
                  <li>And many more...</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'snippet-collaboration':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Snippet Collaboration</h1>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Working Together</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                DevSpace enables seamless collaboration on code snippets and projects. 
                Team members can contribute, review, and manage shared code repositories together.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Adding Collaborators</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li>Open the project you want to share.</li>
                <li>Click the <strong className="text-gray-900 dark:text-white">"Collaborate"</strong> button or manage collaborators option.</li>
                <li>Enter the email address or username of the person you want to invite.</li>
                <li>Select their permission level (Viewer, Contributor, or Admin).</li>
                <li>Send the invitation - they'll receive a notification to join.</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Permission Levels</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Viewer</h4>
                  <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-1">
                    <li>Can view all project content</li>
                    <li>Can copy and download snippets</li>
                    <li>Cannot edit or modify anything</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Contributor</h4>
                  <ul className="list-disc list-inside text-green-800 dark:text-green-200 space-y-1">
                    <li>All Viewer permissions</li>
                    <li>Can create and edit snippets</li>
                    <li>Can comment on snippets</li>
                    <li>Cannot delete project or manage collaborators</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Owner</h4>
                  <ul className="list-disc list-inside text-purple-800 dark:text-purple-200 space-y-1">
                    <li>All Contributor permissions</li>
                    <li>Can manage collaborators</li>
                    <li>Can modify project settings</li>
                    <li>Can delete the project</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Collaboration Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Real-time Updates:</strong> See changes as team members make them.</li>
                <li><strong className="text-gray-900 dark:text-white">Activity Feed:</strong> Track all project activity and changes.</li>
                <li><strong className="text-gray-900 dark:text-white">Comments:</strong> Discuss specific snippets with your team.</li>
                <li><strong className="text-gray-900 dark:text-white">Version History:</strong> View and revert to previous versions of snippets.</li>
                <li><strong className="text-gray-900 dark:text-white">Notifications:</strong> Get notified when collaborators make changes.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Managing Collaborators</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Project owners and admins can manage team members:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">View Team:</strong> See all current collaborators and their roles.</li>
                <li><strong className="text-gray-900 dark:text-white">Change Permissions:</strong> Modify a collaborator's access level.</li>
                <li><strong className="text-gray-900 dark:text-white">Remove Members:</strong> Remove collaborators who no longer need access.</li>
                <li><strong className="text-gray-900 dark:text-white">Transfer Ownership:</strong> Transfer project ownership to another team member.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Best Practices</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Use descriptive commit messages when updating snippets.</li>
                <li>Regularly communicate with your team about changes.</li>
                <li>Review code before making significant modifications.</li>
                <li>Use comments to explain complex code sections.</li>
                <li>Keep project documentation up to date.</li>
              </ul>
            </div>
          </div>
        );

      case 'account-settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Managing Your Account</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Keep your account secure and up-to-date with the latest information. 
                DevSpace provides comprehensive tools to manage your profile, security, and preferences.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Profile Information</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Update your basic profile information:</p>
              <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                <li>Navigate to your <strong className="text-gray-900 dark:text-white">Profile</strong> page from the user menu.</li>
                <li>Click <strong className="text-gray-900 dark:text-white">"Edit Profile"</strong> to modify your information.</li>
                <li>Update your display name, bio, or other personal information.</li>
                <li>Save your changes to update your profile.</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Email Settings</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Manage your email address and notification preferences:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Change Email:</strong> Update your primary email address for account communications.</li>
                <li><strong className="text-gray-900 dark:text-white">Email Verification:</strong> Verify new email addresses for security.</li>
                <li><strong className="text-gray-900 dark:text-white">Notification Settings:</strong> Choose which events trigger email notifications.</li>
                <li><strong className="text-gray-900 dark:text-white">Unsubscribe Options:</strong> Manage your email subscription preferences.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Password Security</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Keep your account secure with strong password management:</p>
              
              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Changing Your Password</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li>Go to Account Settings → Security</li>
                <li>Click <strong className="text-gray-900 dark:text-white">"Change Password"</strong></li>
                <li>Enter your current password for verification</li>
                <li>Enter your new password (must meet security requirements)</li>
                <li>Confirm your new password</li>
                <li>Save changes to update your password</li>
              </ol>

              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Password Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 mb-4">
                <li>Minimum 8 characters in length</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character</li>
              </ul>

              <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Forgot Password</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you forget your password, use the "Forgot Password" link on the login page to receive 
                a password reset email with instructions to create a new password.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Privacy Settings</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Profile Visibility:</strong> Control who can see your profile information.</li>
                <li><strong className="text-gray-900 dark:text-white">Project Privacy:</strong> Set default privacy levels for new projects.</li>
                <li><strong className="text-gray-900 dark:text-white">Activity Visibility:</strong> Choose what activity information is shared.</li>
                <li><strong className="text-gray-900 dark:text-white">Search Privacy:</strong> Control whether others can find you in search results.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Account Preferences</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li><strong className="text-gray-900 dark:text-white">Theme Settings:</strong> Choose between light and dark mode themes.</li>
                <li><strong className="text-gray-900 dark:text-white">Language Preferences:</strong> Set your preferred language for the interface.</li>
                <li><strong className="text-gray-900 dark:text-white">Notification Frequency:</strong> Control how often you receive notifications.</li>
                <li><strong className="text-gray-900 dark:text-white">Default Editor Settings:</strong> Set preferences for the code editor.</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 mt-6">Account Deletion</h3>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Permanent Account Deletion</h4>
                <p className="text-red-800 dark:text-red-200 mb-2">
                  If you need to delete your account, this action is permanent and cannot be undone.
                </p>
                <ul className="list-disc list-inside text-red-800 dark:text-red-200 space-y-1">
                  <li>All your projects and snippets will be permanently deleted</li>
                  <li>You will be removed from all collaborative projects</li>
                  <li>Your profile and activity history will be erased</li>
                  <li>This action cannot be reversed</li>
                </ul>
                <p className="text-red-800 dark:text-red-200 mt-2">
                  Contact support if you need assistance with account deletion.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-dark-800 shadow-lg min-h-screen border-r border-gray-200 dark:border-dark-700">
          <div className="p-6 border-b border-gray-200 dark:border-dark-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documentation</h2>
          </div>
          <nav className="p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 bg-gray-50 dark:bg-dark-900">
          <div className="max-w-4xl mx-auto bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-700 p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
