/**
 * ABANDONED BUT NOT FORGOTTEN & RED HORIZON
 * Unified Dual-Story Narration Engine using Web Speech Synthesis API
 * 
 * Features:
 * - Natural Human-sounding voices for both English ('en') and Hindi ('hi')
 * - Complete playback speed selection (0.5x, 0.75x, 1.0x, 1.25x, 1.75x, 2.0x)
 * - Automatic coordination with video voiceover playback (pauses web speech during video sound)
 * - Subtitle event firing during narration
 * - Clean state management and teardown during story/chapter/scene switches
 */

class NarrationEngine {
  constructor(options = {}) {
    this.synth = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
    this.isSupported = !!this.synth;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.autoAdvance = false;
    this.rate = options.rate || 1.0;
    this.pitch = 1.0;
    this.language = options.language || 'en'; // 'en' or 'hi'
    this.englishVoice = null;
    this.hindiVoice = null;
    this.chosenVoiceURI = { en: null, hi: null };
    this.voiceListeners = [];
    this.heartbeatTimer = null;
    this.onStateChange = options.onStateChange || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
    this.onBoundary = options.onBoundary || (() => {});

    if (this.isSupported) {
      this.initVoices();
      if (typeof window !== 'undefined') {
        if (typeof this.synth.addEventListener === 'function') {
          this.synth.addEventListener('voiceschanged', () => this.initVoices());
        } else if (typeof this.synth.onvoiceschanged !== 'undefined') {
          this.synth.onvoiceschanged = () => this.initVoices();
        }
      }
    }
  }

  initVoices() {
    if (!this.isSupported) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. Select Best English Voice
    // Must be a genuine US/UK English voice. Strictly exclude Indian English / Hindi-region voices (e.g. Heera, Ravi)
    const enVoices = voices.filter(v => {
      if (!v.lang || !v.lang.startsWith('en')) return false;
      if (v.lang.includes('IN') || /India|Hindi|Heera|Ravi|Neerja|Prabhat/i.test(v.name)) return false;
      return true;
    });

    const preferredEnglishMatchers = [
      // Top Tier: High-quality natural neural documentary voices (Edge / Windows 11 / Chrome OS)
      v => /Guy.*Natural/i.test(v.name),
      v => /Christopher.*Natural/i.test(v.name),
      v => /Jenny.*Natural/i.test(v.name),
      v => /Aria.*Natural/i.test(v.name),
      v => /Sonia.*Natural/i.test(v.name),
      v => /Eric.*Natural/i.test(v.name),
      v => /Natural/i.test(v.name) && (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')),
      // Tier 2: Premium Chrome native voices
      v => v.name === 'Google US English',
      v => v.name === 'Google UK English Male',
      v => v.name === 'Google UK English Female',
      // Tier 3: Apple / Safari high-quality voices
      v => v.name === 'Daniel',
      v => /Samantha/i.test(v.name) && (/Enhanced/i.test(v.name) || /Premium/i.test(v.name)),
      v => /Samantha/i.test(v.name),
      // Tier 4: Clear desktop voices (David calibrated with pitch 1.10, or Zira)
      v => /David/i.test(v.name),
      v => /Zira/i.test(v.name),
      // Fallback: any genuine en-US or en-GB voice
      v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'),
      v => true
    ];

    let selectedEn = null;
    for (const matcher of preferredEnglishMatchers) {
      selectedEn = enVoices.find(matcher);
      if (selectedEn) break;
    }
    this.englishVoice = selectedEn || enVoices[0] || null;

    // Calibrate pitch for optimal conversational documentary warmth & eliminate bass boom:
    if (this.englishVoice) {
      const vName = this.englishVoice.name.toLowerCase();
      if (vName.includes('david')) {
        this.pitch = 1.10; // Lift David out of muddy low-frequency drone into clear, articulate medium pitch
      } else if (vName.includes('mark') || vName.includes('guy') || vName.includes('christopher') || vName.includes('male')) {
        this.pitch = 1.04; // Natural masculine presence without rumble
      } else {
        this.pitch = 1.02; // Warm, natural presence for neutral / female voices
      }
    } else {
      this.pitch = 1.02;
    }

    // 2. Select Best Hindi Voice (Preserving authentic original Hindi voice)
    const hiVoices = voices.filter(v => {
      if (!v.lang) return false;
      if (v.lang.startsWith('hi')) return true;
      if (v.lang.includes('IN') && (v.name.includes('Hindi') || v.name.includes('हिन्दी') || /Swara|Madhur|Kalpana|Hemant/i.test(v.name))) return true;
      return false;
    });

    const preferredHindiMatchers = [
      v => /Swara.*Natural/i.test(v.name),
      v => /Madhur.*Natural/i.test(v.name),
      v => /Google.*(हिन्दी|Hindi)/i.test(v.name),
      v => /Natural/i.test(v.name) && v.lang.startsWith('hi'),
      v => /Kalpana/i.test(v.name),
      v => /Hemant/i.test(v.name),
      v => v.lang.startsWith('hi'),
      v => true
    ];

    let selectedHi = null;
    for (const matcher of preferredHindiMatchers) {
      selectedHi = hiVoices.find(matcher);
      if (selectedHi) break;
    }
    this.hindiVoice = selectedHi || hiVoices[0] || null;

    this.notifyVoicesChanged();
  }

  scoreVoice(v, lang) {
    let s = 0;
    const n = (v.name || '').toLowerCase();
    if (/natural|neural|premium|enhanced|online/.test(n)) s += 6;
    if (/google/.test(n)) s += 4;
    if (v.localService) s += 1;
    if (lang === 'en') {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      if (l === 'en-in') s += 1;
      else if (l === 'en-gb') s += 3;
      else if (l === 'en-us') s += 3;
    }
    if (v.default) s += 1;
    return s;
  }

  /**
   * Return all available voices for the specified language, sorted with best/neural voices first.
   */
  getVoicesFor(lang) {
    if (!this.isSupported || !this.synth) return [];
    const all = this.synth.getVoices() || [];
    return all.filter(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      if (lang === 'hi') {
        return l.startsWith('hi') || (l.includes('in') && (v.name.includes('Hindi') || v.name.includes('हिन्दी') || /Swara|Madhur|Kalpana|Hemant/i.test(v.name)));
      }
      return l.startsWith('en');
    }).sort((a, b) => this.scoreVoice(b, lang) - this.scoreVoice(a, lang));
  }

