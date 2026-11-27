// Storage module: Handles localStorage persistence for progress, settings, and bookmarks.
const STORAGE_KEYS = {
  SETTINGS: 'shadowcast_settings',
  COMPLETED: 'shadowcast_completed',
  BOOKMARKS: 'shadowcast_bookmarks',
  LAST_ID: 'shadowcast_last_id',
  PROFILE: 'shadowcast_profile'
};

const DEFAULT_PROFILE = {
  name: '학습자',
  initials: '학습',
  photo: null
};

const DEFAULT_SETTINGS = {
  repeatCount: 2,
  speed: 1.0,
  waitMultiplier: 1.3,
  theme: 'light',
  nightAutoDark: false,
  autoAdvance: true,
  defaultTextExposure: 'all',
  autoExpandVerbs: true
};

export const Storage = {
  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getCompleted() {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    return raw ? JSON.parse(raw) : [];
  },

  clearCompleted() {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    return [];
  },

  setCompleted(id, isDone) {
    const list = this.getCompleted();
    const index = list.indexOf(id);
    if (isDone && index === -1) {
      list.push(id);
    } else if (!isDone && index !== -1) {
      list.splice(index, 1);
    }
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(list));
    return list;
  },

  getBookmarks() {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  },

  toggleBookmark(id) {
    const list = this.getBookmarks();
    const index = list.indexOf(id);
    if (index === -1) {
      list.push(id);
    } else {
      list.splice(index, 1);
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    return index === -1;
  },

  isBookmarked(id) {
    return this.getBookmarks().includes(id);
  },

  getLastId() {
    return localStorage.getItem(STORAGE_KEYS.LAST_ID);
  },

  setLastId(id) {
    localStorage.setItem(STORAGE_KEYS.LAST_ID, id);
  },

  getProfile() {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  },

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    return profile;
  }
};
