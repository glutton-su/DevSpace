import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Calendar, User, Users } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SnippetActions from './SnippetActions';

const SnippetCard = ({ snippet, onStar, onFork, showFullCode = false, showCollaborationBadge = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-600',
      python: 'bg-blue-600',
      java: 'bg-orange-600',
      cpp: 'bg-purple-600',
      css: 'bg-pink-600',
      html: 'bg-red-600',
      typescript: 'bg-blue-500',
      php: 'bg-indigo-600',
      ruby: 'bg-red-500',
      go: 'bg-cyan-600'
    };
    return colors[language] || 'bg-gray-600';
  };

  const previewCode = showFullCode ? (snippet.content || snippet.code) : (snippet.content || snippet.code)?.slice(0, 300) + ((snippet.content || snippet.code)?.length > 300 ? '...' : '');

  const handleCardClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    
    // Navigate to snippet detail page
    navigate(`/snippet/${snippet.id}`);
  };
  return (
    <div 
      className="card hover:shadow-2xl transition-all duration-300 group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {snippet.title}
          </h3>
          <p className="text-dark-300 text-sm mb-3 line-clamp-2">
            {snippet.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getLanguageColor(snippet.language)}`}>
            {snippet.language}
          </span>
          {(showCollaborationBadge && snippet.allowCollaboration) && (
            <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-green-600 flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>Collab</span>
            </span>
          )}
        </div>
      </div>

      {/* Author Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <Link 
            to={`/profile/${snippet.author?.username || snippet.project?.owner?.username}`}
            className="text-dark-200 hover:text-white transition-colors text-sm font-medium"
          >
            {snippet.author?.name || snippet.project?.owner?.fullName || snippet.project?.owner?.username}
          </Link>
          <div className="flex items-center text-xs text-dark-400 space-x-3">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(snippet.createdAt || snippet.created_at)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{snippet.views || 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      <div className="relative mb-4 rounded-lg overflow-hidden bg-dark-900 border border-dark-700">
        <SyntaxHighlighter
          language={snippet.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            background: 'transparent',
            fontSize: '12px',
            maxHeight: showFullCode ? 'none' : '200px',
            overflow: 'hidden'
          }}
          showLineNumbers={false}
        >
          {previewCode}
        </SyntaxHighlighter>
        
        {!showFullCode && (snippet.content || snippet.code)?.length > 300 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-dark-900 to-transparent flex items-end justify-center pb-1">
            <span className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              View full code
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {snippet.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-600/20 text-primary-400 text-xs rounded-full border border-primary-600/30 hover:bg-primary-600/30 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?tag=${tag}`);
              }}
            >
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full border border-gray-600/30">
              +{snippet.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <SnippetActions
        snippet={snippet}
        onStar={onStar}
        onFork={onFork}
      />
    </div>
  );
};

export default SnippetCard;