  setChosenVoice(lang, uri) {
    const l = (lang === 'hi') ? 'hi' : 'en';
    this.chosenVoiceURI[l] = uri || null;
  }

  getChosenVoice(lang) {
    const l = (lang === 'hi') ? 'hi' : 'en';
    const uri = this.chosenVoiceURI[l];
    if (!uri || !this.isSupported || !this.synth) return null;
    const list = this.synth.getVoices() || [];
    return list.find(v => v.voiceURI === uri) || null;
  }

  onVoices(fn) {
    if (typeof fn === 'function') {
      this.voiceListeners.push(fn);
    }
  }

  notifyVoicesChanged() {
    this.voiceListeners.forEach(fn => {
      try { fn(); } catch (e) { console.warn(e); }
    });
  }

  /**
   * Prepares text for natural human-like spoken delivery.
   * Converts abrupt punctuation to breathing pauses, strips bracketed artifacts,
   * and expands technical units for clear vocal pronunciation.
   */
  prepareSpokenText(text, lang) {
    if (!text) return '';
    // Preserve Hindi text completely as requested
    if (lang === 'hi') return text.trim();

    let spoken = text.trim();

    // 1. Strip surrounding quotation marks so speech engine doesn't stutter
    spoken = spoken.replace(/^["'“](.*)["'”]$/, '$1');

    // 2. Convert em-dashes and hyphens into natural respiratory pauses
    spoken = spoken.replace(/\s*[—–]\s*/g, ', ');
    spoken = spoken.replace(/\s+-\s+/g, ', ');

    // 3. Convert ellipses into natural dramatic pauses
    spoken = spoken.replace(/\.{3,}/g, ', ');

    // 4. Strip any bracketed production tags or references
    spoken = spoken.replace(/\[.*?\]/g, '');

    // 5. Expand scientific units into full conversational words
    spoken = spoken.replace(/\bkm\/s\b/gi, 'kilometers per second');
    spoken = spoken.replace(/\bkm\/h\b/gi, 'kilometers per hour');
    spoken = spoken.replace(/\bm\/s\b/gi, 'meters per second');
    spoken = spoken.replace(/\bkm\b/gi, 'kilometers');
    spoken = spoken.replace(/\bdeg C\b/gi, 'degrees Celsius');
    spoken = spoken.replace(/\bdeg F\b/gi, 'degrees Fahrenheit');

    // 6. Clean redundant whitespace
    spoken = spoken.replace(/\s+/g, ' ').trim();

    return spoken;
  }

  setLanguage(lang) {
    if (this.language === lang) return;
    const wasPlaying = this.isPlaying && !this.isPaused;
    this.stop();
    this.language = (lang === 'hi') ? 'hi' : 'en';
    this.notifyState(false, false);
    return wasPlaying;
  }

  setRate(newRate) {
    const validRates = [0.5, 0.75, 1.0, 1.25, 1.75, 2.0];
    const parsed = parseFloat(newRate);
    if (!isNaN(parsed)) {
      this.rate = Math.max(0.5, Math.min(2.0, parsed));
    }
  }

  setAutoAdvance(enabled) {
    this.autoAdvance = !!enabled;
  }

  /**
   * Speak a passage of text in the active language
   */
  speak(text, onFinishedCallback) {
    this.stop();

    if (!this.isSupported) {
      console.warn("Speech Synthesis is not supported in this browser.");
      this.notifyState(false, false);
      if (onFinishedCallback) onFinishedCallback();
      return false;
    }

    if (!text || text.trim() === '') {
      if (onFinishedCallback) onFinishedCallback();
      return false;
    }

    const spokenText = this.prepareSpokenText(text, this.language);
    const utterance = new SpeechSynthesisUtterance(spokenText);

    const chosenVoice = this.getChosenVoice(this.language);

    if (this.language === 'hi') {
      utterance.lang = 'hi-IN';
      const v = chosenVoice || this.hindiVoice;
      if (v) {
        utterance.voice = v;
        if (v.lang) utterance.lang = v.lang;
      }
      utterance.pitch = 1.0;
      utterance.rate = this.rate;
    } else {
      utterance.lang = 'en-US';
      const v = chosenVoice || this.englishVoice;
      if (v) {
        utterance.voice = v;
        if (v.lang) utterance.lang = v.lang;
      }
      if (v && v.name && v.name.toLowerCase().includes('david')) {
        utterance.pitch = 1.10;
      } else if (v && v.name && /mark|guy|christopher|male/i.test(v.name)) {
        utterance.pitch = 1.04;
      } else {
        utterance.pitch = this.pitch || 1.02;
      }
      // Slight rate refinement (0.97) for warm, deliberate documentary storytelling
      utterance.rate = Math.max(0.5, Math.min(2.0, this.rate * 0.97));
    }

    this.currentUtterance = utterance;
    this.isPlaying = true;
    this.isPaused = false;
    this.notifyState(true, false);

    // Keep-alive heartbeat for long sentences in Chromium browsers
    this.startHeartbeat();

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.notifyState(true, false);
    };

    utterance.onend = () => {
      this.stopHeartbeat();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyState(false, false);
      if (onFinishedCallback) onFinishedCallback();
      this.onComplete();
    };

    utterance.onerror = (event) => {
      this.stopHeartbeat();
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.warn("Speech Synthesis Notice:", event.error);
        this.onError(event.error);
      }
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyState(false, false);
    };

    utterance.onpause = () => {
      this.isPaused = true;
      this.notifyState(true, true);
    };

    utterance.onresume = () => {
      this.isPaused = false;
      this.notifyState(true, false);
    };

    try {
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      this.stopHeartbeat();
      console.warn("Failed to execute synth.speak:", err);
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyState(false, false);
      return false;
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    if (!this.synth) return;
    this.heartbeatTimer = setInterval(() => {
      if (this.isPlaying && !this.isPaused && this.synth) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 10000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  pause() {
    if (this.isSupported && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState(true, true);
    }
  }

  resume() {
    if (this.isSupported && this.isPlaying && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyState(true, false);
    }
  }

  stop() {
    this.stopHeartbeat();
    if (this.currentUtterance) {
      // Detach listeners before cancelling so cancelled utterances NEVER fire callbacks!
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance.onstart = null;
      this.currentUtterance.onpause = null;
      this.currentUtterance.onresume = null;
      this.currentUtterance = null;
    }
    if (this.isSupported && this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        // Safe catch
      }
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.notifyState(false, false);
  }

  togglePlayPause(textToSpeak, onFinishedCallback) {
    if (this.isPlaying) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    } else {
      this.speak(textToSpeak, onFinishedCallback);
    }
  }

  notifyState(isPlaying, isPaused) {
    this.onStateChange({
      isPlaying,
      isPaused,
      isSupported: this.isSupported,
      rate: this.rate,
      language: this.language,
      autoAdvance: this.autoAdvance
    });
  }
}

// Export for module systems or attach to window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NarrationEngine;
} else {
  window.NarrationEngine = NarrationEngine;
}
