// Audio player module: Local MP3 file playback and shadowing loop with requestAnimationFrame.
import { WakeLock } from './wake-lock.js';

export const AudioPlayer = {
  isPlaying: false,
  isPaused: false,
  currentPhase: 'idle', // 'idle' | 'listening' | 'speaking'
  currentSentence: null,
  speed: 1.0,
  waitMultiplier: 1.3,
  repeatCount: 2,
  currentIteration: 0,
  speechDuration: 0,
  audio: null,
  rafId: null,
  timerId: null,
  listeningStartWallTime: 0,
  listeningEstimatedDuration: 0,
  speakingStartTime: 0,
  speakingTotalDuration: 0,
  speakingElapsedBeforePause: 0,
  callbacks: {
    onPhaseChange: () => {},
    onProgress: () => {},
    onSentenceComplete: () => {}
  },

  getAudioUrl(sentence, lang = 'es', voice = 'female') {
    if (!sentence) return '';
    if (typeof sentence.audioUrl === 'string') {
      const raw = sentence.audioUrl.startsWith('/') ? sentence.audioUrl.slice(1) : sentence.audioUrl;
      return raw.startsWith('./') ? raw : `./${raw}`;
    }
    if (sentence.audioUrl && sentence.audioUrl[voice]) {
      const raw = sentence.audioUrl[voice];
      const clean = raw.startsWith('/') ? raw.slice(1) : raw;
      return clean.startsWith('./') ? clean : `./${clean}`;
    }
    return `./audio/${lang}/${voice}/${sentence.id}.mp3`;
  },

  setCallbacks(cb) {
    this.callbacks = { ...this.callbacks, ...cb };
  },

  setSpeed(speed) {
    this.speed = speed;
    if (this.audio) {
      this.audio.playbackRate = this.speed;
    }
  },

  setWaitMultiplier(mult) {
    this.waitMultiplier = mult;
  },

  setRepeatCount(count) {
    this.repeatCount = count;
  },

  start(sentence) {
    this.stop();
    this.currentSentence = sentence;
    this.currentIteration = 1;
    this.isPlaying = true;
    this.isPaused = false;
    WakeLock.request();
    this.playListeningPhase();
  },

  playListeningPhase() {
    if (!this.isPlaying || this.isPaused || !this.currentSentence) return;

    this.currentPhase = 'listening';
    this.cancelAnimation();

    this.callbacks.onPhaseChange('listening', {
      iteration: this.currentIteration,
      totalIterations: this.repeatCount
    });

    const src = this.getAudioUrl(this.currentSentence);
    if (!this.audio) {
      this.audio = new Audio();
    } else {
      this.audio.pause();
    }

    this.audio.src = src;
    this.audio.playbackRate = this.speed;

    const charCount = this.currentSentence.es.length;
    this.listeningEstimatedDuration = Math.max(1.2, (charCount * 0.08) / this.speed);

    this.audio.onloadedmetadata = () => {
      if (this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
        this.speechDuration = this.audio.duration;
      }
    };

    this.audio.onended = () => {
      this.cancelAnimation();
      this.speechDuration = (this.audio && this.audio.duration && !isNaN(this.audio.duration))
        ? this.audio.duration
        : this.listeningEstimatedDuration;
      this.callbacks.onProgress('listening', 1.0, 0);
      this.playSpeakingPhase();
    };

    this.audio.onerror = () => {
      // Smooth fallback animation if local MP3 is not yet created
      this.cancelAnimation();
      const fallbackDuration = this.listeningEstimatedDuration;
      this.speechDuration = fallbackDuration;
      const startMs = performance.now();

      const step = (now) => {
        if (!this.isPlaying || this.isPaused || this.currentPhase !== 'listening') return;
        const elapsed = (now - startMs) / 1000;
        const progress = Math.min(1.0, elapsed / fallbackDuration);
        this.callbacks.onProgress('listening', progress, 0);

        if (elapsed < fallbackDuration) {
          this.rafId = requestAnimationFrame(step);
        } else {
          this.callbacks.onProgress('listening', 1.0, 0);
          this.playSpeakingPhase();
        }
      };

      this.rafId = requestAnimationFrame(step);
    };

    this.audio.play();
    this.startListeningAnimation();
  },

  startListeningAnimation() {
    this.cancelAnimation();

    const loop = () => {
      if (!this.isPlaying || this.isPaused || this.currentPhase !== 'listening') return;

      let progress = 0;
      if (this.audio && this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0) {
        progress = Math.min(1.0, this.audio.currentTime / this.audio.duration);
      }
      this.callbacks.onProgress('listening', progress, 0);
      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  },

  playSpeakingPhase() {
    if (!this.isPlaying || this.isPaused) return;

    this.currentPhase = 'speaking';
    this.cancelAnimation();

    const duration = this.speechDuration || this.listeningEstimatedDuration || 1.5;
    this.speakingTotalDuration = duration * this.waitMultiplier;
    this.speakingElapsedBeforePause = 0;
    this.speakingStartTime = performance.now();

    this.callbacks.onPhaseChange('speaking', {
      iteration: this.currentIteration,
      totalIterations: this.repeatCount,
      waitDuration: this.speakingTotalDuration
    });

    this.startSpeakingAnimation();
  },

  startSpeakingAnimation() {
    this.cancelAnimation();
    this.speakingStartTime = performance.now();

    const loop = (now) => {
      if (!this.isPlaying || this.isPaused || this.currentPhase !== 'speaking') return;

      const elapsedSinceResume = (now - this.speakingStartTime) / 1000;
      const totalElapsed = this.speakingElapsedBeforePause + elapsedSinceResume;
      const progress = Math.min(1.0, Math.max(0, totalElapsed / this.speakingTotalDuration));
      const remaining = Math.max(0, this.speakingTotalDuration - totalElapsed);

      this.callbacks.onProgress('speaking', progress, remaining);

      if (totalElapsed < this.speakingTotalDuration) {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.callbacks.onProgress('speaking', 1.0, 0);

        if (this.repeatCount === 0 || this.currentIteration < this.repeatCount) {
          this.currentIteration += 1;
          this.playListeningPhase();
        } else {
          this.callbacks.onSentenceComplete(this.currentSentence);
        }
      }
    };

    this.rafId = requestAnimationFrame(loop);
  },

  togglePause() {
    if (!this.isPlaying) return;

    if (this.isPaused) {
      this.isPaused = false;
      WakeLock.request();
      if (this.currentPhase === 'listening') {
        if (this.audio && this.audio.src) {
          this.audio.play();
          this.startListeningAnimation();
        } else {
          this.playListeningPhase();
        }
      } else if (this.currentPhase === 'speaking') {
        this.startSpeakingAnimation();
      }
    } else {
      this.isPaused = true;
      WakeLock.release();
      if (this.currentPhase === 'listening' && this.audio) {
        this.audio.pause();
      } else if (this.currentPhase === 'speaking') {
        const elapsedSinceResume = (performance.now() - this.speakingStartTime) / 1000;
        this.speakingElapsedBeforePause += elapsedSinceResume;
      }
      this.cancelAnimation();
    }
  },

  cancelAnimation() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  },

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentPhase = 'idle';
    this.speakingElapsedBeforePause = 0;
    WakeLock.release();

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.onloadedmetadata = null;
      this.audio.onended = null;
      this.audio.onerror = null;
    }

    this.cancelAnimation();
    this.callbacks.onPhaseChange('idle', { iteration: 0, totalIterations: this.repeatCount });
  }
};

WakeLock.bindVisibility(() => AudioPlayer.isPlaying && !AudioPlayer.isPaused);

