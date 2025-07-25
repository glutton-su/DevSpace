import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { moderationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  Shield, 
  User, 
  Search, 
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Clock,
  Mail,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const Moderation = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, currentPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        search: searchQuery,
        limit: 20
      };
      
      const data = await moderationAPI.getAllUsers(params);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId, suspend = true) => {
    try {
      if (suspend) {
        await moderationAPI.suspendUser(userId);
      } else {
        await moderationAPI.unsuspendUser(userId);
      }

      toast.success(`User ${suspend ? 'suspended' : 'unsuspended'} successfully`);
      fetchUsers();
      setShowSuspendModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await moderationAPI.deleteUser(userId);

      toast.success('User deleted successfully');
      fetchUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-600 text-white';
      case 'moderator': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (isSuspended) => {
    return isSuspended ? 'text-red-600' : 'text-green-600';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the moderation panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Moderation Panel</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, suspend accounts, and moderate content across the platform.
          </p>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by username, email, or name..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading users..." />
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                    {users.map((userData) => (
                      <tr key={userData.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {userData.fullName || userData.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                <Mail className="h-3 w-3" />
                                <span>{userData.email}</span>
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                @{userData.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userData.role)}`}>
                            {userData.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {userData.isSuspended ? (
                              <>
                                <XCircle className={`h-4 w-4 ${getStatusColor(userData.isSuspended)}`} />
                                <span className={`text-sm font-medium ${getStatusColor(userData.isSuspended)}`}>
                                  Suspended
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className={`h-4 w-4 ${getStatusColor(userData.isSuspended)}`} />
                                <span className={`text-sm font-medium ${getStatusColor(userData.isSuspended)}`}>
                                  Active
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(userData.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {userData.lastLogin ? formatDate(userData.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {userData.id !== user.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedUser(userData);
                                    setShowSuspendModal(true);
                                  }}
                                  className={`p-2 rounded-lg transition-colors ${
                                    userData.isSuspended
                                      ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                                      : 'text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/20'
                                  }`}
                                  title={userData.isSuspended ? 'Unsuspend user' : 'Suspend user'}
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUser(userData);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search query' : 'No users to display'}
              </p>
            </div>
          )}
        </div>

        {/* Suspend Modal */}
        {showSuspendModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedUser.isSuspended ? 'Unsuspend User' : 'Suspend User'}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to {selectedUser.isSuspended ? 'unsuspend' : 'suspend'} <strong>{selectedUser.username}</strong>?
                {!selectedUser.isSuspended && ' This will prevent them from accessing the platform.'}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSuspendUser(selectedUser.id, !selectedUser.isSuspended)}
                  className={`flex-1 btn-primary ${selectedUser.isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                >
                  {selectedUser.isSuspended ? 'Unsuspend' : 'Suspend'}
                </button>
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-dark-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to permanently delete <strong>{selectedUser.username}</strong>? 
                This action cannot be undone and will remove all their content.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;
