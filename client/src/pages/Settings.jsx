import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Trash2,
  Save,
  Eye,
  EyeOff,
  Github,
  Twitter,
  Linkedin,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Mail },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-dark-300">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white'
                          : 'text-dark-300 hover:text-white hover:bg-dark-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileSettings user={user} updateUser={updateUser} />}
            {activeTab === 'account' && <AccountSettings user={user} updateUser={updateUser} />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'danger' && <DangerZone />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings = ({ user, updateUser }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    github: user?.github || '',
    twitter: user?.twitter || '',
    linkedin: user?.linkedin || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      updateUser(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-field w-full"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="input-field w-full"
              placeholder="Enter your username"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="input-field w-full h-24 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Location & Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="input-field w-full pl-10"
                placeholder="City, Country"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="input-field w-full pl-10"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                GitHub
              </label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                  className="input-field w-full pl-10"
                  placeholder="github-username"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                Twitter
              </label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                  className="input-field w-full pl-10"
                  placeholder="twitter-handle"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-200 mb-2">
                LinkedIn
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="input-field w-full pl-10"
                  placeholder="linkedin-profile"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Account Settings Component
const AccountSettings = ({ user, updateUser }) => {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentEmail: user?.email || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      updateUser({ email: formData.email });
      toast.success('Email updated successfully!');
    } catch (error) {
      toast.error('Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Current Email
            </label>
            <input
              type="email"
              value={formData.currentEmail}
              disabled
              className="input-field w-full opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              New Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input-field w-full"
              placeholder="Enter new email address"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field w-full pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="input-field w-full pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-field w-full pr-10"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    snippetLikes: true,
    snippetComments: true,
    newFollowers: true,
    collaborationInvites: true,
    weeklyDigest: false,
    securityAlerts: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification preferences updated');
  };

  const NotificationToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-dark-200 font-medium">{label}</p>
        <p className="text-sm text-dark-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
        
        <div className="space-y-1 divide-y divide-dark-700">
          <NotificationToggle
            label="Email Notifications"
            description="Receive notifications via email"
            value={settings.emailNotifications}
            onChange={() => handleToggle('emailNotifications')}
          />
          
          <NotificationToggle
            label="Push Notifications"
            description="Receive push notifications in your browser"
            value={settings.pushNotifications}
            onChange={() => handleToggle('pushNotifications')}
          />
          
          <NotificationToggle
            label="Snippet Likes"
            description="When someone likes your snippets"
            value={settings.snippetLikes}
            onChange={() => handleToggle('snippetLikes')}
          />
          
          <NotificationToggle
            label="Snippet Comments"
            description="When someone comments on your snippets"
            value={settings.snippetComments}
            onChange={() => handleToggle('snippetComments')}
          />
          
          <NotificationToggle
            label="New Followers"
            description="When someone follows you"
            value={settings.newFollowers}
            onChange={() => handleToggle('newFollowers')}
          />
          
          <NotificationToggle
            label="Collaboration Invites"
            description="When someone invites you to collaborate"
            value={settings.collaborationInvites}
            onChange={() => handleToggle('collaborationInvites')}
          />
          
          <NotificationToggle
            label="Weekly Digest"
            description="Weekly summary of platform activity"
            value={settings.weeklyDigest}
            onChange={() => handleToggle('weeklyDigest')}
          />
          
          <NotificationToggle
            label="Security Alerts"
            description="Important security notifications"
            value={settings.securityAlerts}
            onChange={() => handleToggle('securityAlerts')}
          />
        </div>
      </div>
    </div>
  );
};

// Privacy Settings Component
const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    showOnlineStatus: false,
    indexBySearchEngines: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Privacy settings updated');
  };

  const PrivacyToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-dark-200 font-medium">{label}</p>
        <p className="text-sm text-dark-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Privacy Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
              className="input-field w-full"
            >
              <option value="public">Public - Anyone can view your profile</option>
              <option value="registered">Registered Users - Only logged-in users</option>
              <option value="private">Private - Only you can view your profile</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-1 divide-y divide-dark-700">
          <PrivacyToggle
            label="Show Email Address"
            description="Display your email on your public profile"
            value={settings.showEmail}
            onChange={() => handleToggle('showEmail')}
          />
          
          <PrivacyToggle
            label="Show Location"
            description="Display your location on your profile"
            value={settings.showLocation}
            onChange={() => handleToggle('showLocation')}
          />
          
          <PrivacyToggle
            label="Allow Direct Messages"
            description="Let other users send you direct messages"
            value={settings.allowDirectMessages}
            onChange={() => handleToggle('allowDirectMessages')}
          />
          
          <PrivacyToggle
            label="Show Online Status"
            description="Show when you're online to other users"
            value={settings.showOnlineStatus}
            onChange={() => handleToggle('showOnlineStatus')}
          />
          
          <PrivacyToggle
            label="Search Engine Indexing"
            description="Allow search engines to index your profile"
            value={settings.indexBySearchEngines}
            onChange={() => handleToggle('indexBySearchEngines')}
          />
        </div>
      </div>
    </div>
  );
};

// Danger Zone Component
const DangerZone = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setDeleting(true);
      await userAPI.deleteUser();
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to delete account';
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card border-red-500/20">
        <h2 className="text-xl font-bold text-red-400 mb-6">Danger Zone</h2>
        
        <div className="space-y-4">
          
          {/* Delete Account */}
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h3>
            <p className="text-dark-300 mb-4">
              Once you delete your account, there is no going back. This will permanently delete your account, all your snippets, projects, and remove all your data from our servers.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full border-red-500/20">
            <h2 className="text-xl font-bold text-red-400 mb-4">Delete Account</h2>
            <p className="text-dark-300 mb-4">
              Are you absolutely sure? This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <p className="text-dark-300 mb-6">
              Type <span className="font-mono bg-dark-800 px-2 py-1 rounded text-red-400">DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="input-field w-full mb-6"
              disabled={deleting}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmText('');
                }}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;