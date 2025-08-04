const map = {
  ".js": "javascript",
  ".ts": "typescript",
  ".jsx": "javascript",
  ".tsx": "typescript",
  ".py": "python",
  ".java": "java",
  ".cpp": "cpp",
  ".c": "c",
  ".rb": "ruby",
  ".go": "go",
  ".rs": "rust",
  ".php": "php",
  ".css": "css",
  ".html": "html",
  ".json": "json",
  ".md": "markdown",
  ".sql": "sql",
};

export const detectLanguage = (filename = "") =>
  map[(filename.match(/\.[^.]+$/) || [])[0]?.toLowerCase()] || "text";