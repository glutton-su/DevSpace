
import { create } from 'zustand';

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} language
 * @property {string[]} tags
 * @property {number} stars
 * @property {number} forks
 * @property {{username: string, avatar: string}} owner
 * @property {boolean} isStarred
 * @property {string} updatedAt
 * @property {any[]=} snippets
 */

/**
 * Zustand store for projects.
 */
export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  searchQuery: '',
  selectedLanguage: '',
  selectedTags: [],
  isLoading: false,
  
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  starProject: (id) => {
    const projects = get().projects.map(project =>
      project.id === id
        ? { ...project, isStarred: !project.isStarred, stars: project.isStarred ? project.stars - 1 : project.stars + 1 }
        : project
    );
    set({ projects });
  },
}));
