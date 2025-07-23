// Utility functions for data normalization

/**
 * Normalize tags from various formats to consistent string array
 * @param {Array} tags - Array of tags (can be strings or objects with name property)
 * @returns {Array} Array of string tag names
 */
export const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  
  return tags.map(tag => {
    if (typeof tag === 'string') return tag;
    if (tag && typeof tag === 'object' && tag.name) return tag.name;
    return String(tag);
  }).filter(Boolean);
};

/**
 * Normalize snippet data to ensure consistent structure
 * @param {Object} snippet - Raw snippet data from API
 * @returns {Object} Normalized snippet data
 */
export const normalizeSnippet = (snippet) => {
  if (!snippet) return snippet;
  
  return {
    ...snippet,
    tags: normalizeTags(snippet.tags),
    content: snippet.content || snippet.code || '',
    createdAt: snippet.createdAt || snippet.created_at,
    updatedAt: snippet.updatedAt || snippet.updated_at
  };
};

/**
 * Normalize array of snippets
 * @param {Array} snippets - Array of raw snippet data from API
 * @returns {Array} Array of normalized snippet data
 */
export const normalizeSnippets = (snippets) => {
  if (!Array.isArray(snippets)) return [];
  return snippets.map(normalizeSnippet);
};
