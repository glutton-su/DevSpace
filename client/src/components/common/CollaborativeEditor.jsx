import { useState, useEffect, useRef } from 'react';
import { Users, Wifi, WifiOff, Save, Download, GitBranch } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CodeEditor from './CodeEditor';
import toast from 'react-hot-toast';

const CollaborativeEditor = ({ roomId, initialCode = '', initialLanguage = 'javascript' }) => {
  const { user } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [cursors, setCursors] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [branch, setBranch] = useState('main');
  const editorRef = useRef(null);

  // Mock collaboration for demo
  useEffect(() => {
    setIsConnected(true);

    // Mock participants
    setParticipants([
      {
        id: user?.id,
        name: user?.name,
        avatar: user?.avatar,
        cursor: { line: 1, column: 1 },
        color: '#3b82f6'
      },
      {
        id: 2,
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        cursor: { line: 5, column: 10 },
        color: '#10b981'
      },
      {
        id: 3,
        name: 'Alex Rodriguez',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&dpr=2',
        cursor: { line: 12, column: 5 },
        color: '#f59e0b'
      }
    ]);

  }, [roomId, user]);

  const handleCodeChange = (newCode, newLanguage) => {
    setCode(newCode);
    if (newLanguage) {
      setLanguage(newLanguage);
    }

    // Simulate real-time collaboration
    console.log('Code changed:', { roomId, code: newCode, language: newLanguage || language });
  };

  const handleSave = async () => {
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastSaved(new Date());
      toast.success('Code saved successfully!');
      
      console.log('Code saved:', { roomId, code, language });
    } catch (error) {
      toast.error('Failed to save code');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collaboration-${roomId}.${language === 'javascript' ? 'js' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never';
    const now = new Date();
    const diff = now - lastSaved;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return lastSaved.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Collaboration Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-300 dark:border-dark-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Disconnected</span>
                </>
              )}
            </div>

            {/* Branch Info */}
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{branch}</span>
            </div>

            {/* Participants */}
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="flex -space-x-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="relative"
                    title={participant.name}
                  >
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-dark-800"
                      style={{ borderColor: participant.color }}
                    />
                    {participant.id === user?.id && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white dark:border-dark-800"></div>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {participants.length} online
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last saved: {formatLastSaved()}
            </span>
            
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm transition-colors"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              <Download className="h-3 w-3" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <CodeEditor
          ref={editorRef}
          code={code}
          language={language}
          onChange={handleCodeChange}
          showLineNumbers={true}
          className="h-full border-none"
        />
      </div>
    </div>
  );
};

export default CollaborativeEditor;