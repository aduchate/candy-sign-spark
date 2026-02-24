/**
 * Offline cache service using localStorage.
 * Caches module data so the app works without network.
 */

const PREFIX = 'lsfb_offline_';
const META_SUFFIX = '_meta';

interface CacheMeta {
  timestamp: number;
  ttl: number; // ms
}

// Default TTL: 24 hours
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

export const offlineCache = {
  set<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(data));
      const meta: CacheMeta = { timestamp: Date.now(), ttl };
      localStorage.setItem(PREFIX + key + META_SUFFIX, JSON.stringify(meta));
    } catch (e) {
      console.warn('offlineCache: failed to write', key, e);
    }
  },

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (!raw) return null;

      const metaRaw = localStorage.getItem(PREFIX + key + META_SUFFIX);
      if (metaRaw) {
        const meta: CacheMeta = JSON.parse(metaRaw);
        if (Date.now() - meta.timestamp > meta.ttl) {
          // Expired but still return data for offline use
          // Mark as stale but don't delete
        }
      }

      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  isStale(key: string): boolean {
    try {
      const metaRaw = localStorage.getItem(PREFIX + key + META_SUFFIX);
      if (!metaRaw) return true;
      const meta: CacheMeta = JSON.parse(metaRaw);
      return Date.now() - meta.timestamp > meta.ttl;
    } catch {
      return true;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
    localStorage.removeItem(PREFIX + key + META_SUFFIX);
  },

  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },
};

// Cache keys for each module
export const CACHE_KEYS = {
  ALPHABET_SIGNS: 'alphabet_signs',
  WORD_SIGNS: 'word_signs',
  LESSONS: 'lessons',
  QUIZZES: 'quizzes',
  NEWS_ARTICLES: 'news_articles',
  JOB_LISTINGS: 'job_listings',
  DONATION_PAGES: 'donation_pages',
  USER_PROGRESS: 'user_progress',
  USER_PROFILE: 'user_profile',
  GLOSSARY_WORDS: 'glossary_words',
  HOSPITALS: 'hospitals',
  USEFUL_LINKS: 'useful_links',
  INTERPRETER_SERVICES: 'interpreter_services',
} as const;
