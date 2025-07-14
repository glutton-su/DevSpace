import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CollaborativeEditor from '../common/CollaborativeEditor';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  Users, 
  MessageCircle, 
  Settings, 
  Share2, 
  ExternalLink,
  Send,
  GitBranch,
  GitCommit,
  GitPullRequest,
  History,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const CollaborationRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'files', 'history'
  const [commits, setCommits] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);

  useEffect(() => {
    fetchRoom();
    initializeChat();
    initializeCommits();
    initializePullRequests();
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      // Mock room data
      const mockRoom = {
        id: parseInt(roomId),
        name: 'React Component Library',
        description: 'Building reusable components for our design system',
        participants: [
          {
            id: user?.id,
            name: user?.name,
            avatar: user?.avatar,
            isOwner: true,
            role: 'maintainer',
            color: '#3b82f6'
          },
          {
            id: 2,
            name: 'Sarah Chen',
            avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
            isOwner: false,
            role: 'contributor',
            color: '#10b981'
          },
          {
            id: 3,
            name: 'Alex Rodriguez',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
            isOwner: false,
            role: 'contributor',
            color: '#f59e0b'
          }
        ],
        maxParticipants: 5,
        isActive: true,
        isPublic: true,
        language: 'javascript',
        code: `import React, { useState } from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async (e) => {
    if (onClick) {
      setIsLoading(true);
      try {
        await onClick(e);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const className = \`btn btn-\${variant} btn-\${size} \${isLoading ? 'loading' : ''}\`;
  
  return (
    <button 
      className={className}
      disabled={disabled || isLoading}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

export default Button;`,
        createdAt: '2024-01-15T08:00:00Z',
        owner: {
          id: user?.id,
          username: user?.username,
          name: user?.name,
          avatar: user?.avatar
        }
      };
      
      setRoom(mockRoom);
    } catch (error) {
      console.error('Error fetching room:', error);
      toast.error('Failed to load collaboration room');
      navigate('/collaborate');
    } finally {
      setLoading(false);
    }
  };

  const initializeChat = () => {
    // Mock chat messages
    const mockMessages = [
      {
        id: 1,
        user: {
          id: 2,
          name: 'Sarah Chen',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
        },
        message: 'Hey everyone! Ready to work on the button component?',
        timestamp: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 2,
        user: {
          id: 3,
          name: 'Alex Rodriguez',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2'
        },
        message: 'Looks good! I think we should add loading states.',
        timestamp: new Date(Date.now() - 120000).toISOString()
      }
    ];
    
    setChatMessages(mockMessages);
  };

  const initializeCommits = () => {
    const mockCommits = [
      {
        id: 1,
        message: 'Add loading state to Button component',
        author: 'Sarah Chen',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        hash: 'a1b2c3d'
      },
      {
        id: 2,
        message: 'Initial Button component implementation',
        author: user?.name,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        hash: 'e4f5g6h'
      }
    ];
    setCommits(mockCommits);
  };

  const initializePullRequests = () => {
    const mockPRs = [
      {
        id: 1,
        title: 'Add variant prop to Button component',
        author: 'Alex Rodriguez',
        status: 'open',
        timestamp: new Date(Date.now() - 1800000).toISOString()
      }
    ];
    setPullRequests(mockPRs);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      user: {
        id: user?.id,
        name: user?.name,
        avatar: user?.avatar
      },
      message: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to leave this collaboration session?')) {
      navigate('/collaborate');
      toast.success('Left collaboration room');
    }
  };

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: room.name,
          text: 'Join me in this collaboration session',
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Room link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share room');
    }
  };

  const handleCommit = () => {
    const commitMessage = prompt('Enter commit message:');
    if (commitMessage) {
      const newCommit = {
        id: Date.now(),
        message: commitMessage,
        author: user?.name,
        timestamp: new Date().toISOString(),
        hash: Math.random().toString(36).substr(2, 7)
      };
      setCommits(prev => [newCommit, ...prev]);
      toast.success('Changes committed successfully!');
    }
  };

  const handleCreatePR = () => {
    const prTitle = prompt('Enter pull request title:');
    if (prTitle) {
      const newPR = {
        id: Date.now(),
        title: prTitle,
        author: user?.name,
        status: 'open',
        timestamp: new Date().toISOString()
      };
      setPullRequests(prev => [newPR, ...prev]);
      toast.success('Pull request created successfully!');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return time.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Joining collaboration room..." />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Room not found</h2>
          <p className="text-dark-400 mb-4">This collaboration room doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/collaborate')}
            className="btn-primary"
          >
            Back to Collaboration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold text-white">{room.name}</h1>
              <p className="text-sm text-dark-400">{room.description}</p>
            </div>
            
            {/* Participants */}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-dark-400" />
              <div className="flex -space-x-2">
                {room.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="relative"
                    title={`${participant.name} (${participant.role})`}
                  >
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full border-2 border-dark-900"
                      style={{ borderColor: participant.color }}
                    />
                    {participant.isOwner && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-dark-900"></div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-sm text-dark-400">
                {room.participants.length}/{room.maxParticipants}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Git Actions */}
            <button
              onClick={handleCommit}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              title="Commit changes"
            >
              <GitCommit className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleCreatePR}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Create pull request"
            >
              <GitPullRequest className="h-4 w-4" />
            </button>

            {/* Chat Toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                  : 'bg-dark-700 hover:bg-dark-600 text-dark-400'
              }`}
              title="Toggle chat"
            >
              <MessageCircle className="h-4 w-4" />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 bg-dark-700 hover:bg-dark-600 text-dark-400 hover:text-white rounded-lg transition-colors"
              title="Share room"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* Leave */}
            <button
              onClick={handleLeaveRoom}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Leave room"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Navigation */}
        <div className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
          {/* Tabs */}
          <div className="p-4 border-b border-dark-700">
            <div className="space-y-1">
              {[
                { id: 'code', label: 'Code', icon: FileText },
                { id: 'history', label: 'History', icon: History },
                { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
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
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'history' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white mb-3">Recent Commits</h3>
                {commits.map(commit => (
                  <div key={commit.id} className="p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <GitCommit className="h-4 w-4 text-green-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{commit.message}</p>
                        <p className="text-xs text-dark-400">
                          {commit.author} • {formatRelativeTime(commit.timestamp)}
                        </p>
                        <p className="text-xs text-dark-500 font-mono">{commit.hash}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'pulls' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white mb-3">Pull Requests</h3>
                {pullRequests.map(pr => (
                  <div key={pr.id} className="p-3 bg-dark-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <GitPullRequest className="h-4 w-4 text-blue-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{pr.title}</p>
                        <p className="text-xs text-dark-400">
                          {pr.author} • {formatRelativeTime(pr.timestamp)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          pr.status === 'open' ? 'bg-green-900 text-green-300' : 'bg-purple-900 text-purple-300'
                        }`}>
                          {pr.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white mb-3">Project Files</h3>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 p-2 bg-dark-800 rounded text-sm text-white">
                    <FileText className="h-4 w-4" />
                    <span>Button.jsx</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-dark-800 rounded text-sm text-dark-300">
                    <FileText className="h-4 w-4" />
                    <span>Button.css</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 hover:bg-dark-800 rounded text-sm text-dark-300">
                    <FileText className="h-4 w-4" />
                    <span>Button.test.js</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} flex flex-col`}>
          <CollaborativeEditor
            roomId={roomId}
            initialCode={room.code}
            initialLanguage={room.language}
          />
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-dark-900 border-l border-dark-700 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-dark-700">
              <h3 className="font-semibold text-white">Team Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <img
                    src={message.user.avatar}
                    alt={message.user.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">
                        {message.user.name}
                      </span>
                      <span className="text-xs text-dark-400">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-dark-200 mt-1 break-words">
                      {message.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationRoom;