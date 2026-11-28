// Main application coordinator
import { Storage } from './storage.js';
import { DataLoader } from './data-loader.js';
import { AudioPlayer } from './audio-player.js';
import { UIRenderer } from './ui-render.js';
import { SettingsView, getEffectiveTheme } from './settings.js';
import { I18n } from './i18n.js';

let appState = {
  currentLevel: 'all',
  currentCategory: 'all',
  currentSentenceId: null,
  isEsHidden: false,
  isKoHidden: false,
  onlyBookmarks: false,
  settings: Storage.getSettings()
};

async function init() {
  const domMap = {
    spanishText: document.getElementById('spanishText'),
    koreanText: document.getElementById('koreanText'),
    spanishContainer: document.getElementById('spanishContainer'),
    koreanContainer: document.getElementById('koreanContainer'),
    bookmarkBtn: document.getElementById('bookmarkBtn'),
    bookmarkIcon: document.getElementById('bookmarkIcon'),
    phaseBadge: document.getElementById('phaseBadge'),
    phaseIcon: document.getElementById('phaseIcon'),
    phaseText: document.getElementById('phaseText'),
    countdownTimer: document.getElementById('countdownTimer'),
    audioTimeLabel: document.getElementById('audioTimeLabel'),
    progressFill: document.getElementById('speakingProgressFill'),
    vocabContainer: document.getElementById('vocabContainer'),
    verbsContainer: document.getElementById('verbsContainer'),
    verbsSection: document.getElementById('verbsSection'),
    playlistContainer: document.getElementById('playlistContainer'),
    scopeSelect: document.getElementById('scopeSelect'),
    scopeProgressText: document.getElementById('scopeProgressText'),
    scopeProgressBar: document.getElementById('scopeProgressBar'),
    playIconSpan: document.getElementById('playIconSpan'),
    repeatChipLabel: document.getElementById('repeatChipLabel'),
    speedChipLabel: document.getElementById('speedChipLabel'),
    waitChipLabel: document.getElementById('waitChipLabel')
  };

  UIRenderer.init(domMap);
  applyTheme(getEffectiveTheme(appState.settings.theme, appState.settings.nightAutoDark));

  if (appState.settings.defaultTextExposure === 'hide_es') {
    appState.isEsHidden = true;
  } else if (appState.settings.defaultTextExposure === 'hide_ko') {
    appState.isKoHidden = true;
  }

  if (!appState.settings.autoExpandVerbs) {
    document.getElementById('grammarContent').classList.add('hidden');
    document.getElementById('grammarChevron').textContent = 'expand_more';
    document.getElementById('grammarToggleLabel').textContent = '해설 펼치기';
  }

  await I18n.load('ko');
  await DataLoader.loadAll('es');

  AudioPlayer.setSpeed(appState.settings.speed);
  AudioPlayer.setWaitMultiplier(appState.settings.waitMultiplier);
  AudioPlayer.setRepeatCount(appState.settings.repeatCount);
  updateMultiplierChips();

  AudioPlayer.setCallbacks({
    onPhaseChange: (phase, data) => {
      UIRenderer.renderPhase(phase, data);
      domMap.playIconSpan.textContent = AudioPlayer.isPlaying && !AudioPlayer.isPaused ? 'pause' : 'play_arrow';
    },
    onProgress: (phase, progress, remaining) => {
      UIRenderer.updateProgress(phase, progress, remaining);
    },
    onSentenceComplete: (sentence) => {
      Storage.setCompleted(sentence.id, true);
      if (appState.settings.autoAdvance) {
        const nextId = DataLoader.getNextId(sentence.id, appState.currentLevel, appState.currentCategory, getActiveBookmarkIds());
        selectSentence(nextId, true);
      } else {
        AudioPlayer.stop();
        refreshPlaylist();
        updateScopeStats();
      }
    }
  });

  SettingsView.init({
    onSettingChange: (changes) => {
      appState.settings = { ...appState.settings, ...changes };
      Storage.saveSettings(appState.settings);

      if (changes.speed !== undefined) {
        AudioPlayer.setSpeed(changes.speed);
      }
      if (changes.repeatCount !== undefined) {
        AudioPlayer.setRepeatCount(changes.repeatCount);
      }
      if (changes.waitMultiplier !== undefined) {
        AudioPlayer.setWaitMultiplier(changes.waitMultiplier);
      }
      if (changes.theme !== undefined || changes.nightAutoDark !== undefined) {
        applyTheme(getEffectiveTheme(appState.settings.theme, appState.settings.nightAutoDark));
      }
      if (changes.defaultTextExposure !== undefined) {
        appState.isEsHidden = changes.defaultTextExposure === 'hide_es';
        appState.isKoHidden = changes.defaultTextExposure === 'hide_ko';
        const sentence = DataLoader.getById(appState.currentSentenceId);
        if (sentence) {
          UIRenderer.renderCard(sentence, Storage.isBookmarked(sentence.id), appState.isEsHidden, appState.isKoHidden);
        }
      }
      if (changes.autoExpandVerbs !== undefined) {
        const grammarContent = document.getElementById('grammarContent');
        const chevron = document.getElementById('grammarChevron');
        const label = document.getElementById('grammarToggleLabel');
        if (changes.autoExpandVerbs) {
          grammarContent.classList.remove('hidden');
          chevron.textContent = 'expand_less';
          label.textContent = '해설 가리기';
        } else {
          grammarContent.classList.add('hidden');
          chevron.textContent = 'expand_more';
          label.textContent = '해설 펼치기';
        }
      }

      updateMultiplierChips();
      SettingsView.renderOptions(appState.settings);
    },
    onClearCompleted: () => {
      refreshPlaylist();
      updateScopeStats();
    },
    onProfileChange: (profile) => {
      updateHeaderProfile(profile);
    }
  });

  updateHeaderProfile(Storage.getProfile());

  populateCategories();

  const savedLastId = Storage.getLastId();
  const initialSentence = DataLoader.getById(savedLastId) || DataLoader.getAll()[0];
  if (initialSentence) {
    selectSentence(initialSentence.id, false);
  }

  bindEventListeners(domMap);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
}

