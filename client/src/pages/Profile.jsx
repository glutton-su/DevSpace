import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetAPI, userAPI } from '../services/api';
import SnippetCard from '../components/features/SnippetCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin,
  Mail,
  Edit,
  Star,
  Code,
  Users,
  Eye,
  GitFork,
  Settings,
  Award,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('snippets');
  const [isFollowing, setIsFollowing] = useState(false);
  const [languageStats, setLanguageStats] = useState([]);
  const [snippetStats, setSnippetStats] = useState({ snippetCount: 0, forkedCount: 0, totalSnippets: 0 });
  const [tabCounts, setTabCounts] = useState({ snippets: 0, forked: 0 });

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    fetchUserData();
  }, [username]);

  useEffect(() => {
    fetchLanguageStats();
  }, [username, currentUser?.username]);

  useEffect(() => {
    fetchUserSnippets();
  }, [username, activeTab]);

  const fetchUserData = async () => {
    try {
      if (isOwnProfile) {
        // For own profile, get the current user data which should include stats
        const profileResponse = await userAPI.getUserProfile(currentUser?.username);
        setUser({
          ...currentUser,
          ...profileResponse.user,
          stats: profileResponse.stats
        });
      } else {
        // For other users, fetch their profile
        const profileResponse = await userAPI.getUserProfile(username);
        setUser({
          ...profileResponse.user,
          stats: profileResponse.stats
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user profile');
      // Fallback to current user data for own profile
      if (isOwnProfile) {
        setUser(currentUser);
      }
    }
  };

  const fetchUserSnippets = async () => {
    try {
      setLoading(true);
      let response;
      
      if (activeTab === 'snippets') {
        if (isOwnProfile) {
          // Get user's own snippets (including private ones)
          response = await snippetAPI.getUserOwnedSnippets();
        } else {
          // Get public snippets for other users
          response = await snippetAPI.getUserPublicSnippets(username);
        }
      } else if (activeTab === 'forked') {
        if (isOwnProfile) {
          // Get user's forked snippets
          response = await snippetAPI.getUserForkedSnippets();
        } else {
          // For other users, we might not want to show forked snippets
          // or we could create a separate endpoint for public forked snippets
          response = { snippets: [], total: 0 };
        }
      } else {
        return;
      }
      
      setSnippets((response.snippets || response.data || []).map(snippet => ({
        ...snippet,
        tags: snippet.tags ? snippet.tags.map(tag => tag.name || tag) : []
      })));
      
      // Update tab counts based on the response
      if (response.total !== undefined) {
        setTabCounts(prev => ({
          ...prev,
          [activeTab]: response.total
        }));
      }
    } catch (error) {
      console.error('Error fetching user snippets:', error);
      toast.error('Failed to load snippets');
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async (snippetId) => {
    try {
      const response = await snippetAPI.toggleStar(snippetId);
      setSnippets(prev => prev.map(snippet => 
        snippet.id === snippetId 
          ? { 
              ...snippet, 
              starCount: response.starCount !== undefined ? response.starCount : (snippet.starCount || 0) + (snippet.isStarred ? -1 : 1), 
              isStarred: response.isStarred !== undefined ? response.isStarred : !snippet.isStarred 
            }
          : snippet
      ));
      const isStarred = response.isStarred !== undefined ? response.isStarred : !snippets.find(s => s.id === snippetId)?.isStarred;
      toast.success(isStarred ? 'Snippet starred!' : 'Snippet unstarred!');
    } catch (error) {
      console.error('Error starring snippet:', error);
      toast.error('Failed to star snippet');
    }
  };

  const handleFork = async (snippetId) => {
    try {
      await snippetAPI.forkSnippet(snippetId);
      toast.success('Snippet forked successfully!');
      // Refresh user stats after forking
      fetchUserData();
    } catch (error) {
      console.error('Error forking snippet:', error);
      toast.error('Failed to fork snippet');
    }
  };

  const fetchLanguageStats = async () => {
    try {
      const targetUsername = username || currentUser?.username;
      if (!targetUsername) return;
      
      const response = await userAPI.getUserSnippetStats(targetUsername);
      setLanguageStats(response.languageStats || []);
      setSnippetStats({
        snippetCount: response.snippetCount || 0,
        forkedCount: response.forkedCount || 0,
        totalSnippets: response.totalSnippets || 0
      });
      
      // Update snippets tab count
      setTabCounts(prev => ({
        ...prev,
        snippets: response.snippetCount || 0,
        forked: response.forkedCount || 0
      }));
    } catch (error) {
      console.error('Error fetching language stats:', error);
      // Fallback to empty array instead of mock data
      setLanguageStats([]);
      setSnippetStats({ snippetCount: 0, forkedCount: 0, totalSnippets: 0 });
      setTabCounts(prev => ({ ...prev, snippets: 0, forked: 0 }));
    }
  };

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
    } catch (error) {
      setIsFollowing(isFollowing);
      toast.error('Failed to update follow status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const tabs = isOwnProfile 
    ? [
        { id: 'snippets', label: 'Snippets', count: tabCounts.snippets || snippetStats.snippetCount },
        { id: 'forked', label: 'Forked', count: tabCounts.forked }
      ]
    : [
        { id: 'snippets', label: 'Public Snippets', count: tabCounts.snippets || snippetStats.snippetCount }
      ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center border-4 border-primary-600">
                <User className="h-16 w-16 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h1>
                  <p className="text-gray-600 dark:text-dark-300 text-lg">@{user.username}</p>
                </div>
                
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Link
                      to="/settings"
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`btn-primary flex items-center space-x-2 ${
                          isFollowing ? 'bg-gray-600 dark:bg-dark-700 hover:bg-gray-700 dark:hover:bg-dark-600' : ''
                        }`}
                      >
                        <Users className="h-4 w-4" />
                        <span>{isFollowing ? 'Following' : 'Follow'}</span>
                      </button>
                      <button className="btn-secondary">
                        <Mail className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">{user.bio}</p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{user.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${user.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-primary-500" />
                    <span className="text-gray-700 dark:text-gray-300">Snippets</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{snippetStats.snippetCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitFork className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Forked</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{snippetStats.forkedCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitFork className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Forks</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{user?.stats?.totalForksReceived || 0}</span>
                </div>
              </div>
            </div>

            {/* Top Languages */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Languages</h3>
              <div className="space-y-3">
                {languageStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{stat.language}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{stat.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${stat.percentage}%`,
                          backgroundColor: stat.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="card mb-8">
              <div className="flex space-x-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {(activeTab === 'snippets' || activeTab === 'forked') && (
                <div>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" text="Loading snippets..." />
                    </div>
                  ) : snippets.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {snippets.map((snippet) => (
                        <SnippetCard
                          key={snippet.id}
                          snippet={snippet}
                          onStar={handleStar}
                          onFork={handleFork}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Code className="h-16 w-16 text-gray-400 dark:text-dark-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {activeTab === 'snippets' ? 'No snippets yet' : 'No forked content'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {activeTab === 'snippets' 
                          ? (isOwnProfile 
                              ? "You haven't created any snippets yet. Start sharing your code!"
                              : "This user hasn't shared any snippets yet."
                            )
                          : (isOwnProfile 
                              ? "You haven't forked anything yet."
                              : "This user hasn't forked anything yet."
                            )
                        }
                      </p>
                      {isOwnProfile && activeTab === 'snippets' && (
                        <Link to="/create" className="btn-primary">
                          Create Your First Snippet
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;