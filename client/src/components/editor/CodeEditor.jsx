
import { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, Users, Wifi, WifiOff, Play } from 'lucide-react';

export const CodeEditor = ({ projectId, snippets }) => {
  const [activeSnippet, setActiveSnippet] = useState(snippets[0]?.id || '');
  const [code, setCode] = useState(snippets[0]?.content || '');
  const [collaborators] = useState([
    { id: '1', username: 'alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', cursor: { line: 5, column: 10 } },
    { id: '2', username: 'bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', cursor: { line: 12, column: 5 } }
  ]);
  
  const editorRef = useRef(null);
  const { isConnected, joinProject, leaveProject, sendCodeChange } = useSocket({ 
    projectId, 
    autoConnect: true 
  });

  useEffect(() => {
    if (projectId) {
      joinProject(projectId);
      return () => leaveProject(projectId);
    }
  }, [projectId, joinProject, leaveProject]);

  useEffect(() => {
    const snippet = snippets.find(s => s.id === activeSnippet);
    if (snippet) {
      setCode(snippet.content);
    }
  }, [activeSnippet, snippets]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Add cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      const position = e.position;
      // Send cursor position to other collaborators
      sendCodeChange({
        type: 'cursor',
        position,
        userId: 'current-user'
      });
    });
  };

  const handleCodeChange = (value) => {
    if (value !== undefined) {
      setCode(value);
      sendCodeChange({
        type: 'content',
        content: value,
        snippetId: activeSnippet,
        userId: 'current-user'
      });
    }
  };

  const handleSave = () => {
    console.log('Saving code:', { snippetId: activeSnippet, content: code });
    // API call to save would go here
  };

  const handleRun = () => {
    console.log('Running code:', code);
    // Code execution logic would go here
  };

  const currentSnippet = snippets.find(s => s.id === activeSnippet);

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Code Editor</h3>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center">
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{collaborators.length}</span>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleRun}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* File Tabs */}
        <div className="w-64 border-r">
          <div className="p-4">
            <h4 className="text-sm font-medium mb-3">Files</h4>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {snippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => setActiveSnippet(snippet.id)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      activeSnippet === snippet.id
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    {snippet.name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Collaborators */}
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium mb-3">Collaborators</h4>
            <div className="space-y-2">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <img 
                    src={collaborator.avatar} 
                    alt={collaborator.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm">{collaborator.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          {currentSnippet ? (
            <Editor
              height="100%"
              language={currentSnippet.language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                rulers: [80],
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
                insertSpaces: true,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a file to start editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