function getActiveBookmarkIds() {
  return appState.onlyBookmarks ? Storage.getBookmarks() : null;
}

function getCurrentList() {
  return DataLoader.filter(appState.currentLevel, appState.currentCategory, getActiveBookmarkIds());
}

function selectSentence(id, autoPlay = false) {
  const sentence = id ? DataLoader.getById(id) : null;
  if (!sentence) {
    appState.currentSentenceId = null;
    AudioPlayer.stop();
    UIRenderer.renderCard(null, false, appState.isEsHidden, appState.isKoHidden);
    UIRenderer.renderVocab([]);
    UIRenderer.renderVerbs([]);
    refreshPlaylist();
    updateScopeStats();
    return;
  }

  appState.currentSentenceId = sentence.id;
  Storage.setLastId(sentence.id);

  const isBookmarked = Storage.isBookmarked(sentence.id);
  UIRenderer.renderCard(sentence, isBookmarked, appState.isEsHidden, appState.isKoHidden);
  UIRenderer.renderVocab(sentence.vocab);
  UIRenderer.renderVerbs(sentence.verbs);

  refreshPlaylist();
  updateScopeStats();

  if (autoPlay) {
    AudioPlayer.start(sentence);
  } else {
    AudioPlayer.stop();
  }
}

function refreshPlaylist() {
  const currentList = getCurrentList();
  const completed = Storage.getCompleted();
  const bookmarks = Storage.getBookmarks();
  UIRenderer.renderPlaylist(currentList, appState.currentSentenceId, completed, bookmarks, (id) => {
    selectSentence(id, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function updateScopeStats() {
  const currentList = getCurrentList();
  const completed = Storage.getCompleted();
  const doneCount = currentList.filter((s) => completed.includes(s.id)).length;
  UIRenderer.renderScopeProgress(doneCount, currentList.length);
}

function populateCategories() {
  const scopeSelect = document.getElementById('scopeSelect');
  const bookmarkIds = getActiveBookmarkIds();
  const cats = DataLoader.getCategories(appState.currentLevel, bookmarkIds);
  const total = cats.reduce((acc, c) => acc + c.count, 0);

  if (cats.length === 0) {
    scopeSelect.innerHTML = `<option value="all">${appState.onlyBookmarks ? '즐겨찾기 없음 (0)' : '전체 주제 (0)'}</option>`;
    appState.currentCategory = 'all';
    return;
  }

  const labelPrefix = appState.onlyBookmarks ? '즐겨찾기 전체' : '전체 주제';
  scopeSelect.innerHTML = `<option value="all">${labelPrefix} (${total})</option>`;
  for (const c of cats) {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = `${c.name} (${c.count})`;
    scopeSelect.appendChild(opt);
  }

  if (appState.currentCategory !== 'all' && !cats.some((c) => c.name === appState.currentCategory)) {
    appState.currentCategory = 'all';
  }
  scopeSelect.value = appState.currentCategory;
}

function updateMultiplierChips() {
  const count = AudioPlayer.repeatCount;
  const label = count === 0 ? '무제한' : `${count}회`;
  document.getElementById('repeatChipLabel').textContent = `반복 ${label}`;
  document.getElementById('speedChipLabel').textContent = `배속 ${AudioPlayer.speed.toFixed(1)}x`;
  document.getElementById('waitChipLabel').textContent = `대기 ${AudioPlayer.waitMultiplier.toFixed(1)}x`;
}

function applyRepeatCount(count) {
  AudioPlayer.setRepeatCount(count);
  appState.settings.repeatCount = count;
  Storage.saveSettings(appState.settings);
  updateMultiplierChips();
  SettingsView.renderOptions(appState.settings);
}

function applySpeed(speed) {
  AudioPlayer.setSpeed(speed);
  appState.settings.speed = speed;
  Storage.saveSettings(appState.settings);
  updateMultiplierChips();
  SettingsView.renderOptions(appState.settings);
}

function applyWaitMultiplier(wait) {
  AudioPlayer.setWaitMultiplier(wait);
  appState.settings.waitMultiplier = wait;
  Storage.saveSettings(appState.settings);
  updateMultiplierChips();
  SettingsView.renderOptions(appState.settings);
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function updateHeaderProfile(profile) {
  const icon = document.getElementById('headerSettingsIcon');
  const avatar = document.getElementById('headerProfileAvatar');
  if (!icon || !avatar) return;

  if (profile && profile.photo) {
    avatar.src = profile.photo;
    avatar.classList.remove('hidden');
    icon.classList.add('hidden');
  } else {
    avatar.classList.add('hidden');
    icon.classList.remove('hidden');
  }
}

function toggleBookmarkMode(targetState) {
  appState.onlyBookmarks = typeof targetState === 'boolean' ? targetState : !appState.onlyBookmarks;

  const headerTitle = document.getElementById('headerTitle');
  const headerBackBtn = document.getElementById('headerBackBtn');
  const headerBookmarkBtn = document.getElementById('headerBookmarkBtn');

  if (appState.onlyBookmarks) {
    headerTitle.textContent = '즐겨찾기';
    headerBackBtn.classList.remove('hidden');
    headerBackBtn.classList.add('flex');
    headerBookmarkBtn.classList.add('text-primary');
    headerBookmarkBtn.querySelector('.material-symbols-outlined').classList.add('fill');
    headerBookmarkBtn.title = '전체 학습으로 돌아가기';
  } else {
    headerTitle.textContent = 'Shadow Cast';
    headerBackBtn.classList.add('hidden');
    headerBackBtn.classList.remove('flex');
    headerBookmarkBtn.classList.remove('text-primary');
    headerBookmarkBtn.querySelector('.material-symbols-outlined').classList.remove('fill');
    headerBookmarkBtn.title = '즐겨찾기 목록';
  }

  const playlistHeaderLabel = document.getElementById('playlistHeaderLabel');
  if (playlistHeaderLabel) {
    playlistHeaderLabel.textContent = appState.onlyBookmarks ? '즐겨찾기 문장 목록' : '학습 문장 목록';
  }

  populateCategories();
  const currentList = getCurrentList();
  if (currentList.length > 0) {
    const exists = currentList.some((s) => s.id === appState.currentSentenceId);
    selectSentence(exists ? appState.currentSentenceId : currentList[0].id, false);
  } else {
    selectSentence(null, false);
  }
}

function bindEventListeners(domMap) {
  // Level switcher
  const levelBtns = document.querySelectorAll('.level-chip');
  levelBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      levelBtns.forEach((b) => {
        b.className = 'level-chip flex-1 py-1 rounded-lg bg-surface-container text-on-surface-variant font-label-md text-label-md whitespace-nowrap text-center';
      });
      btn.className = 'level-chip flex-1 py-1 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold whitespace-nowrap text-center shadow-sm';
      appState.currentLevel = btn.dataset.level;
      appState.currentCategory = 'all';
      populateCategories();
      const currentList = getCurrentList();
      selectSentence(currentList[0]?.id || null, false);
    });
  });

  // Category select
  domMap.scopeSelect.addEventListener('change', (e) => {
    appState.currentCategory = e.target.value;
    const currentList = getCurrentList();
    selectSentence(currentList[0]?.id || null, false);
  });

  // Bookmark toggle
  domMap.bookmarkBtn.addEventListener('click', () => {
    if (!appState.currentSentenceId) return;
    const isBookmarked = Storage.toggleBookmark(appState.currentSentenceId);

    if (appState.onlyBookmarks && !isBookmarked) {
      populateCategories();
      const currentList = getCurrentList();
      selectSentence(currentList[0]?.id || null, AudioPlayer.isPlaying);
    } else {
      UIRenderer.renderCard(DataLoader.getById(appState.currentSentenceId), isBookmarked, appState.isEsHidden, appState.isKoHidden);
      populateCategories();
      refreshPlaylist();
      updateScopeStats();
    }
  });

  // Visibility buttons
  const toggleEsBtn = document.getElementById('toggleEsBtn');
  const toggleKoBtn = document.getElementById('toggleKoBtn');
  const toggleEsLabel = document.getElementById('toggleEsLabel');
  const toggleKoLabel = document.getElementById('toggleKoLabel');

  toggleEsBtn.addEventListener('click', () => {
    appState.isEsHidden = !appState.isEsHidden;
    domMap.spanishContainer.style.opacity = appState.isEsHidden ? '0' : '1';
    domMap.spanishContainer.style.pointerEvents = appState.isEsHidden ? 'none' : 'auto';
    toggleEsLabel.textContent = appState.isEsHidden ? '스페인어 보기' : '스페인어 가리기';
  });

  toggleKoBtn.addEventListener('click', () => {
    appState.isKoHidden = !appState.isKoHidden;
    domMap.koreanContainer.style.opacity = appState.isKoHidden ? '0' : '1';
    toggleKoLabel.textContent = appState.isKoHidden ? '한국어 보기' : '한국어 가리기';
  });

  // Transport
  document.getElementById('transportPrev').addEventListener('click', () => {
    const prevId = DataLoader.getPrevId(appState.currentSentenceId, appState.currentLevel, appState.currentCategory, getActiveBookmarkIds());
    if (prevId) selectSentence(prevId, AudioPlayer.isPlaying);
  });

  document.getElementById('transportNext').addEventListener('click', () => {
    const nextId = DataLoader.getNextId(appState.currentSentenceId, appState.currentLevel, appState.currentCategory, getActiveBookmarkIds());
    if (nextId) selectSentence(nextId, AudioPlayer.isPlaying);
  });

  document.getElementById('transportMainPlay').addEventListener('click', () => {
    if (!AudioPlayer.isPlaying) {
      const sentence = DataLoader.getById(appState.currentSentenceId);
      if (sentence) AudioPlayer.start(sentence);
    } else {
      AudioPlayer.togglePause();
      domMap.playIconSpan.textContent = AudioPlayer.isPaused ? 'play_arrow' : 'pause';
    }
  });

  // Multiplier chips cycle
  document.getElementById('repeatChip').addEventListener('click', () => {
    const cycles = [1, 2, 3, 5, 10, 0];
    const currentIndex = cycles.indexOf(AudioPlayer.repeatCount);
    const next = cycles[(currentIndex + 1) % cycles.length];
    applyRepeatCount(next);
  });

  document.getElementById('speedChip').addEventListener('click', () => {
    const cycles = [0.8, 1.0, 1.2, 1.5, 2.0];
    const currentIndex = cycles.indexOf(AudioPlayer.speed);
    const next = cycles[(currentIndex + 1) % cycles.length];
    applySpeed(next);
  });

  document.getElementById('waitChip').addEventListener('click', () => {
    const cycles = [1.0, 1.3, 1.5, 2.0];
    const currentIndex = cycles.indexOf(AudioPlayer.waitMultiplier);
    const next = cycles[(currentIndex + 1) % cycles.length];
    applyWaitMultiplier(next);
  });

  // Header bookmark filter & back button
  document.getElementById('headerBookmarkBtn').addEventListener('click', () => {
    toggleBookmarkMode();
  });

  document.getElementById('headerBackBtn').addEventListener('click', () => {
    toggleBookmarkMode(false);
  });

  // Settings view open
  document.getElementById('headerSettingsBtn').addEventListener('click', () => {
    AudioPlayer.stop();
    SettingsView.open(appState, DataLoader.getAll().length);
  });

  // Word meaning popup modal close bindings
  const wordPopup = document.getElementById('wordPopupModal');
  const closeWordPopup = () => {
    wordPopup.classList.add('hidden');
    wordPopup.classList.remove('flex');
  };
  document.getElementById('closeWordPopupBtn').addEventListener('click', closeWordPopup);
  document.getElementById('confirmWordPopupBtn').addEventListener('click', closeWordPopup);
  wordPopup.addEventListener('click', (e) => {
    if (e.target === wordPopup) closeWordPopup();
  });

  // Grammar & Playlist collapsible accordions
  document.getElementById('toggleGrammarBody').addEventListener('click', () => {
    const grammarContent = document.getElementById('grammarContent');
    const isHidden = grammarContent.classList.toggle('hidden');
    document.getElementById('grammarChevron').textContent = isHidden ? 'expand_more' : 'expand_less';
    document.getElementById('grammarToggleLabel').textContent = isHidden ? '해설 펼치기' : '해설 가리기';
  });

  document.getElementById('togglePlaylistHeader').addEventListener('click', () => {
    const playlistContainer = document.getElementById('playlistContainer');
    const isHidden = playlistContainer.classList.toggle('hidden');
    document.getElementById('playlistChevron').textContent = isHidden ? 'expand_more' : 'expand_less';
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      document.getElementById('transportMainPlay').click();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      document.getElementById('transportPrev').click();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      document.getElementById('transportNext').click();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
