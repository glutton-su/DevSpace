import { useState, useEffect } from 'react';
import { 
  Shield, 
  Flag, 
  User, 
  MessageCircle, 
  Code, 
  Eye, 
  EyeOff,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ModerationPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  // Check if user has moderation permissions
  const isModerator = user?.role === 'moderator' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isModerator) {
      fetchModerationData();
    }
  }, [isModerator]);

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      // Mock moderation data
      const mockReports = [
        {
          id: 1,
          type: 'snippet',
          targetId: 123,
          targetTitle: 'Malicious JavaScript Code',
          reason: 'spam',
          description: 'This snippet contains malicious code that could harm users',
          reporter: {
            id: 2,
            username: 'user123',
            name: 'John Reporter',
            avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
          },
          reported: {
            id: 3,
            username: 'baduser',
            name: 'Bad User',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
          },
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z',
          severity: 'high'
        },
        {
          id: 2,
          type: 'user',
          targetId: 456,
          targetTitle: 'Inappropriate Profile Content',
          reason: 'inappropriate',
          description: 'User profile contains offensive content',
          reporter: {
            id: 4,
            username: 'reporter2',
            name: 'Jane Reporter',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
          },
          reported: {
            id: 5,
            username: 'offensiveuser',
            name: 'Offensive User',
            avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
          },
          status: 'pending',
          createdAt: '2024-01-14T15:45:00Z',
          severity: 'medium'
        }
      ];

      const mockUsers = [
        {
          id: 1,
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
          role: 'user',
          status: 'active',
          joinDate: '2024-01-01T00:00:00Z',
          lastActive: '2024-01-15T12:00:00Z',
          snippetsCount: 15,
          reportsCount: 0
        },
        {
          id: 2,
          username: 'suspicioususer',
          name: 'Suspicious User',
          email: 'suspicious@example.com',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
          role: 'user',
          status: 'suspended',
          joinDate: '2024-01-10T00:00:00Z',
          lastActive: '2024-01-14T08:00:00Z',
          snippetsCount: 3,
          reportsCount: 2
        }
      ];

      setReports(mockReports);
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: action }
          : report
      ));
      toast.success(`Report ${action} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} report`);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: action }
          : user
      ));
      toast.success(`User ${action} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'suspended': return 'text-red-500 bg-red-500/10';
      case 'banned': return 'text-red-700 bg-red-700/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'approved': return 'text-green-500 bg-green-500/10';
      case 'rejected': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (!isModerator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-dark-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
          <p className="text-dark-400">You don't have permission to access the moderation panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'reports', label: 'Reports', icon: Flag, count: reports.filter(r => r.status === 'pending').length },
    { id: 'users', label: 'Users', icon: User, count: users.length },
    { id: 'content', label: 'Content', icon: Code, count: 0 },
    { id: 'analytics', label: 'Analytics', icon: Eye, count: 0 }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.targetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reporter.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-primary-400" />
            <h1 className="text-3xl font-bold text-white">Moderation Panel</h1>
          </div>
          <p className="text-dark-300">Manage reports, users, and platform content</p>
        </div>

        {/* Tabs */}
        <div className="card mb-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-dark-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="input-field pl-10 w-full"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="all">All Status</option>
              {activeTab === 'reports' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </>
              )}
              {activeTab === 'users' && (
                <>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading moderation data..." />
          </div>
        ) : (
          <div>
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <div key={report.id} className="card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="flex items-center space-x-2">
                              {report.type === 'snippet' ? (
                                <Code className="h-5 w-5 text-primary-400" />
                              ) : (
                                <User className="h-5 w-5 text-secondary-400" />
                              )}
                              <span className="font-medium text-white">{report.targetTitle}</span>
                            </div>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                              {report.severity}
                            </span>
                            
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                          
                          <p className="text-dark-300 mb-3">{report.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-dark-400">
                            <div className="flex items-center space-x-2">
                              <img
                                src={report.reporter.avatar}
                                alt={report.reporter.name}
                                className="w-5 h-5 rounded-full"
                              />
                              <span>Reported by {report.reporter.username}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <img
                                src={report.reported.avatar}
                                alt={report.reported.name}
                                className="w-5 h-5 rounded-full"
                              />
                              <span>Against {report.reported.username}</span>
                            </div>
                            
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {report.status === 'pending' && (
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleReportAction(report.id, 'approved')}
                              className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleReportAction(report.id, 'rejected')}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Flag className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No reports found</h3>
                    <p className="text-dark-400">No reports match your current filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-white">{user.name}</h3>
                              <span className="text-dark-400">@{user.username}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-dark-400">
                              <span>{user.snippetsCount} snippets</span>
                              <span>{user.reportsCount} reports</span>
                              <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {isAdmin && user.status === 'active' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUserAction(user.id, 'suspended')}
                              className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-colors"
                              title="Suspend"
                            >
                              <EyeOff className="h-4 w-4" />
                            </button>
                            
                            <button
                              onClick={() => handleUserAction(user.id, 'banned')}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Ban"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        
                        {isAdmin && user.status !== 'active' && (
                          <button
                            onClick={() => handleUserAction(user.id, 'active')}
                            className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg transition-colors"
                            title="Reactivate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <User className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                    <p className="text-dark-400">No users match your current filters.</p>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs placeholder */}
            {(activeTab === 'content' || activeTab === 'analytics') && (
              <div className="text-center py-12">
                <AlertTriangle className="h-16 w-16 text-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
                <p className="text-dark-400">This feature is under development.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationPanel;