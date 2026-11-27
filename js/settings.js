// Settings view management module: Synchronizes study options, theme, and real progress metrics.
import { Storage } from './storage.js';

let appCallbacks = {
  onSettingChange: () => {},
  onClearCompleted: () => {}
};

function getEffectiveTheme(themeSetting, nightAutoDark) {
  if (nightAutoDark) {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 6) return 'dark';
  }
  if (themeSetting === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return themeSetting;
}

export const SettingsView = {
  viewElement: null,

  init(callbacks) {
    appCallbacks = { ...appCallbacks, ...callbacks };
    this.viewElement = document.getElementById('settingsView');
    this.bindEvents();
  },

  open(state, totalSentences) {
    this.updateStats(totalSentences, state.currentLevel);
    this.renderOptions(state.settings);
    this.viewElement.classList.remove('hidden');
    window.scrollTo(0, 0);
  },

  close() {
    this.viewElement.classList.add('hidden');
  },

  updateStats(totalSentences = 440, currentLevel = 'all') {
    const completed = Storage.getCompleted();
    const bookmarks = Storage.getBookmarks();
    const profile = Storage.getProfile();
    const completedCount = completed.length;
    const bookmarkCount = bookmarks.length;
    const pct = totalSentences > 0 ? Math.round((completedCount / totalSentences) * 100) : 0;

    const nameElem = document.getElementById('settingsProfileName');
    if (nameElem) nameElem.textContent = profile.name;

    const initialsElem = document.getElementById('settingsAvatarInitials');
    const photoElem = document.getElementById('settingsAvatarPhoto');
    if (initialsElem && photoElem) {
      if (profile.photo) {
        photoElem.src = profile.photo;
        photoElem.classList.remove('hidden');
        initialsElem.classList.add('hidden');
      } else {
        initialsElem.textContent = profile.initials;
        initialsElem.classList.remove('hidden');
        photoElem.classList.add('hidden');
      }
    }

    const completedElem = document.getElementById('settingsCompletedCount');
    if (completedElem) completedElem.textContent = `${completedCount} / ${totalSentences}문장 (${pct}%)`;

    const summaryElem = document.getElementById('settingsProfileSummary');
    if (summaryElem) summaryElem.textContent = `${completedCount}문장 완료 · ${bookmarkCount}문장 즐겨찾기`;

    const levelBadge = document.getElementById('settingsLevelBadge');
    if (levelBadge) {
      const levelNames = {
        all: '전체 레벨 도전 중',
        a1: 'A1 기초 레벨 도전 중',
        a2: 'A2 초급 레벨 도전 중',
        b1: 'B1 중급 레벨 도전 중',
        b2: 'B2 고급 레벨 도전 중'
      };
      levelBadge.textContent = levelNames[currentLevel] || '섀도잉 진행 중';
    }

    const progressElem = document.getElementById('settingsProgressBar');
    if (progressElem) progressElem.style.width = `${pct}%`;
  },

  renderOptions(settings) {
    // 1. Repeat Count Options (1, 2, 3, 5, 10, 0)
    document.querySelectorAll('.settings-repeat-btn').forEach((btn) => {
      const val = parseInt(btn.dataset.repeat, 10);
      const isActive = val === settings.repeatCount;
      btn.className = `settings-repeat-btn py-2 text-center rounded-lg text-[13px] transition-colors ${
        isActive
          ? 'bg-primary text-on-primary font-bold shadow-sm'
          : 'bg-surface-container-low dark:bg-[#2b241f] text-on-surface-variant hover:text-on-surface font-medium'
      }`;
    });

    // 2. Speech Wait Multiplier (1.0, 1.3, 1.5, 2.0)
    document.querySelectorAll('.settings-wait-btn').forEach((btn) => {
      const val = parseFloat(btn.dataset.wait);
      const isActive = Math.abs(val - settings.waitMultiplier) < 0.05;
      btn.className = `settings-wait-btn py-2 text-center rounded-lg text-[13px] transition-colors ${
        isActive
          ? 'bg-primary text-on-primary font-bold shadow-sm'
          : 'bg-surface-container-low dark:bg-[#2b241f] text-on-surface-variant hover:text-on-surface font-medium'
      }`;
    });

    // 3. Audio Speed (0.8, 1.0, 1.2, 1.5, 2.0) - both quick header row & detailed section
    document.querySelectorAll('.settings-speed-btn').forEach((btn) => {
      const val = parseFloat(btn.dataset.speed);
      const isActive = Math.abs(val - settings.speed) < 0.05;
      btn.className = `settings-speed-btn py-2 text-center rounded-lg text-[13px] transition-colors ${
        isActive
          ? 'bg-primary text-on-primary font-bold shadow-sm'
          : 'bg-surface-container-low dark:bg-[#2b241f] text-on-surface-variant hover:text-on-surface font-medium'
      }`;
    });

    // 4. Auto Advance Checkbox
    const autoAdvanceInput = document.getElementById('settingAutoAdvance');
    if (autoAdvanceInput) autoAdvanceInput.checked = Boolean(settings.autoAdvance);

    // 5. Default Text Exposure ('all', 'hide_es', 'hide_ko')
    document.querySelectorAll('.settings-exposure-btn').forEach((btn) => {
      const val = btn.dataset.exposure;
      const isActive = val === settings.defaultTextExposure;
      btn.className = `settings-exposure-btn py-2 text-center rounded-lg text-[13px] transition-colors ${
        isActive
          ? 'bg-primary text-on-primary font-bold shadow-sm'
          : 'bg-surface-container-low dark:bg-[#2b241f] text-on-surface-variant hover:text-on-surface font-medium'
      }`;
    });

    // 6. Auto Expand Verbs Checkbox
    const autoExpandInput = document.getElementById('settingAutoExpandVerbs');
    if (autoExpandInput) autoExpandInput.checked = Boolean(settings.autoExpandVerbs);

    // 7. Theme Buttons ('light', 'dark', 'system')
    document.querySelectorAll('.settings-theme-card').forEach((btn) => {
      const val = btn.dataset.theme;
      const isActive = val === settings.theme;
      if (isActive) {
        btn.classList.add('border-2', 'border-primary', 'bg-surface-container-low');
        btn.classList.remove('border', 'border-[#e6dfd3]', 'dark:border-[#3d342d]');
        btn.querySelector('.theme-check-icon')?.classList.remove('hidden');
      } else {
        btn.classList.remove('border-2', 'border-primary', 'bg-surface-container-low');
        btn.classList.add('border', 'border-[#e6dfd3]', 'dark:border-[#3d342d]');
        btn.querySelector('.theme-check-icon')?.classList.add('hidden');
      }
    });

    // 8. Night Auto Dark Mode Toggle
    const nightAutoDarkInput = document.getElementById('settingNightAutoDark');
    if (nightAutoDarkInput) nightAutoDarkInput.checked = Boolean(settings.nightAutoDark);
  },

  bindEvents() {
    // Close button
    document.getElementById('closeSettingsViewBtn').addEventListener('click', () => {
      this.close();
    });

    // Repeat count clicks
    document.querySelectorAll('.settings-repeat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const repeatCount = parseInt(btn.dataset.repeat, 10);
        appCallbacks.onSettingChange({ repeatCount });
      });
    });

    // Wait multiplier clicks
    document.querySelectorAll('.settings-wait-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const waitMultiplier = parseFloat(btn.dataset.wait);
        appCallbacks.onSettingChange({ waitMultiplier });
      });
    });

    // Audio speed clicks (handles both quick bar and detailed list)
    document.querySelectorAll('.settings-speed-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        appCallbacks.onSettingChange({ speed });
      });
    });

    // Auto advance toggle
    document.getElementById('settingAutoAdvance').addEventListener('change', (e) => {
      appCallbacks.onSettingChange({ autoAdvance: e.target.checked });
    });

    // Default text exposure clicks
    document.querySelectorAll('.settings-exposure-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const defaultTextExposure = btn.dataset.exposure;
        appCallbacks.onSettingChange({ defaultTextExposure });
      });
    });

    // Auto expand verbs toggle
    document.getElementById('settingAutoExpandVerbs').addEventListener('change', (e) => {
      appCallbacks.onSettingChange({ autoExpandVerbs: e.target.checked });
    });

    // Theme card clicks
    document.querySelectorAll('.settings-theme-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        appCallbacks.onSettingChange({ theme });
      });
    });

    // Night auto dark toggle
    document.getElementById('settingNightAutoDark').addEventListener('change', (e) => {
      appCallbacks.onSettingChange({ nightAutoDark: e.target.checked });
    });

    // Clear completed progress
    document.getElementById('clearProgressBtn').addEventListener('click', () => {
      Storage.clearCompleted();
      this.updateStats();
      appCallbacks.onClearCompleted();
    });

    // Profile Edit Modal bindings
    const profileModal = document.getElementById('profileEditModal');
    const nameInput = document.getElementById('profileNameInput');
    const nameCount = document.getElementById('profileNameCount');
    const avatarPreview = document.getElementById('modalAvatarPreview');
    const avatarPhoto = document.getElementById('modalAvatarPhoto');
    const photoInput = document.getElementById('profilePhotoInput');
    const deletePhotoBtn = document.getElementById('deletePhotoBtn');
    const deletePhotoDivider = document.getElementById('deletePhotoDivider');

    let currentPhotoData = null;

    const updatePreview = () => {
      const val = nameInput.value.trim();
      const len = nameInput.value.length;
      nameCount.textContent = `${len} / 12`;
      avatarPreview.textContent = val.length >= 2 ? val.substring(0, 2) : (val || '학습');

      if (currentPhotoData) {
        avatarPhoto.src = currentPhotoData;
        avatarPhoto.classList.remove('hidden');
        avatarPreview.classList.add('hidden');
        deletePhotoBtn.classList.remove('hidden');
        deletePhotoDivider.classList.remove('hidden');
      } else {
        avatarPhoto.classList.add('hidden');
        avatarPreview.classList.remove('hidden');
        deletePhotoBtn.classList.add('hidden');
        deletePhotoDivider.classList.add('hidden');
      }
    };

    const openProfileModal = () => {
      const profile = Storage.getProfile();
      nameInput.value = profile.name;
      currentPhotoData = profile.photo || null;
      updatePreview();
      profileModal.classList.remove('hidden');
      profileModal.classList.add('flex');
      nameInput.focus();
    };

    const closeProfileModal = () => {
      profileModal.classList.add('hidden');
      profileModal.classList.remove('flex');
    };

    const triggerPhotoSelect = () => {
      photoInput.click();
    };

    document.getElementById('openProfileEditBtn').addEventListener('click', openProfileModal);
    document.getElementById('openProfileEditAvatarBtn').addEventListener('click', openProfileModal);
    document.getElementById('closeProfileModalBtn').addEventListener('click', closeProfileModal);
    document.getElementById('cancelProfileBtn').addEventListener('click', closeProfileModal);

    document.getElementById('triggerPhotoBtn').addEventListener('click', triggerPhotoSelect);
    document.getElementById('selectPhotoTextBtn').addEventListener('click', triggerPhotoSelect);
    document.getElementById('modalAvatarContainer').addEventListener('click', triggerPhotoSelect);

    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        currentPhotoData = event.target.result;
        updatePreview();
      };
      reader.readAsDataURL(file);
      photoInput.value = '';
    });

    deletePhotoBtn.addEventListener('click', () => {
      currentPhotoData = null;
      updatePreview();
    });

    nameInput.addEventListener('input', updatePreview);

    document.getElementById('clearProfileNameBtn').addEventListener('click', () => {
      nameInput.value = '';
      updatePreview();
      nameInput.focus();
    });

    document.getElementById('saveProfileBtn').addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) return;
      const initials = name.length >= 2 ? name.substring(0, 2) : name;
      Storage.saveProfile({
        name,
        initials,
        photo: currentPhotoData
      });
      this.updateStats();
      if (appCallbacks.onProfileChange) {
        appCallbacks.onProfileChange(Storage.getProfile());
      }
      closeProfileModal();
    });

    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        closeProfileModal();
      }
    });
  }
};

export { getEffectiveTheme };
