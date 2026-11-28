// Screen Wake Lock controller: keeps display awake during active shadowing playback
let sentinel = null;

export const WakeLock = {
  async request() {
    if (!('wakeLock' in navigator)) return;
    if (document.visibilityState !== 'visible') return;
    if (sentinel !== null) return;
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => {
      sentinel = null;
    });
  },

  async release() {
    if (sentinel) {
      await sentinel.release();
      sentinel = null;
    }
  },

  bindVisibility(isPlaybackActive) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isPlaybackActive()) {
        this.request();
      } else if (document.visibilityState === 'hidden') {
        this.release();
      }
    });
  }
};
