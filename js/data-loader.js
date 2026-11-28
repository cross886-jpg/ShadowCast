// Data loader module: Fetches and indexes local curriculum JSON files by learning language code.
let currentLang = 'es';
let allSentences = [];
let sentencesById = new Map();

export const DataLoader = {
  getLanguage() {
    return currentLang;
  },

  getDataFiles(lang = 'es') {
    return [
      `./data/${lang}/a1_part1.json`,
      `./data/${lang}/a1_part2.json`,
      `./data/${lang}/a2.json`,
      `./data/${lang}/b1.json`,
      `./data/${lang}/b2.json`
    ];
  },

  async loadAll(lang = 'es') {
    currentLang = lang;
    const files = this.getDataFiles(lang);
    const responses = await Promise.all(files.map((url) => fetch(url)));
    const jsonLists = await Promise.all(responses.map((res) => res.json()));

    allSentences = jsonLists.flat();
    sentencesById = new Map(allSentences.map((s) => [s.id, s]));
    return allSentences;
  },

  getAll() {
    return allSentences;
  },

  getById(id) {
    return sentencesById.get(id);
  },

  getCategories(level = 'all', bookmarkIds = null) {
    let targetSentences = level === 'all'
      ? allSentences
      : allSentences.filter((s) => s.level.toLowerCase() === level.toLowerCase());

    if (bookmarkIds) {
      targetSentences = targetSentences.filter((s) => bookmarkIds.includes(s.id));
    }

    const catMap = new Map();
    for (const item of targetSentences) {
      const cat = item.category || '기타';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    }
    return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }));
  },

  filter(level = 'all', category = 'all', bookmarkIds = null) {
    return allSentences.filter((item) => {
      const matchesLevel = level === 'all' || item.level.toLowerCase() === level.toLowerCase();
      const matchesCategory = category === 'all' || item.category === category;
      const matchesBookmark = !bookmarkIds || bookmarkIds.includes(item.id);
      return matchesLevel && matchesCategory && matchesBookmark;
    });
  },

  getNextId(currentId, level = 'all', category = 'all', bookmarkIds = null) {
    const filtered = this.filter(level, category, bookmarkIds);
    if (filtered.length === 0) return null;
    const index = filtered.findIndex((s) => s.id === currentId);
    if (index === -1 || index === filtered.length - 1) return filtered[0].id;
    return filtered[index + 1].id;
  },

  getPrevId(currentId, level = 'all', category = 'all', bookmarkIds = null) {
    const filtered = this.filter(level, category, bookmarkIds);
    if (filtered.length === 0) return null;
    const index = filtered.findIndex((s) => s.id === currentId);
    if (index <= 0) return filtered[filtered.length - 1].id;
    return filtered[index - 1].id;
  }
};
