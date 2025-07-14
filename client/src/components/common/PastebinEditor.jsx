import { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../../context/ThemeContext';
import { Copy, Check, Download, Share2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const PastebinEditor = ({ 
  code, 
  language, 
  onChange, 
  readOnly = false,
  title = '',
  onTitleChange,
  showLineNumbers = true,
  className = '',
  expiration = 'never',
  onExpirationChange,
  privacy = 'public',
  onPrivacyChange
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const languages = [
    'text', 'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php',
    'ruby', 'go', 'rust', 'typescript', 'html', 'css', 'scss',
    'sql', 'json', 'yaml', 'markdown', 'bash', 'powershell', 'xml'
  ];

  const expirationOptions = [
    { value: 'never', label: 'Never' },
    { value: '10m', label: '10 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1M', label: '1 Month' }
  ];

  const privacyOptions = [
    { value: 'public', label: 'Public' },
    { value: 'unlisted', label: 'Unlisted' },
    { value: 'private', label: 'Private' }
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

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'snippet'}.${language === 'javascript' ? 'js' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Code Snippet',
          text: 'Check out this code snippet',
          url: url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share');
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
    return code.split('\n').length;
  };

  const generateLineNumbers = () => {
    const lineCount = getLineCount();
    return Array.from({ length: lineCount }, (_, i) => i + 1);
  };

  return (
    <div className={`border border-gray-300 dark:border-dark-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-100 dark:bg-dark-800 px-4 py-3 border-b border-gray-300 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Title Input */}
            {!readOnly && onTitleChange && (
              <input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled"
                className="bg-transparent text-gray-900 dark:text-white font-medium text-lg focus:outline-none border-none"
              />
            )}
            {readOnly && title && (
              <h3 className="text-gray-900 dark:text-white font-medium text-lg">{title}</h3>
            )}
            
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => onChange && onChange(code, e.target.value)}
              disabled={readOnly}
              className="bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-gray-200 text-sm px-3 py-1 rounded border border-gray-300 dark:border-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {!readOnly && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && !readOnly && (
          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-dark-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiration
                </label>
                <select
                  value={expiration}
                  onChange={(e) => onExpirationChange && onExpirationChange(e.target.value)}
                  className="w-full bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-gray-200 text-sm px-3 py-1 rounded border border-gray-300 dark:border-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {expirationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Privacy
                </label>
                <select
                  value={privacy}
                  onChange={(e) => onPrivacyChange && onPrivacyChange(e.target.value)}
                  className="w-full bg-gray-200 dark:bg-dark-700 text-gray-900 dark:text-gray-200 text-sm px-3 py-1 rounded border border-gray-300 dark:border-dark-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {privacyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Code Area */}
      <div className="relative">
        {readOnly ? (
          <SyntaxHighlighter
            language={language}
            style={isDark ? vscDarkPlus : vs}
            showLineNumbers={showLineNumbers}
            customStyle={{
              margin: 0,
              background: 'transparent',
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
            {code}
          </SyntaxHighlighter>
        ) : (
          <div className="relative flex">
            {/* Line Numbers */}
            {showLineNumbers && (
              <div
                ref={lineNumbersRef}
                className="flex-shrink-0 w-12 bg-gray-50 dark:bg-dark-900 border-r border-gray-300 dark:border-dark-700 text-gray-500 dark:text-gray-400 text-sm font-mono leading-6 text-right pr-2 select-none overflow-hidden"
                style={{
                  paddingTop: '16px',
                  lineHeight: '24px',
                  fontSize: '14px'
                }}
              >
                {generateLineNumbers().map(lineNumber => (
                  <div key={lineNumber} className="h-6">
                    {lineNumber}
                  </div>
                ))}
              </div>
            )}
            
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => onChange && onChange(e.target.value, language)}
                onKeyDown={handleTabKey}
                onScroll={handleScroll}
                className="w-full h-96 bg-white dark:bg-dark-950 text-gray-900 dark:text-gray-100 font-mono text-sm p-4 border-none resize-none focus:outline-none"
                placeholder="Paste your code here..."
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
    </div>
  );
};

export default PastebinEditor;