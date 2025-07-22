import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { snippetAPI } from '../services/api';
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
  Heart,
  GitFork,
  Settings,
  TrendingUp,
  Award
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

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    fetchUserData();
    fetchUserSnippets();
    fetchLanguageStats();
  }, [username]);

  const fetchUserData = async () => {
    try {
      if (isOwnProfile) {
        setUser(currentUser);
      } else {
        // Mock user data for demo
        const mockUser = {
          id: 2,
          username: username,
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
          bio: 'Full-stack developer passionate about React, Node.js, and machine learning. Love building scalable applications and sharing knowledge with the community.',
          location: 'San Francisco, CA',
          website: 'https://janesmith.dev',
          github: 'janesmith',
          twitter: 'jane_codes',
          linkedin: 'jane-smith-dev',
          joinDate: '2023-06-15',
          snippetsCount: 18,
          collaborationsCount: 8,
          followersCount: 245,
          followingCount: 89,
          starsReceived: 156,
          totalViews: 2840,
          contributionsCount: 42
        };
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user profile');
    }
  };

  const fetchUserSnippets = async () => {
    try {
      setLoading(true);
      const response = await snippetAPI.getSnippets();
      // Filter snippets by user (mock filtering)
      const userSnippets = response.data.filter(snippet => 
        isOwnProfile ? snippet.author.id === currentUser?.id : snippet.author.username === username
      );
      setSnippets(userSnippets);
    } catch (error) {
      console.error('Error fetching user snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguageStats = async () => {
    // Mock language statistics
    const mockStats = [
      { language: 'JavaScript', count: 12, percentage: 35, color: '#f7df1e' },
      { language: 'Python', count: 8, percentage: 25, color: '#3776ab' },
      { language: 'TypeScript', count: 6, percentage: 18, color: '#3178c6' },
      { language: 'CSS', count: 4, percentage: 12, color: '#1572b6' },
      { language: 'HTML', count: 3, percentage: 10, color: '#e34f26' }
    ];
    setLanguageStats(mockStats);
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

  const tabs = [
    { id: 'snippets', label: 'Snippets', count: user?.snippetsCount || 0 },
    { id: 'starred', label: 'Starred', count: user?.starsReceived || 0 },
    { id: 'activity', label: 'Activity', count: user?.contributionsCount || 0 }
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
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary-600"
              />
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
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.joinDate)}</span>
                </div>
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
                  <span className="font-semibold text-gray-900 dark:text-white">{user.snippetsCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-700 dark:text-gray-300">Stars</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.starsReceived}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitFork className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Forks</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">12</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-secondary-500" />
                    <span className="text-gray-700 dark:text-gray-300">Followers</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.followersCount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-300">Views</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{user.totalViews}</span>
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

            {/* Achievements */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">First Snippet</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Created your first code snippet</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Rising Star</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Received 100+ stars</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Team Player</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Collaborated on 5+ snippets</p>
                  </div>
                </div>
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
              {activeTab === 'snippets' && (
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
                          onLike={() => snippetAPI.toggleLike(snippet.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Code className="h-16 w-16 text-gray-400 dark:text-dark-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No snippets yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {isOwnProfile 
                          ? "You haven't created any snippets yet. Start sharing your code!"
                          : "This user hasn't shared any snippets yet."
                        }
                      </p>
                      {isOwnProfile && (
                        <Link to="/create" className="btn-primary">
                          Create Your First Snippet
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Other tabs placeholder */}
              {activeTab !== 'snippets' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-dark-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {activeTab === 'starred' && <Star className="h-8 w-8 text-gray-400 dark:text-dark-400" />}
                    {activeTab === 'activity' && <TrendingUp className="h-8 w-8 text-gray-400 dark:text-dark-400" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {activeTab === 'starred' && 'No starred content'}
                    {activeTab === 'activity' && 'No recent activity'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isOwnProfile 
                      ? `You haven't ${activeTab === 'starred' ? 'starred anything' : 'been active'} yet.`
                      : `This user hasn't ${activeTab === 'starred' ? 'starred anything' : 'been active'} yet.`
                    }
                  </p>
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