import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../context/ThemeContext';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const CodeEditor = ({ 
  code, 
  language, 
  onChange, 
  readOnly = false, 
  showLineNumbers = true,
  className = '' 
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const containerRef = useRef(null);

  const languages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 
    'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'scss',
    'sql', 'json', 'yaml', 'markdown', 'bash', 'powershell'
  ];

  // Sync scroll between textarea and line numbers
  const handleScroll = (e) => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Update line numbers when code changes
  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      const textarea = textareaRef.current;
      const lineNumbers = lineNumbersRef.current;
      
      // Sync scroll position
      lineNumbers.scrollTop = textarea.scrollTop;
    }
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue, language);
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getLineCount = () => {
    return Math.max(1, (code || '').split('\n').length);
  };

  const generateLineNumbers = () => {
    const lineCount = getLineCount();
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  };

  if (readOnly) {
    return (
      <div className={`relative ${className}`} ref={containerRef}>
        <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-800 px-4 py-2 border-b border-gray-300 dark:border-dark-700">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-dark-400 uppercase font-mono">
              {language}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={handleCopy}
              className="p-1 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-auto">
          <SyntaxHighlighter
            language={language}
            style={isDark ? vscDarkPlus : vs}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              background: isDark ? 'rgb(15 23 42)' : 'rgb(248 250 252)',
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace'
            }}
            lineNumberStyle={{
              color: isDark ? '#6b7280' : '#9ca3af',
              backgroundColor: 'transparent',
              paddingRight: '1em',
              textAlign: 'right',
              userSelect: 'none'
            }}
          >
            {code || ''}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative border border-gray-300 dark:border-dark-700 rounded-lg overflow-hidden ${className}`} ref={containerRef}>
      <div className="flex items-center justify-between bg-gray-100 dark:bg-dark-800 px-4 py-2 border-b border-gray-300 dark:border-dark-700">
        <select
          value={language}
          onChange={(e) => onChange && onChange(code, e.target.value)}
          className="bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-gray-200 text-xs px-2 py-1 rounded border border-gray-300 dark:border-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={showPreview ? 'Edit mode' : 'Preview mode'}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="max-h-96 overflow-auto">
          <SyntaxHighlighter
            language={language}
            style={isDark ? vscDarkPlus : vs}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              background: isDark ? 'rgb(15 23 42)' : 'rgb(248 250 252)',
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace'
            }}
            lineNumberStyle={{
              color: isDark ? '#6b7280' : '#9ca3af',
              backgroundColor: 'transparent',
              paddingRight: '1em',
              textAlign: 'right',
              userSelect: 'none'
            }}
          >
            {code || ''}
          </SyntaxHighlighter>
        </div>
      ) : (
        <div className="relative flex h-96">
          {/* Line Numbers */}
          {showLineNumbers && (
            <div
              ref={lineNumbersRef}
              className="flex-shrink-0 w-12 bg-gray-50 dark:bg-dark-900 border-r border-gray-300 dark:border-dark-700 text-gray-500 dark:text-gray-400 text-sm font-mono text-right pr-2 select-none overflow-hidden"
              style={{
                paddingTop: '16px',
                lineHeight: '24px',
                fontSize: '14px'
              }}
            >
              {generateLineNumbers().map(lineNumber => (
                <div key={lineNumber} className="h-6 leading-6">
                  {lineNumber}
                </div>
              ))}
            </div>
          )}
          
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={code || ''}
              onChange={(e) => onChange && onChange(e.target.value, language)}
              onKeyDown={handleTabKey}
              onScroll={handleScroll}
              className="w-full h-full bg-white dark:bg-dark-950 text-gray-900 dark:text-gray-100 font-mono text-sm p-4 border-none resize-none focus:outline-none"
              placeholder="Enter your code here..."
              spellCheck={false}
              style={{
                fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
                lineHeight: '24px',
                fontSize: '14px',
                tabSize: 2
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;