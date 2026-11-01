/**
 * RED HORIZON & ABANDONED BUT NOT FORGOTTEN
 * Unified Dual-Story Space Exploration Interactive Engine
 * Application Controller (v2.0.0)
 */

(function () {
  'use strict';

  // Application State
  const state = {
    activeStoryId: 'mars', // Default story is Mars per Master Directive
    isGatewayOpen: true,   // Mars-First opening gateway
    language: 'en',        // 'en' or 'hi'
    playbackMode: 'auto',  // 'auto' (default continuous flow) or 'manual'
    narrationRate: 1.0,    // 0.5, 0.75, 1.0, 1.25, 1.75, 2.0
    subtitlesEnabled: true,
    videoAudioMuted: false,
    hotspotsVisible: true,
    immersiveMode: false,
    autoNarration: true,
    textSize: 'medium',
    subtitleSize: 'medium', // 'small' | 'medium' (default) | 'large' | 'xlarge'
    highContrast: false,
    chosenVoices: {
      en: '',
      hi: ''
    },

    // Independent reading progress for both stories
    mars: {
      chapterId: 1,
      sceneId: 1,
      passageIndex: 0
    },
    moon: {
      chapterId: 1,
      sceneId: 1,
      passageIndex: 0
    }
  };

  const STORAGE_KEY = 'unified_space_storybook_state_v2';

  // Instantiate Narration Engine & Timers
  let narration = null;
  let autoAdvanceTimer = null;
  let autoAdvanceFallbackTimer = null;
  let playbackToken = 0;
  // Narration-over-video coordination for clips that have no voice of their own (see data/video_audio_classification.json).
  let overlayGate = null;
  let videoAdvancementHandled = false; // one-shot guard for the current clip's ended/error handling (re-armed on resume)
  let overlayCapTimer = null;

  // DOM Elements Cache
  const dom = {};

  function initDOMElements() {
    dom.body = document.body;

    // Gateway (First Screen)
    dom.gateway = document.getElementById('story-gateway');
    dom.btnGatewayMars = document.getElementById('btn-gateway-mars');
    dom.btnGatewayMoon = document.getElementById('btn-gateway-moon');
    dom.btnOpenGateway = document.getElementById('btn-open-gateway');
    dom.btnBegin = document.getElementById('btn-begin');
    dom.beginNote = document.getElementById('begin-note');
    dom.gwLangEn = document.getElementById('gw-lang-en');
    dom.gwLangHi = document.getElementById('gw-lang-hi');
    dom.gwModeAuto = document.getElementById('gw-mode-auto');
    dom.gwModeManual = document.getElementById('gw-mode-manual');
    dom.modeHint = document.getElementById('mode-hint');
    dom.btnCreditsGw = document.getElementById('btn-credits-gw');
    dom.gwEyebrow = document.getElementById('gw-eyebrow');
    dom.gwTitle = document.getElementById('gw-title');
    dom.gwSubtitle = document.getElementById('gw-subtitle');
    dom.gwIntro = document.getElementById('gw-intro');
    dom.lblLang = document.getElementById('lbl-lang');
    dom.lblMode = document.getElementById('lbl-mode');
    dom.marsKicker = document.getElementById('mars-kicker');
    dom.marsTitle = document.getElementById('mars-title');
    dom.marsDesc = document.getElementById('mars-desc');
    dom.moonKicker = document.getElementById('moon-kicker');
    dom.moonTitle = document.getElementById('moon-title');
    dom.moonDesc = document.getElementById('moon-desc');

    // Header & Story / Language Switchers
    dom.header = document.getElementById('main-header');
    dom.headerStoryTitle = document.getElementById('header-story-title');
    dom.headerStorySubtitle = document.getElementById('header-story-subtitle');
    dom.btnStoryMars = document.getElementById('btn-story-mars');
    dom.btnStoryMoon = document.getElementById('btn-story-moon');
    dom.btnLangEn = document.getElementById('btn-lang-en');
    dom.btnLangHi = document.getElementById('btn-lang-hi');

    // Playback Mode Switcher (Auto / Manual)
    dom.btnModeAuto = document.getElementById('btn-mode-auto');
    dom.btnModeManual = document.getElementById('btn-mode-manual');
    dom.modeSwitcherControl = document.getElementById('mode-switcher-control');

    // Badges
    dom.chapterBadge = document.getElementById('header-chapter-badge');
    dom.sceneBadge = document.getElementById('header-scene-badge');

    // Viewport & Media
    dom.stageContainer = document.getElementById('stage-container');
    dom.viewport = document.getElementById('illustration-viewport');
    dom.illustrationImg = document.getElementById('current-illustration');
    dom.illustrationVideo = document.getElementById('current-video');
    dom.imageFallback = document.getElementById('image-fallback');
    dom.fallbackTitle = document.getElementById('fallback-title');
    dom.fallbackDesc = document.getElementById('fallback-desc');
    dom.viewportImageDesc = document.getElementById('viewport-image-desc');
    dom.videoAudioBadge = document.getElementById('video-audio-badge');
    dom.videoAudioText = document.getElementById('video-audio-text');
    dom.viewportSubtitlesContainer = document.getElementById('viewport-subtitles-container');
    dom.viewportSubtitles = document.getElementById('viewport-subtitles');
    dom.hotspotsLayer = document.getElementById('hotspots-layer');
    dom.viewportHotspotsCount = document.getElementById('viewport-hotspots-count');
    dom.hotspotsHintBtn = document.getElementById('hotspots-hint-btn');

    // Dialogue HUD
    dom.dialogueHud = document.getElementById('dialogue-hud');
    dom.speakerAvatar = document.getElementById('speaker-avatar');
    dom.speakerName = document.getElementById('speaker-name');
    dom.speakerRole = document.getElementById('speaker-role');
    dom.passageCounter = document.getElementById('passage-counter');
    dom.dialogueQuote = document.getElementById('dialogue-quote');

    // Navigation Controls
    dom.btnPrevScene = document.getElementById('btn-prev-scene');
    dom.btnNextScene = document.getElementById('btn-next-scene');
    dom.btnPrevPassage = document.getElementById('btn-prev-passage');
    dom.btnNextPassage = document.getElementById('btn-next-passage');
    dom.btnNarration = document.getElementById('btn-narration');
    dom.narrationLabel = document.getElementById('narration-btn-label');
    dom.narrationWave = document.getElementById('narration-wave');
    dom.rateSelect = document.getElementById('rate-select');
    dom.btnToggleSubtitles = document.getElementById('btn-toggle-subtitles');

    // Top action buttons
    dom.btnToggleHotspots = document.getElementById('btn-toggle-hotspots');
    dom.btnChapterMenu = document.getElementById('btn-chapter-menu');
    dom.centerIndicator = document.querySelector('.center-indicator');
    if (dom.centerIndicator) {
      dom.centerIndicator.setAttribute('role', 'button');
      dom.centerIndicator.setAttribute('tabindex', '0');
      dom.centerIndicator.setAttribute('title', 'Chapters & Timeline Map (Click to open)');
    }
    dom.btnToggleImmersive = document.getElementById('btn-toggle-immersive');
    dom.btnSettings = document.getElementById('btn-settings');
    dom.immersiveExitBtn = document.getElementById('immersive-exit-btn');

    // Modals
    dom.dossierModal = document.getElementById('dossier-modal');
    dom.dossierTitle = document.getElementById('dossier-title');
    dom.dossierBadge = document.getElementById('dossier-badge');
    dom.dossierCategory = document.getElementById('dossier-category');
    dom.dossierWhat = document.getElementById('dossier-what');
    dom.dossierPurpose = document.getElementById('dossier-purpose');
    dom.dossierHow = document.getElementById('dossier-how');
    dom.dossierWhy = document.getElementById('dossier-why');
    dom.btnCloseDossier = document.getElementById('btn-close-dossier');

    dom.chapterModal = document.getElementById('chapter-modal');
    dom.chapterModalStoryTag = document.getElementById('chapter-modal-story-tag');
    dom.chapterList = document.getElementById('chapter-list');
    dom.btnCloseChapterModal = document.getElementById('btn-close-chapter-modal');
    dom.btnModalSwitchStory = document.getElementById('btn-modal-switch-story');

    dom.settingsModal = document.getElementById('settings-modal');
    dom.btnCloseSettings = document.getElementById('btn-close-settings');
    dom.settingsLangEn = document.getElementById('settings-lang-en');
    dom.settingsLangHi = document.getElementById('settings-lang-hi');
    dom.toggleAutoNarrate = document.getElementById('toggle-auto-narrate');
    dom.toggleContrast = document.getElementById('toggle-contrast');
    dom.toggleHotspotsSetting = document.getElementById('toggle-hotspots-setting');
    dom.textSizeSelect = document.getElementById('text-size-select');
    dom.subtitleSizeSelect = document.getElementById('subtitle-size-select');
    dom.btnResetStory = document.getElementById('btn-reset-story');

    // Voice Pack & Settings Additions
    dom.voiceSelect = document.getElementById('voice-select');
    dom.voiceHint = document.getElementById('voice-hint');
    dom.sVoiceTitle = document.getElementById('s-voice-title');
    dom.sVoiceDesc = document.getElementById('s-voice-desc');
    dom.btnCreditsSet = document.getElementById('btn-credits-set');

    // Credits Modal
    dom.creditsModal = document.getElementById('credits-modal');
    dom.btnCloseCredits = document.getElementById('btn-close-credits');
    dom.creditsBody = document.getElementById('credits-body');
    dom.btnAbout = document.getElementById('btn-about');
    dom.btnFooterCloseCredits = document.getElementById('btn-footer-close-credits');
    dom.btnEndingCredits = document.getElementById('btn-ending-credits');

    // Ending Screen
    dom.endingScreen = document.getElementById('ending-screen');
    dom.endingBadge = document.getElementById('ending-badge');
    dom.endingTitle = document.getElementById('ending-title');
    dom.endingSubtitle = document.getElementById('ending-subtitle');
    dom.btnReplayFinal = document.getElementById('btn-replay-final');
    dom.btnEndingSwitchStory = document.getElementById('btn-ending-switch-story');
    dom.btnRestartFromEnding = document.getElementById('btn-restart-from-ending');
  }

  /**
   * Load saved progress from LocalStorage
   */
  function loadSavedProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeStoryId) state.activeStoryId = parsed.activeStoryId;
        if (typeof parsed.isGatewayOpen === 'boolean') state.isGatewayOpen = parsed.isGatewayOpen;
        if (parsed.language) state.language = parsed.language;
        if (parsed.playbackMode) state.playbackMode = parsed.playbackMode;
        if (parsed.narrationRate) state.narrationRate = parsed.narrationRate;
        if (typeof parsed.subtitlesEnabled === 'boolean') state.subtitlesEnabled = parsed.subtitlesEnabled;
        if (typeof parsed.hotspotsVisible === 'boolean') state.hotspotsVisible = parsed.hotspotsVisible;
        if (typeof parsed.autoNarration === 'boolean') state.autoNarration = parsed.autoNarration;
        if (parsed.textSize) state.textSize = parsed.textSize;
        if (['small', 'medium', 'large', 'xlarge'].includes(parsed.subtitleSize)) state.subtitleSize = parsed.subtitleSize;
        if (typeof parsed.highContrast === 'boolean') state.highContrast = parsed.highContrast;
        if (parsed.chosenVoices) Object.assign(state.chosenVoices, parsed.chosenVoices);
        if (parsed.mars) Object.assign(state.mars, parsed.mars);
        if (parsed.moon) Object.assign(state.moon, parsed.moon);
      }
    } catch (e) {
      console.warn('Could not read saved progress from localStorage:', e);
    }
  }

  /**
   * Save current reading progress to LocalStorage
   */
  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e);
    }
  }

  /**
   * Data accessors for active story
   */
  function getActiveStoryData() {
    if (state.activeStoryId === 'mars' && typeof MARS_STORY_DATA !== 'undefined') {
      return MARS_STORY_DATA;
    }
    if (typeof MOON_STORY_DATA !== 'undefined') {
      return MOON_STORY_DATA;
    }
    return window.STORY_DATA;
  }

  function getStoryProgress() {
    return state[state.activeStoryId];
  }

  function getCurrentChapter() {
    const sData = getActiveStoryData();
    const progress = getStoryProgress();
    return sData.chapters.find(c => c.id === progress.chapterId) || sData.chapters[0];
  }

  function getCurrentScene() {
    const chapter = getCurrentChapter();
    const progress = getStoryProgress();
    if (!chapter.scenes || chapter.scenes.length === 0) return null;
    return chapter.scenes.find(s => s.id === progress.sceneId) || chapter.scenes[0];
  }

  function getCurrentPassage() {
    const scene = getCurrentScene();
    const progress = getStoryProgress();
    if (!scene) return null;
    const passages = scene.passages || [];
    if (!passages || passages.length === 0) return null;
    if (progress.passageIndex < 0) progress.passageIndex = 0;
    if (progress.passageIndex >= passages.length) {
      progress.passageIndex = passages.length - 1;
    }
    return passages[progress.passageIndex];
  }

  /**
   * Switch between Mars and Moon stories cleanly
   */
  function switchStory(targetStoryId, options = {}) {
    if (state.activeStoryId === targetStoryId && !options.force) return;

    playbackToken++;
    clearAutoAdvanceTimer();

    // Clean up audio and video from previous story
    stopNarration();
    if (dom.illustrationVideo) {
      dom.illustrationVideo.pause();
      dom.illustrationVideo.removeAttribute('src');
      dom.illustrationVideo.style.display = 'none';
    }

    state.activeStoryId = targetStoryId;
    saveProgress();

    // Close gateway if open
    closeGateway();

    // Update theme classes on body
    dom.body.classList.remove('theme-mars', 'theme-moon');
    dom.body.classList.add(`theme-${targetStoryId}`);

    // Update story switcher button active states
    dom.btnStoryMars.classList.toggle('active', targetStoryId === 'mars');
    dom.btnStoryMoon.classList.toggle('active', targetStoryId === 'moon');

    const sData = getActiveStoryData();
    dom.headerStoryTitle.textContent = sData.meta.title;
    dom.headerStorySubtitle.textContent = sData.meta.subtitle;

    render();
  }

  /**
   * Switch language between English and Hindi
   */
  function switchLanguage(lang) {
    if (state.language === lang) return;

    // 1. Invalidate any pending timers or callbacks from the previous language
    playbackToken++;
    clearAutoAdvanceTimer();

    // 2. Stop ongoing narration cleanly (detached handlers ensure no callbacks fire)
    stopNarration();

    // 3. Update language in state and engine
    state.language = lang;
    if (narration) narration.setLanguage(lang);
    saveProgress();

    // 4. Update UI toggles
    dom.btnLangEn.classList.toggle('active', lang === 'en');
    dom.btnLangHi.classList.toggle('active', lang === 'hi');
    dom.settingsLangEn.classList.toggle('active', lang === 'en');
    dom.settingsLangHi.classList.toggle('active', lang === 'hi');

    refreshVoiceDropdown();
    updateGatewayUI();

    // 5. Re-render the current passage in the newly selected language
    render();
  }

  /**
   * Update Playback Rate
   */
  function setPlaybackRate(rate) {
    state.narrationRate = parseFloat(rate);
    if (narration) narration.setRate(state.narrationRate);
    dom.rateSelect.value = state.narrationRate.toString();
    saveProgress();
  }

  /**
   * Set Playback Mode (Automatic vs Manual)
   */
  function setPlaybackMode(newMode) {
    if (state.playbackMode === newMode) return;
    state.playbackMode = (newMode === 'manual') ? 'manual' : 'auto';
    updateModeUI();
    saveProgress();

    if (state.playbackMode === 'manual') {
      clearAutoAdvanceTimer();
    } else {
      // Switched from Manual to Automatic: continue automatically from current position
      handleAutoModeResume();
    }
  }

  function updateModeUI() {
    if (dom.btnModeAuto) {
      dom.btnModeAuto.classList.toggle('active', state.playbackMode === 'auto');
    }
    if (dom.btnModeManual) {
      dom.btnModeManual.classList.toggle('active', state.playbackMode === 'manual');
    }
  }

  function handleAutoModeResume() {
    clearAutoAdvanceTimer();
    const currentToken = playbackToken;
    const passage = getCurrentPassage();
    if (!passage) return;

    if (passage.video && dom.illustrationVideo) {
      // Overlay clip (no voice of its own): narration must still be spoken, and the story waits for both.
      const gate = (overlayGate && overlayGate.token === currentToken) ? overlayGate : null;
      const narrateOverlay = () => {
        if (!gate || gate.speechDone || !narration || narration.isPlaying) return;
        const textToSpeak = (state.language === 'hi' && passage.text_hi) ? passage.text_hi : passage.text;
        if (textToSpeak) {
          narration.speak(textToSpeak, () => speechFinished(currentToken, 800));
        } else {
          gate.speechDone = true;
        }
      };
      if (dom.illustrationVideo.ended) {
        if (gate) {
          gate.videoDone = true;
          if (gate.speechDone) maybeAdvanceAfterOverlay(400); else narrateOverlay();
        } else {
          scheduleAutoAdvance(400);
        }
      } else {
        videoAdvancementHandled = false;        // the replayed clip's end must be handled again
        dom.illustrationVideo.play().catch(() => {});
        narrateOverlay();
      }
    } else {
      // Still image: start narration if not already speaking
      if (narration && !narration.isPlaying) {
        const isHi = (state.language === 'hi');
        const textToSpeak = (isHi && passage.text_hi) ? passage.text_hi : passage.text;
        if (textToSpeak) {
          narration.speak(textToSpeak, () => {
            speechFinished(currentToken, 800);
          });
        } else {
          speechFinished(currentToken, 3500);
        }
      }
    }
  }

  function clearAutoAdvanceTimer() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
    if (autoAdvanceFallbackTimer) {
      clearTimeout(autoAdvanceFallbackTimer);
      autoAdvanceFallbackTimer = null;
    }
    if (overlayCapTimer) {
      clearTimeout(overlayCapTimer);
      overlayCapTimer = null;
    }
  }

  /**
   * Video audio rule. Every video passage carries an explicit `videoAudio` value written by
   * tools/build_unified_data.js from the owner's list:
   *   'overlay' -> the clip has no voice; website narration plays over it (clip sound stays on)
   *   'own'     -> the clip has its own audio/voice; website speech is paused while it plays
   * A clip with no value is treated as 'own' (preserve its audio, never overlay by guesswork).
   * If the visitor mutes video sound (existing setting) the clip is silent and narration speaks.
   */
  function videoOwnsAudio(passage) {
    return !!(passage && passage.video) && passage.videoAudio !== 'overlay' && !state.videoAudioMuted;
  }

  // Advance only once BOTH the narration and the clip under it have finished.
  function maybeAdvanceAfterOverlay(delayMs = 800) {
    if (overlayGate && overlayGate.speechDone && overlayGate.videoDone && overlayGate.token === playbackToken) {
      scheduleAutoAdvance(delayMs);
    }
  }

  // Narration for the current passage finished (or could not run): advance, honouring the overlay gate.
  let lastFinishedToken = -1;
  function speechFinished(token, delayMs) {
    if (token !== playbackToken || state.playbackMode !== 'auto') return;
    if (lastFinishedToken === token) return; // Guard: Only trigger once per passage to prevent duplicate scene skipping
    lastFinishedToken = token;
    if (overlayGate && overlayGate.token === token) {
      overlayGate.speechDone = true;
      maybeAdvanceAfterOverlay(delayMs);
    } else {
      scheduleAutoAdvance(delayMs);
    }
  }

  function scheduleAutoAdvance(delayMs = 800) {
    if (state.playbackMode !== 'auto') return;
    clearAutoAdvanceTimer();
    const token = playbackToken;
    autoAdvanceTimer = setTimeout(() => {
      if (token === playbackToken && state.playbackMode === 'auto') {
        autoAdvanceNext();
      }
    }, delayMs);
  }

  /**
   * Intelligent Automatic Progression Engine
   * Sequence:
   * 1. Next passage in current scene
   * 2. When scene passages complete, advance to next scene
   * 3. When all scenes in chapter complete, advance to next chapter
   * 4. When all chapters complete, trigger final ending sequence
   */
  function autoAdvanceNext() {
    if (state.playbackMode !== 'auto') return;
    clearAutoAdvanceTimer();

    const progress = getStoryProgress();
    const chapter = getCurrentChapter();
    const scene = getCurrentScene();
    const sData = getActiveStoryData();

    if (!scene || !chapter || !sData) return;
    const passages = scene.passages || [];
    if (!passages || passages.length === 0) return;

    // 1. More passages in current scene?
    if (progress.passageIndex < passages.length - 1) {
      progress.passageIndex++;
      render();
      const curPass = getCurrentPassage();
      if (curPass && curPass.isEndingTrigger) {
        scheduleAutoAdvance(1500);
      }
      return;
    }

    // 2. Scene complete! Move to next scene in current chapter if available
    const currentSceneIdx = chapter.scenes.findIndex(s => s.id === progress.sceneId);
    if (currentSceneIdx < chapter.scenes.length - 1) {
      const nextSceneObj = chapter.scenes[currentSceneIdx + 1];
      progress.sceneId = nextSceneObj.id;
      progress.passageIndex = 0;
      render();
      return;
    }

    // 3. All scenes in chapter complete! Advance to next chapter
    const currentChapterIdx = sData.chapters.findIndex(c => c.id === chapter.id);
    if (currentChapterIdx < sData.chapters.length - 1) {
      const nextChapterObj = sData.chapters[currentChapterIdx + 1];
      progress.chapterId = nextChapterObj.id;
      progress.sceneId = nextChapterObj.scenes[0].id;
      progress.passageIndex = 0;
      render();
      return;
    }

    // 4. Final chapter, final scene complete -> Ending sequence!
    triggerEndingSequence();
  }

  /**
   * Storybook Gateway & Introduction Controls & Helpers
   */
  function updateGatewayUI() {
    if (!dom.gateway) return;
    const isHi = (state.language === 'hi');

    // Sync card checked state & class
    const marsRadio = dom.btnGatewayMars ? dom.btnGatewayMars.querySelector('input[type="radio"]') : null;
    const moonRadio = dom.btnGatewayMoon ? dom.btnGatewayMoon.querySelector('input[type="radio"]') : null;
    if (marsRadio) marsRadio.checked = (state.activeStoryId === 'mars');
    if (moonRadio) moonRadio.checked = (state.activeStoryId === 'moon');

    if (dom.btnGatewayMars) dom.btnGatewayMars.classList.toggle('selected', state.activeStoryId === 'mars');
    if (dom.btnGatewayMoon) dom.btnGatewayMoon.classList.toggle('selected', state.activeStoryId === 'moon');

    // Update Seg buttons for language
    if (dom.gwLangEn) dom.gwLangEn.setAttribute('aria-checked', String(state.language === 'en'));
    if (dom.gwLangHi) dom.gwLangHi.setAttribute('aria-checked', String(state.language === 'hi'));

    // Update Seg buttons for mode
    if (dom.gwModeAuto) dom.gwModeAuto.setAttribute('aria-checked', String(state.playbackMode === 'auto'));
    if (dom.gwModeManual) dom.gwModeManual.setAttribute('aria-checked', String(state.playbackMode === 'manual'));

    // Mode hint
    if (dom.modeHint) {
      dom.modeHint.textContent = (state.playbackMode === 'auto')
        ? (isHi ? 'कहानी अपने आप चलती है, दृश्य के बाद दृश्य।' : 'The story plays by itself, scene after scene.')
        : (isHi ? 'पन्ने आप पलटते हैं: हर क्षण के बाद कहानी आपका इंतज़ार करती है।' : 'You turn the pages: the story waits for you after each moment.');
    }

    // Begin button
    if (dom.btnBegin) {
      if (state.activeStoryId === 'mars') {
        dom.btnBegin.disabled = false;
        dom.btnBegin.textContent = isHi ? 'मंगल की कहानी शुरू करें' : 'Begin the Mars story';
      } else if (state.activeStoryId === 'moon') {
        dom.btnBegin.disabled = false;
        dom.btnBegin.textContent = isHi ? 'चंद्रमा की कहानी शुरू करें' : 'Begin the Moon story';
      } else {
        dom.btnBegin.disabled = true;
        dom.btnBegin.textContent = isHi ? 'शुरू करने के लिए कहानी चुनिए' : 'Choose a story to begin';
      }
    }

    // Gateway Text translations
    if (dom.gwEyebrow) dom.gwEyebrow.textContent = isHi ? 'एक सिनेमाई इंटरैक्टिव कहानी-पुस्तक' : 'A cinematic interactive storybook';
    if (dom.gwSubtitle) dom.gwSubtitle.textContent = isHi ? 'एक सिनेमाई इंटरैक्टिव कहानी-पुस्तक' : 'A CINEMATIC INTERACTIVE STORYBOOK';
    if (dom.gwIntro) dom.gwIntro.textContent = isHi
      ? 'मंगल और चंद्रमा पर खोज की दो सचित्र कहानियों में उतरिए, जो मानवता की महानतम खोजी यात्राओं को दर्शाती हैं। एक दुनिया चुनिए, भाषा चुनिए, और तय कीजिए कि आप कैसे पढ़ना चाहते हैं।'
      : 'Step into two illustrated stories of exploration across Mars and the Moon, chronicling humanity\'s greatest exploratory quests. Choose a world, a language, and how you want to read.';
    if (dom.lblLang) dom.lblLang.textContent = isHi ? 'भाषा' : 'Language';
    if (dom.lblMode) dom.lblMode.textContent = isHi ? 'प्लेबैक' : 'Playback';
    if (dom.marsKicker) dom.marsKicker.textContent = isHi ? '6 अध्याय · 1960 से आज तक' : '6 chapters · 1960 – today';
    if (dom.marsTitle) dom.marsTitle.textContent = isHi ? 'मंगल की यात्रा' : 'Explore Mars';
    if (dom.marsDesc) dom.marsDesc.textContent = isHi ? 'पहले खो गए यानों से लेकर वाइकिंग, रोवर, मंगलयान और परसेवरेंस तक।' : 'From the first lost probes to Viking, the rovers, Mangalyaan and Perseverance.';
    if (dom.moonKicker) dom.moonKicker.textContent = isHi ? '7 अध्याय · 1960 के दशक से आज तक' : '7 chapters · 1960s – today';
    if (dom.moonTitle) dom.moonTitle.textContent = isHi ? 'चंद्रमा की यात्रा' : 'Explore the Moon';
    if (dom.moonDesc) dom.moonDesc.textContent = isHi ? 'अपोलो के परीक्षणों और पहले क़दमों से लेकर पीछे छूटे उपकरणों और लौटते अभियानों तक।' : 'From the Apollo tests and first footprints to the equipment left behind, and the missions that return.';
    if (dom.btnCreditsGw) dom.btnCreditsGw.textContent = isHi ? 'परियोजना परिचय एवं श्रेय' : 'About & Credits';

    // Settings text translations if open
    if (dom.sVoiceTitle) dom.sVoiceTitle.textContent = isHi ? 'वाचक की आवाज़' : 'Narrator Voice';
    if (dom.sVoiceDesc) dom.sVoiceDesc.textContent = isHi ? 'अपने डिवाइस की उपलब्ध स्पीच आवाज़ों में से चुनें।' : 'Choose from all available speech voices on your device.';
  }

  function openGateway() {
    clearAutoAdvanceTimer();
    stopNarration();
    if (dom.illustrationVideo) dom.illustrationVideo.pause();
    state.isGatewayOpen = true;
    dom.gateway.classList.remove('closed');
    updateGatewayUI();
  }

  function closeGateway() {
    state.isGatewayOpen = false;
    dom.gateway.classList.add('closed');
    saveProgress();
  }

  /**
   * About & Credits Section — Cinematic Documentary Aesthetic
   */
  function buildCredits() {
    if (!dom.creditsBody) return;
    const isHi = (state.language === 'hi');
    dom.creditsBody.innerHTML = '';

    if (!isHi) {
      dom.creditsBody.innerHTML = `
        <div class="ac-container">
          <!-- 1. About the Project Hero Block -->
          <section class="ac-hero-block" aria-label="About the Project">
            <h3 class="ac-project-title">ABANDONED, BUT NOT FORGOTTEN<span class="ac-tm">™</span></h3>
            <p class="ac-project-tagline">An interactive historical storytelling experience exploring humanity's abandoned equipment, missions and scientific legacy across the Moon and Mars.</p>
            <div class="ac-mission-badges">
              <span class="ac-badge mars">🔴 The Mars Chronicles · 1960 to Present</span>
              <span class="ac-badge moon">🌕 The Lunar Legacy · Apollo to Modern Probes</span>
            </div>
          </section>

          <!-- 2. Creator Block -->
          <section class="ac-creator-block" aria-label="Creator Attribution">
            <div class="ac-creator-info">
              <span class="ac-label">Created &amp; Developed By</span>
              <h4 class="ac-creator-name">HARDIK R BHAVSAR</h4>
              <p class="ac-creator-role">Interactive narrative architecture, historical curation, engineering &amp; interface design.</p>
            </div>
            <div class="ac-creator-seal" title="Creator Signature Mark" aria-hidden="true">🚀</div>
          </section>

          <!-- 3. Grid: AI Disclosure & Copyright / Trademark -->
          <div class="ac-grid">
            <!-- AI Content Disclosure -->
            <article class="ac-card" aria-label="AI-Generated Content Disclosure">
              <div class="ac-card-badge">
                <span>🤖</span>
                <span>AI-Generated Content Disclosure</span>
              </div>
              <p class="ac-card-text">Visuals, illustrations and selected media assets were created with the assistance of <strong>Google Gemini</strong>.</p>
              <p class="ac-card-subtext">These materials are used for educational, historical storytelling and visualization purposes. AI-generated visuals should not be mistaken for authentic archival photographs.</p>
            </article>

            <!-- Copyright & Trademark -->
            <article class="ac-card" aria-label="Copyright and Trademark Information">
              <div class="ac-card-badge">
                <span>⚖️</span>
                <span>Copyright &amp; Intellectual Property</span>
              </div>
              <p class="ac-copy-title">&copy; 2026 Hardik R Bhavsar. All Rights Reserved.</p>
              <p class="ac-card-subtext">Original project materials, including original writing, design and development contributions, are credited to their respective creators and rights holders. Third-party materials remain subject to their respective licensing and copyright terms.</p>
              
              <div class="ac-divider"></div>
              
              <p class="ac-copy-title">ABANDONED, BUT NOT FORGOTTEN<span class="ac-tm">™</span></p>
              <p class="ac-card-subtext">The project name and branding are claimed by the project creator, subject to applicable intellectual property rights. Trademark claims are asserted under applicable intellectual property laws and do not suggest official government registration.</p>
            </article>
          </div>

          <!-- 4. Scientific Acknowledgments Block -->
          <section class="ac-acknowledgments-block" aria-label="Institutional Acknowledgments">
            <div class="ac-ack-title">Scientific &amp; Archival Acknowledgments</div>
            <div class="ac-partners-grid">
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>🏛️</span> NASA</span>
                <span class="ac-partner-role">Apollo Lunar Surface Journal, Mars Exploration Program, Lunar Reconnaissance Orbiter (LRO)</span>
              </div>
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>🛰️</span> ISRO</span>
                <span class="ac-partner-role">Mars Orbiter Mission (Mangalyaan), Chandrayaan lunar program archives &amp; data records</span>
              </div>
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>✨</span> Google Gemini</span>
                <span class="ac-partner-role">Assisting in generative visual conceptualization and artistic historical reconstruction</span>
              </div>
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>📚</span> Scientific Archives</span>
                <span class="ac-partner-role">NASA Space Science Data Coordinated Archive (NSSDCA), ESA, and planetary mission reports</span>
              </div>
            </div>
            <p class="ac-disclaimer-note">NASA, ISRO, and other scientific organizations did not sponsor, endorse, or officially review this project. Historical facts and mission timelines are reconstructed from public research records.</p>
          </section>
        </div>
      `;
    } else {
      dom.creditsBody.innerHTML = `
        <div class="ac-container">
          <!-- 1. About the Project Hero Block -->
          <section class="ac-hero-block" aria-label="परियोजना के बारे में">
            <h3 class="ac-project-title">ABANDONED, BUT NOT FORGOTTEN<span class="ac-tm">™</span></h3>
            <p class="ac-project-tagline">चंद्रमा और मंगल पर मानवता के छोड़े गए उपकरणों, अभियानों और वैज्ञानिक विरासत की खोज करने वाला एक संवादात्मक ऐतिहासिक कथा अनुभव।</p>
            <div class="ac-mission-badges">
              <span class="ac-badge mars">🔴 मंगल की गाथा · 1960 से आज तक</span>
              <span class="ac-badge moon">🌕 चंद्रमा की यात्रा · अपोलो से आधुनिक अभियानों तक</span>
            </div>
          </section>

          <!-- 2. Creator Block -->
          <section class="ac-creator-block" aria-label="निर्माता">
            <div class="ac-creator-info">
              <span class="ac-label">निर्माता एवं विकासकर्ता</span>
              <h4 class="ac-creator-name">HARDIK R BHAVSAR (हार्दिक आर भावसार)</h4>
              <p class="ac-creator-role">मूल अवधारणा, संवादात्मक आख्यान वास्तुकला, ऐतिहासिक संकलन एवं इंटरफ़ेस डिज़ाइन।</p>
            </div>
            <div class="ac-creator-seal" title="Creator Signature Mark" aria-hidden="true">🚀</div>
          </section>

          <!-- 3. Grid: AI Disclosure & Copyright / Trademark -->
          <div class="ac-grid">
            <!-- AI Content Disclosure -->
            <article class="ac-card" aria-label="AI सामग्री प्रकटीकरण">
              <div class="ac-card-badge">
                <span>🤖</span>
                <span>AI-जनरेटेड सामग्री प्रकटीकरण</span>
              </div>
              <p class="ac-card-text">दृश्य, चित्र और चयनित मीडिया संपत्तियां <strong>Google Gemini</strong> की सहायता से बनाई गई हैं।</p>
              <p class="ac-card-subtext">इन सामग्रियों का उपयोग शैक्षिक, ऐतिहासिक कथावाचन और दृश्य प्रस्तुति के उद्देश्यों के लिए किया गया है। AI-निर्मित दृश्यों को प्रामाणिक अभिलेखीय तस्वीरें नहीं समझा जाना चाहिए।</p>
            </article>

            <!-- Copyright & Trademark -->
            <article class="ac-card" aria-label="कॉपीराइट एवं ट्रेडमार्क">
              <div class="ac-card-badge">
                <span>⚖️</span>
                <span>कॉपीराइट एवं बौद्धिक संपदा</span>
              </div>
              <p class="ac-copy-title">&copy; 2026 Hardik R Bhavsar. सर्वाधिकार सुरक्षित।</p>
              <p class="ac-card-subtext">मूल परियोजना सामग्री, जिसमें मूल लेखन, डिज़ाइन और विकास योगदान शामिल हैं, उनके संबंधित निर्माताओं और अधिकार धारकों को श्रेय दिया जाता है। तृतीय-पक्ष सामग्री उनकी संबंधित लाइसेंसिंग और कॉपीराइट शर्तों के अधीन है।</p>
              
              <div class="ac-divider"></div>
              
              <p class="ac-copy-title">ABANDONED, BUT NOT FORGOTTEN<span class="ac-tm">™</span></p>
              <p class="ac-card-subtext">परियोजना का नाम और ब्रांडिंग परियोजना निर्माता द्वारा दावा किया गया है, जो लागू बौद्धिक संपदा अधिकारों के अधीन है। ट्रेडमार्क का दावा सामान्य कानून के तहत है और यह किसी आधिकारिक सरकारी पंजीकरण का संकेत नहीं देता है।</p>
            </article>
          </div>

          <!-- 4. Scientific Acknowledgments Block -->
          <section class="ac-acknowledgments-block" aria-label="वैज्ञानिक आभार">
            <div class="ac-ack-title">वैज्ञानिक एवं अभिलेखीय आभार</div>
            <div class="ac-partners-grid">
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>🏛️</span> NASA</span>
                <span class="ac-partner-role">अपोलो ल्यूनर सरफ़ेस जर्नल, मार्स एक्सप्लोरेशन प्रोग्राम, ल्यूनर रिकॉनिसेंस ऑर्बिटर (LRO)</span>
              </div>
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>🛰️</span> ISRO</span>
                <span class="ac-partner-role">मार्स ऑर्बिटर मिशन (मंगलयान), चंद्रयान चंद्र कार्यक्रम अभिलेख एवं डेटा रिकॉर्ड</span>
              </div>
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>✨</span> Google Gemini</span>
                <span class="ac-partner-role">कलात्मक ऐतिहासिक पुनर्रचना और दृश्य अवधारणा में सहायक</span>
              </div>
              <div class="ac-partner-tile">
                <span class="ac-partner-name"><span>📚</span> वैज्ञानिक अभिलेखागार</span>
                <span class="ac-partner-role">NASA स्पेस साइंस डेटा कोऑर्डिनेटेड आर्काइव (NSSDCA), ESA एवं ग्रहीय अनुसंधान रिपोर्ट</span>
              </div>
            </div>
            <p class="ac-disclaimer-note">NASA, ISRO या अन्य वैज्ञानिक संगठनों ने इस परियोजना को प्रायोजित, अनुमोदित या आधिकारिक रूप से समीक्षित नहीं किया है। ऐतिहासिक तथ्य और मिशन विवरण सार्वजनिक शोध रिकॉर्ड से पुनर्निर्मित किए गए हैं।</p>
          </section>
        </div>
      `;
    }
  }

  function openCreditsModal() {
    buildCredits();
    if (dom.creditsBody) dom.creditsBody.scrollTop = 0;
    if (dom.creditsModal) {
      dom.creditsModal.classList.add('open');
      dom.creditsModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeCreditsModal() {
    if (dom.creditsModal) {
      dom.creditsModal.classList.remove('open');
      dom.creditsModal.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Narration Voice Pack Dropdown Populator
   */
  function refreshVoiceDropdown() {
    if (!dom.voiceSelect) return;
    const isHi = (state.language === 'hi');
    dom.voiceSelect.innerHTML = '';

    const autoOpt = document.createElement('option');
    autoOpt.value = '';
    autoOpt.textContent = isHi ? 'स्वचालित (उपलब्ध में सर्वश्रेष्ठ)' : 'Automatic (best available)';
    dom.voiceSelect.appendChild(autoOpt);

    const voices = narration ? narration.getVoicesFor(state.language) : [];
    voices.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.voiceURI;
      opt.textContent = `${v.name} (${v.lang})`;
      dom.voiceSelect.appendChild(opt);
    });

    const chosen = (state.chosenVoices && state.chosenVoices[state.language]) ? state.chosenVoices[state.language] : '';
    dom.voiceSelect.value = chosen;

    if (dom.voiceHint) {
      if (!narration || !narration.isSupported) {
        dom.voiceHint.textContent = isHi
          ? 'यह ब्राउज़र बोल नहीं सकता, इसलिए कहानी पढ़ने के टाइमर पर चलेगी। उपशीर्षक चलते रहेंगे।'
          : 'This browser cannot speak aloud, so the story uses a reading timer. Subtitles still work.';
      } else if (voices.length === 0 && typeof window !== 'undefined' && window.speechSynthesis && (window.speechSynthesis.getVoices() || []).length > 0) {
        dom.voiceHint.textContent = isHi
          ? 'इस डिवाइस पर हिंदी आवाज़ नहीं मिली, इसलिए वर्णन छोड़ दिया जाएगा और कहानी पढ़ने के टाइमर पर आगे बढ़ेगी। उपशीर्षक चलते रहेंगे। डिवाइस की स्पीच सेटिंग में हिंदी आवाज़ जोड़ने से वर्णन चालू हो जाएगा।'
          : 'No English voice was found on this device, so the story will advance on a reading timer.';
      } else {
        dom.voiceHint.textContent = '';
      }
    }
  }

  /**
   * Render function
   */
  function render() {
    playbackToken++;
    const currentToken = playbackToken;
    clearAutoAdvanceTimer();
    updateModeUI();

    const sData = getActiveStoryData();
    const chapter = getCurrentChapter();
    const scene = getCurrentScene();
    const progress = getStoryProgress();

    if (!scene) return;

    const passage = getCurrentPassage();
    if (!passage) return;

    const isHi = (state.language === 'hi');

    // 1. Header Badges
    const chTitle = isHi && chapter.title_hi ? chapter.title_hi : chapter.title;
    const scTitle = isHi && scene.title_hi ? scene.title_hi : scene.title;
    dom.chapterBadge.textContent = `Ch. ${chapter.id} — ${chTitle}`;
    dom.sceneBadge.textContent = `Scene ${scene.id}: ${scTitle}`;

    // 2. Update Illustration / Video
    // Overlay clips share the stage with website narration: advance only when both are done.
    if (overlayCapTimer) { clearTimeout(overlayCapTimer); overlayCapTimer = null; }
    overlayGate = null;
    if (passage.video && !videoOwnsAudio(passage)) {
      overlayGate = { token: currentToken, speechDone: false, videoDone: false };
      overlayCapTimer = setTimeout(() => {          // a stalled clip must never freeze the story
        if (overlayGate && overlayGate.token === playbackToken) {
          overlayGate.videoDone = true;
          maybeAdvanceAfterOverlay(300);
        }
      }, 16000);
    }
    updateIllustration(passage);

    // 3. Update Hotspots
    renderHotspots(passage);

    // 4. Update Dialogue Box
    updateDialogueBox(passage, scene);

    // 5. Update Subtitles
    updateSubtitles(passage);

    // 6. Update Controls State
    updateControlsState(scene, chapter);

    saveProgress();

    // 8. Narration & Automatic Progression Coordination
    const hasAudio = videoOwnsAudio(passage);
    const textToSpeak = (isHi && passage.text_hi) ? passage.text_hi : passage.text;

    if (hasAudio) {
      // Embedded video voiceover is playing: do NOT overlap web speech synthesis!
      stopNarration();
      // Completion is handled automatically by video onended
    } else {
      // Still image, or video without embedded audio
      if (state.playbackMode === 'auto') {
        if (narration && textToSpeak) {
          narration.speak(textToSpeak, () => {
            // Guard: Only advance if this callback belongs to the current active segment!
            speechFinished(currentToken, 800);
          });

          // Watchdog timer so speech synthesis stalls never block the story permanently
          const wordCount = textToSpeak.split(/\s+/).length;
          const speechRate = (state.narrationRate || 1.0);
          const estimatedDuration = Math.max(6000, (wordCount * 650) / speechRate);
          autoAdvanceFallbackTimer = setTimeout(() => {
            if (currentToken === playbackToken && state.playbackMode === 'auto') {
              console.warn("Auto-advance watchdog triggered fallback.");
              if (narration && narration.isPlaying) {
                narration.stop();
              }
              speechFinished(currentToken, 200);
            }
          }, estimatedDuration + 3000);
        } else {
          // If no speech synthesis available or text is blank, advance after reading duration
          const readingDelay = textToSpeak ? Math.max(4500, textToSpeak.split(/\s+/).length * 400) : 4500;
          autoAdvanceTimer = setTimeout(() => {
            speechFinished(currentToken, 200);
          }, readingDelay);
        }
      }
    }
  }

  function handleNarrationComplete() {
    if (state.playbackMode === 'auto') {
      scheduleAutoAdvance(800);
    }
  }

  /**
   * Helper to build candidate file paths
   */
  function getCandidatePaths(src) {
    if (!src) return [];
    const candidates = [src];

    // Try spaced vs unspaced folder variations
    if (src.includes('mars images/')) {
      candidates.push(src.replace('mars images/', 'mars-images/'));
    }
    if (src.includes('moon images/')) {
      candidates.push(src.replace('moon images/', 'moon-images/'));
    }

    return [...new Set(candidates)];
  }

  /**
   * Update Illustration and Video lifecycle with audio coordination
   */
  function updateIllustration(passage) {
    dom.viewportImageDesc.textContent = passage.imageAlt || 'Historical Space Exploration Illustration';

    if (passage.video && dom.illustrationVideo) {
      // Short Video Animation
      loadVideo(passage);
    } else {
      // Still Image
      if (dom.illustrationVideo) {
        dom.illustrationVideo.pause();
        dom.illustrationVideo.removeAttribute('src');
        dom.illustrationVideo.style.display = 'none';
      }
      dom.videoAudioBadge.style.display = 'none';

      const candidates = getCandidatePaths(passage.image);
      tryLoadImage(candidates, 0, passage);
    }
  }

  function loadVideo(passage) {
    const videoToken = playbackToken;
    const candidates = getCandidatePaths(passage.video);
    const videoSrc = candidates[0];

    // Video Audio Coordination
    const hasAudio = videoOwnsAudio(passage);

    if (hasAudio) {
      // Pause web speech synthesis narration so voiceover doesn't overlap!
      stopNarration();
      dom.illustrationVideo.muted = false;
      dom.illustrationVideo.volume = 1.0;
      dom.videoAudioBadge.style.display = 'inline-flex';
      dom.videoAudioText.textContent = 'Original Video Audio Playing';
    } else {
      // Overlay clip (no voice of its own): keep its sound unless the visitor muted video audio.
      dom.illustrationVideo.muted = !!state.videoAudioMuted;
      dom.illustrationVideo.volume = 1.0;
      dom.videoAudioBadge.style.display = 'none';
    }

    // CRITICAL BUG FIX: Ensure video does NOT loop!
    dom.illustrationVideo.loop = false;
    dom.illustrationVideo.src = videoSrc;
    dom.illustrationVideo.style.display = 'block';
    dom.illustrationImg.style.display = 'none';
    dom.imageFallback.style.display = 'none';

    videoAdvancementHandled = false;

    dom.illustrationVideo.onended = () => {
      if (videoAdvancementHandled) return;
      videoAdvancementHandled = true;

      if (videoToken === playbackToken && state.playbackMode === 'auto') {
        if (overlayGate && overlayGate.token === videoToken) {
          overlayGate.videoDone = true;           // narration may still be speaking: wait for it
          maybeAdvanceAfterOverlay(650);
        } else {
          scheduleAutoAdvance(650);
        }
      } else {
        // Manual Mode: stop at last frame and wait for audience action
        dom.illustrationVideo.pause();
      }
    };

    dom.illustrationVideo.onerror = (e) => {
      console.warn('Video failed to load gracefully:', videoSrc, e);
      dom.illustrationVideo.style.display = 'none';
      dom.illustrationImg.style.display = 'block';
      if (videoToken === playbackToken && state.playbackMode === 'auto' && !videoAdvancementHandled) {
        videoAdvancementHandled = true;
        if (overlayGate && overlayGate.token === videoToken) {
          overlayGate.videoDone = true;           // clip failed: let the narration finish, then advance
          maybeAdvanceAfterOverlay(650);
        } else {
          scheduleAutoAdvance(1200);
        }
      }
    };

    dom.illustrationVideo.play().catch(e => {
      console.log('Video autoplay note:', e);
      // Fallback to muted if browser blocks unmuted playback
      dom.illustrationVideo.muted = true;
      dom.illustrationVideo.play().catch(() => {});
    });
  }

  function tryLoadImage(candidates, index, passage) {
    if (index >= candidates.length) {
      dom.illustrationImg.style.display = 'none';
      dom.imageFallback.style.display = 'flex';
      dom.fallbackTitle.textContent = passage.imageAlt || 'Artwork Pending';
      return;
    }

    const testSrc = candidates[index];
    const testImg = new Image();

    testImg.onload = () => {
      dom.illustrationImg.src = testSrc;
      dom.illustrationImg.alt = passage.imageAlt;
      dom.illustrationImg.style.display = 'block';
      dom.imageFallback.style.display = 'none';
    };

    testImg.onerror = () => {
      tryLoadImage(candidates, index + 1, passage);
    };

    testImg.src = testSrc;
  }

  /**
   * Update Dialogue Box
   */
  function updateDialogueBox(passage, scene) {
    const isHi = (state.language === 'hi');
    const progress = getStoryProgress();

    dom.speakerAvatar.textContent = state.activeStoryId === 'mars' ? '🔴' : '🌕';
    dom.speakerName.textContent = (isHi && passage.speaker_hi) ? passage.speaker_hi : (passage.speaker || (state.activeStoryId === 'mars' ? 'Mars Expedition' : 'Lunar Mission'));
    dom.speakerRole.textContent = (isHi && passage.role_hi) ? passage.role_hi : (passage.role || (isHi ? 'ऐतिहासिक अंतरिक्ष वृत्तचित्र' : 'Historical Space Documentary'));

    const totalPassages = scene && scene.passages ? scene.passages.length : 1;
    dom.passageCounter.textContent = isHi 
      ? `संवाद ${progress.passageIndex + 1} / ${totalPassages}` 
      : `Passage ${progress.passageIndex + 1} of ${totalPassages}`;

    const quoteText = (isHi && passage.text_hi) ? passage.text_hi : passage.text;
    dom.dialogueQuote.textContent = `"${quoteText}"`;
  }

  /**
   * Update Subtitles
   */
  function updateSubtitles(passage) {
    if (!state.subtitlesEnabled) {
      dom.viewportSubtitles.classList.remove('active');
      return;
    }
    const isHi = (state.language === 'hi');
    const subText = (isHi && passage.text_hi) ? passage.text_hi : passage.text;
    dom.viewportSubtitles.textContent = subText;
    dom.viewportSubtitles.classList.add('active');
  }

  /**
   * Render Educational Hotspots
   */
  function renderHotspots(passage) {
    dom.hotspotsLayer.innerHTML = '';
    const hotspots = passage.hotspots || [];

    if (!state.hotspotsVisible || hotspots.length === 0) {
      dom.viewportHotspotsCount.textContent = '0 Points';
      dom.hotspotsHintBtn.style.display = 'none';
      return;
    }

    dom.viewportHotspotsCount.textContent = `${hotspots.length} Point`;
    dom.hotspotsHintBtn.style.display = 'inline-flex';
    dom.hotspotsHintBtn.innerHTML = `<span>🔍</span> <span>${hotspots.length} Fact Dossier</span>`;

    hotspots.forEach(spot => {
      const btn = document.createElement('button');
      btn.className = 'hotspot-node';
      btn.style.left = `${spot.x || 50}%`;
      btn.style.top = `${spot.y || 45}%`;
      btn.title = spot.title;

      // Smart positioning for mobile & upper/edge hotspots to prevent clipping
      if ((spot.y || 45) < 36) {
        btn.classList.add('tooltip-below');
      }
      if ((spot.x || 50) < 22) {
        btn.classList.add('tooltip-left-edge');
      } else if ((spot.x || 50) > 78) {
        btn.classList.add('tooltip-right-edge');
      }

      btn.innerHTML = `
        <div class="hotspot-pin">
          <span>+</span>
          <div class="hotspot-ring"></div>
        </div>
        <div class="hotspot-tooltip">${spot.title}</div>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openDossierModal(spot);
      });

      dom.hotspotsLayer.appendChild(btn);
    });
  }

  /**
   * Navigation Controls State
   */
  function updateControlsState(scene, chapter) {
    const progress = getStoryProgress();
    const passages = scene && scene.passages ? scene.passages : [];
    const totalPassages = passages.length || 1;

    const currentSceneIdx = chapter.scenes.findIndex(s => s.id === progress.sceneId);
    dom.btnPrevPassage.disabled = (progress.passageIndex === 0 && currentSceneIdx === 0 && chapter.id === 1);
    dom.btnNextPassage.disabled = (progress.passageIndex >= totalPassages - 1 && scene.isFinalScene);

    dom.btnPrevScene.disabled = (currentSceneIdx <= 0);
    dom.btnNextScene.disabled = (currentSceneIdx >= chapter.scenes.length - 1);
  }

  /**
   * Navigation methods
   */
  function nextPassage() {
    clearAutoAdvanceTimer();
    stopNarration();
    const progress = getStoryProgress();
    const chapter = getCurrentChapter();
    const scene = getCurrentScene();
    const sData = getActiveStoryData();

    if (!scene) return;
    const passages = scene.passages || [];
    if (!passages || passages.length === 0) return;

    if (progress.passageIndex < passages.length - 1) {
      progress.passageIndex++;
      render();

      const curPass = getCurrentPassage();
      if (curPass && curPass.isEndingTrigger) {
        setTimeout(() => triggerEndingSequence(), 1500);
      }
    } else {
      // Reached end of current scene passages: advance to next scene
      const currentSceneIdx = chapter.scenes.findIndex(s => s.id === progress.sceneId);
      if (currentSceneIdx < chapter.scenes.length - 1) {
        const nextSc = chapter.scenes[currentSceneIdx + 1];
        goToScene(nextSc.id);
      } else {
        // Reached end of current chapter: advance to next chapter
        const currentChapterIdx = sData.chapters.findIndex(c => c.id === chapter.id);
        if (currentChapterIdx < sData.chapters.length - 1) {
          const nextCh = sData.chapters[currentChapterIdx + 1];
          progress.chapterId = nextCh.id;
          progress.sceneId = nextCh.scenes[0].id;
          progress.passageIndex = 0;
          render();
        } else if (scene && scene.isFinalScene) {
          triggerEndingSequence();
        }
      }
    }
  }

  function prevPassage() {
    clearAutoAdvanceTimer();
    stopNarration();
    const progress = getStoryProgress();
    const chapter = getCurrentChapter();

    if (progress.passageIndex > 0) {
      progress.passageIndex--;
      render();
    } else {
      // At passage 0: go to previous scene's last passage if available
      const currentSceneIdx = chapter.scenes.findIndex(s => s.id === progress.sceneId);
      if (currentSceneIdx > 0) {
        const prevSc = chapter.scenes[currentSceneIdx - 1];
        progress.sceneId = prevSc.id;
        const prevPassages = prevSc.passages || [];
        progress.passageIndex = Math.max(0, prevPassages.length - 1);
        render();
      }
    }
  }

  function goToScene(sceneId) {
    clearAutoAdvanceTimer();
    stopNarration();
    const progress = getStoryProgress();
    progress.sceneId = sceneId;
    progress.passageIndex = 0;
    render();
  }

  function nextScene() {
    clearAutoAdvanceTimer();
    stopNarration();
    const chapter = getCurrentChapter();
    const progress = getStoryProgress();
    const idx = chapter.scenes.findIndex(s => s.id === progress.sceneId);
    if (idx < chapter.scenes.length - 1) {
      goToScene(chapter.scenes[idx + 1].id);
    }
  }

  function prevScene() {
    clearAutoAdvanceTimer();
    stopNarration();
    const chapter = getCurrentChapter();
    const progress = getStoryProgress();
    const idx = chapter.scenes.findIndex(s => s.id === progress.sceneId);
    if (idx > 0) {
      goToScene(chapter.scenes[idx - 1].id);
    }
  }

  /**
   * Narration Controls
   */
  function toggleNarration() {
    if (!narration) return;
    const passage = getCurrentPassage();
    if (!passage) return;

    const isHi = (state.language === 'hi');
    const textToSpeak = (isHi && passage.text_hi) ? passage.text_hi : passage.text;

    const currentToken = playbackToken;
    narration.togglePlayPause(textToSpeak, () => {
      speechFinished(currentToken, 800);
    });
  }

  function stopNarration() {
    if (narration) narration.stop();
    dom.dialogueQuote.classList.remove('speaking');
    updateNarrationButtonUI(false, false);
  }

  function updateNarrationButtonUI(isPlaying, isPaused) {
    if (isPlaying && !isPaused) {
      dom.narrationLabel.textContent = (state.language === 'hi') ? 'विराम दें' : 'Pause';
      dom.narrationWave.classList.add('wave-active');
      dom.dialogueQuote.classList.add('speaking');
    } else if (isPaused) {
      dom.narrationLabel.textContent = (state.language === 'hi') ? 'जारी रखें' : 'Resume';
      dom.narrationWave.classList.remove('wave-active');
      dom.dialogueQuote.classList.remove('speaking');
    } else {
      dom.narrationLabel.textContent = (state.language === 'hi') ? 'व्याख्या सुनें' : 'Narrate Passage';
      dom.narrationWave.classList.remove('wave-active');
      dom.dialogueQuote.classList.remove('speaking');
    }
  }

  /**
   * Ending Sequence
   */
  function triggerEndingSequence() {
    stopNarration();
    if (dom.illustrationVideo) dom.illustrationVideo.pause();

    const isMars = (state.activeStoryId === 'mars');
    dom.endingTitle.textContent = isMars ? 'RED HORIZON — THE MARS CHRONICLES' : 'ABANDONED, BUT NOT FORGOTTEN.';
    dom.endingSubtitle.textContent = isMars ? 'The search for ancient life continues.' : 'The journey continues across the cosmos.';
    dom.btnEndingSwitchStory.textContent = isMars ? '🌕 Explore Moon Story' : '🔴 Explore Mars Chronicles';

    dom.viewport.classList.add('ending-zoom');
    setTimeout(() => {
      dom.endingScreen.classList.add('active');
      dom.endingScreen.setAttribute('aria-hidden', 'false');
    }, 800);
  }

  function closeEndingSequence() {
    dom.endingScreen.classList.remove('active');
    dom.endingScreen.setAttribute('aria-hidden', 'true');
    dom.viewport.classList.remove('ending-zoom');
  }

  /**
   * Dossier Modal
   */
  function openDossierModal(spot) {
    dom.dossierTitle.textContent = spot.title;
    dom.dossierBadge.textContent = spot.factBadge || 'Established Historical Fact';
    dom.dossierCategory.textContent = spot.category || 'Historical Context';
    dom.dossierWhat.textContent = spot.whatItIs;
    dom.dossierPurpose.textContent = spot.historicalPurpose;
    dom.dossierHow.textContent = spot.howItWorked;
    dom.dossierWhy.textContent = spot.whyItMattered;

    dom.dossierModal.classList.add('open');
    dom.dossierModal.setAttribute('aria-hidden', 'false');
  }

  function closeDossierModal() {
    dom.dossierModal.classList.remove('open');
    dom.dossierModal.setAttribute('aria-hidden', 'true');
  }

  /**
   * Chapter Modal
   */
  function openChapterModal() {
    renderChapterList();
    dom.chapterModal.classList.add('open');
    dom.chapterModal.setAttribute('aria-hidden', 'false');
  }

  function closeChapterModal() {
    dom.chapterModal.classList.remove('open');
    dom.chapterModal.setAttribute('aria-hidden', 'true');
  }

  function renderChapterList() {
    dom.chapterList.innerHTML = '';
    const sData = getActiveStoryData();
    const progress = getStoryProgress();
    const isHi = (state.language === 'hi');

    dom.chapterModalStoryTag.textContent = sData.meta.title;

    sData.chapters.forEach(chap => {
      const card = document.createElement('div');
      card.className = `chapter-item-card ${chap.id === progress.chapterId ? 'active' : ''}`;

      const chapTitle = isHi && chap.title_hi ? chap.title_hi : chap.title;
      const chapSub = isHi && chap.subtitle_hi ? chap.subtitle_hi : chap.subtitle;

      let inner = `
        <div class="chapter-card-header">
          <span class="chapter-number-pill">Chapter ${chap.id}</span>
          <span class="status-tag ready">✓ Fully Available</span>
        </div>
        <div class="chapter-card-title">${chapTitle}</div>
        <div class="chapter-card-subtitle">${chapSub}</div>
        <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
      `;

      chap.scenes.forEach(sc => {
        const scTitle = isHi && sc.title_hi ? sc.title_hi : sc.title;
        inner += `
          <button class="hud-btn ${sc.id === progress.sceneId && chap.id === progress.chapterId ? 'hud-btn-primary' : ''}" style="padding: 5px 12px; font-size: 0.78rem;" id="jump-sc-${chap.id}-${sc.id}">
            Scene ${sc.id}: ${scTitle}
          </button>
        `;
      });
      inner += `</div>`;

      card.innerHTML = inner;

      chap.scenes.forEach(sc => {
        const btn = card.querySelector(`#jump-sc-${chap.id}-${sc.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            stopNarration();
            closeEndingSequence();
            progress.chapterId = chap.id;
            progress.sceneId = sc.id;
            progress.passageIndex = 0;
            closeChapterModal();
            render();
          });
        }
      });

      dom.chapterList.appendChild(card);
    });
  }

  /**
   * Settings Modal
   */
  function openSettingsModal() {
    refreshVoiceDropdown();
    dom.toggleAutoNarrate.classList.toggle('active', state.autoNarration);
    dom.toggleContrast.classList.toggle('active', state.highContrast);
    dom.toggleHotspotsSetting.classList.toggle('active', state.hotspotsVisible);
    dom.textSizeSelect.value = state.textSize;
    dom.subtitleSizeSelect.value = state.subtitleSize;

    dom.settingsModal.classList.add('open');
    dom.settingsModal.setAttribute('aria-hidden', 'false');
  }

  function closeSettingsModal() {
    dom.settingsModal.classList.remove('open');
    dom.settingsModal.setAttribute('aria-hidden', 'true');
  }

  function applySettings() {
    dom.body.classList.toggle('high-contrast', state.highContrast);
    dom.body.classList.remove('font-small', 'font-medium', 'font-large');
    dom.body.classList.add(`font-${state.textSize}`);
    // Subtitle size only restyles the overlay; it never restarts narration or touches scene progress.
    dom.body.classList.remove('subs-small', 'subs-medium', 'subs-large', 'subs-xlarge');
    dom.body.classList.add(`subs-${['small', 'medium', 'large', 'xlarge'].includes(state.subtitleSize) ? state.subtitleSize : 'medium'}`);
    dom.btnToggleHotspots.classList.toggle('active', state.hotspotsVisible);
    saveProgress();
  }

  function resetCurrentStory() {
    if (confirm(`Restart ${state.activeStoryId.toUpperCase()} from Chapter 1, Scene 1?`)) {
      stopNarration();
      closeEndingSequence();
      const progress = getStoryProgress();
      progress.chapterId = 1;
      progress.sceneId = 1;
      progress.passageIndex = 0;
      saveProgress();
      closeSettingsModal();
      render();
    }
  }

  /**
   * Keyboard Shortcuts
   */
  function handleKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key === 'Escape') {
      if (dom.endingScreen.classList.contains('active')) {
        closeEndingSequence();
        return;
      }
      if (dom.dossierModal.classList.contains('open')) {
        closeDossierModal();
        return;
      }
      if (dom.chapterModal.classList.contains('open')) {
        closeChapterModal();
        return;
      }
      if (dom.settingsModal.classList.contains('open')) {
        closeSettingsModal();
        return;
      }
      if (dom.creditsModal && dom.creditsModal.classList.contains('open')) {
        closeCreditsModal();
        return;
      }
      if (state.immersiveMode) {
        toggleImmersiveMode();
        return;
      }
    }

    if (
      dom.dossierModal.classList.contains('open') || 
      dom.chapterModal.classList.contains('open') || 
      dom.settingsModal.classList.contains('open') ||
      (dom.creditsModal && dom.creditsModal.classList.contains('open')) ||
      dom.endingScreen.classList.contains('active')
    ) {
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'd':
      case 'D':
        nextPassage();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        prevPassage();
        break;
      case 'ArrowUp':
        prevScene();
        break;
      case 'ArrowDown':
        nextScene();
        break;
      case ' ':
        e.preventDefault();
        toggleNarration();
        break;
      case 'h':
      case 'H':
        toggleHotspots();
        break;
      case 'm':
      case 'M':
        setPlaybackMode(state.playbackMode === 'auto' ? 'manual' : 'auto');
        break;
      case 'l':
      case 'L':
        switchLanguage(state.language === 'en' ? 'hi' : 'en');
        break;
      case 'i':
      case 'I':
        toggleImmersiveMode();
        break;
    }
  }

  function toggleHotspots() {
    state.hotspotsVisible = !state.hotspotsVisible;
    dom.btnToggleHotspots.classList.toggle('active', state.hotspotsVisible);
    const passage = getCurrentPassage();
    if (passage) renderHotspots(passage);
    saveProgress();
  }

  function toggleSubtitles() {
    state.subtitlesEnabled = !state.subtitlesEnabled;
    dom.btnToggleSubtitles.classList.toggle('active', state.subtitlesEnabled);
    const passage = getCurrentPassage();
    if (passage) updateSubtitles(passage);
    saveProgress();
  }

  function toggleImmersiveMode() {
    state.immersiveMode = !state.immersiveMode;
    dom.body.classList.toggle('immersive-mode', state.immersiveMode);
    dom.btnToggleImmersive.classList.toggle('active', state.immersiveMode);
  }

  /**
   * Bind Events
   */
  function bindEvents() {
    // Gateway Story Pick Cards & CTA
    if (dom.btnGatewayMars) {
      dom.btnGatewayMars.addEventListener('click', () => {
        state.activeStoryId = 'mars';
        updateGatewayUI();
      });
      const rMars = dom.btnGatewayMars.querySelector('input[type="radio"]');
      if (rMars) rMars.addEventListener('change', () => {
        state.activeStoryId = 'mars';
        updateGatewayUI();
      });
    }

    if (dom.btnGatewayMoon) {
      dom.btnGatewayMoon.addEventListener('click', () => {
        state.activeStoryId = 'moon';
        updateGatewayUI();
      });
      const rMoon = dom.btnGatewayMoon.querySelector('input[type="radio"]');
      if (rMoon) rMoon.addEventListener('change', () => {
        state.activeStoryId = 'moon';
        updateGatewayUI();
      });
    }

    if (dom.btnBegin) {
      dom.btnBegin.addEventListener('click', () => {
        closeGateway();
        switchStory(state.activeStoryId, { force: true });
      });
    }

    // Gateway Language & Mode Switchers
    if (dom.gwLangEn) dom.gwLangEn.addEventListener('click', () => switchLanguage('en'));
    if (dom.gwLangHi) dom.gwLangHi.addEventListener('click', () => switchLanguage('hi'));
    if (dom.gwModeAuto) dom.gwModeAuto.addEventListener('click', () => { setPlaybackMode('auto'); updateGatewayUI(); });
    if (dom.gwModeManual) dom.gwModeManual.addEventListener('click', () => { setPlaybackMode('manual'); updateGatewayUI(); });

    // Credits Modal Trigger & Close
    if (dom.btnCreditsGw) dom.btnCreditsGw.addEventListener('click', openCreditsModal);
    if (dom.btnCreditsSet) dom.btnCreditsSet.addEventListener('click', () => { closeSettingsModal(); openCreditsModal(); });
    if (dom.btnAbout) dom.btnAbout.addEventListener('click', openCreditsModal);
    if (dom.btnEndingCredits) dom.btnEndingCredits.addEventListener('click', openCreditsModal);
    if (dom.btnCloseCredits) dom.btnCloseCredits.addEventListener('click', closeCreditsModal);
    if (dom.btnFooterCloseCredits) dom.btnFooterCloseCredits.addEventListener('click', closeCreditsModal);
    if (dom.creditsModal) dom.creditsModal.addEventListener('click', (e) => { if (e.target === dom.creditsModal) closeCreditsModal(); });

    dom.btnOpenGateway.addEventListener('click', openGateway);

    // Story Switchers
    dom.btnStoryMars.addEventListener('click', () => switchStory('mars'));
    dom.btnStoryMoon.addEventListener('click', () => switchStory('moon'));

    // Playback Mode Switchers (Auto / Manual)
    if (dom.btnModeAuto) {
      dom.btnModeAuto.addEventListener('click', () => setPlaybackMode('auto'));
    }
    if (dom.btnModeManual) {
      dom.btnModeManual.addEventListener('click', () => setPlaybackMode('manual'));
    }

    // Language Switchers
    dom.btnLangEn.addEventListener('click', () => switchLanguage('en'));
    dom.btnLangHi.addEventListener('click', () => switchLanguage('hi'));
    dom.settingsLangEn.addEventListener('click', () => switchLanguage('en'));
    dom.settingsLangHi.addEventListener('click', () => switchLanguage('hi'));

    // Voice Pack Selection in Settings
    if (dom.voiceSelect) {
      dom.voiceSelect.addEventListener('change', (e) => {
        const selectedVoiceURI = e.target.value;
        if (!state.chosenVoices) state.chosenVoices = { en: '', hi: '' };
        state.chosenVoices[state.language] = selectedVoiceURI;
        if (narration) narration.setChosenVoice(state.language, selectedVoiceURI);
        saveProgress();

        // If currently speaking, restart current passage with the chosen voice immediately
        if (narration && narration.isPlaying && !narration.isPaused) {
          const passage = getCurrentPassage();
          if (passage) {
            const isHi = (state.language === 'hi');
            const textToSpeak = (isHi && passage.text_hi) ? passage.text_hi : passage.text;
            const currentToken = playbackToken;
            narration.speak(textToSpeak, () => {
              speechFinished(currentToken, 800);
            });
          }
        }
      });
    }

    // Navigation Buttons
    dom.btnNextPassage.addEventListener('click', nextPassage);
    dom.btnPrevPassage.addEventListener('click', prevPassage);
    dom.btnNextScene.addEventListener('click', nextScene);
    dom.btnPrevScene.addEventListener('click', prevScene);



    // Narration & Speed
    dom.btnNarration.addEventListener('click', toggleNarration);
    dom.rateSelect.addEventListener('change', (e) => setPlaybackRate(e.target.value));
    dom.btnToggleSubtitles.addEventListener('click', toggleSubtitles);

    // Video Audio Badge Toggle
    dom.videoAudioBadge.addEventListener('click', () => {
      state.videoAudioMuted = !state.videoAudioMuted;
      if (dom.illustrationVideo) {
        dom.illustrationVideo.muted = state.videoAudioMuted;
      }
      dom.videoAudioText.textContent = state.videoAudioMuted ? 'Video Muted' : 'Original Video Audio Playing';
    });

    // Top Header Buttons
    dom.btnToggleHotspots.addEventListener('click', toggleHotspots);
    dom.btnChapterMenu.addEventListener('click', openChapterModal);
    if (dom.centerIndicator) {
      dom.centerIndicator.addEventListener('click', openChapterModal);
      dom.centerIndicator.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openChapterModal();
        }
      });
    }
    dom.btnToggleImmersive.addEventListener('click', toggleImmersiveMode);
    dom.immersiveExitBtn.addEventListener('click', toggleImmersiveMode);
    dom.btnSettings.addEventListener('click', openSettingsModal);

    // Hotspot Hint Button in Viewport
    dom.hotspotsHintBtn.addEventListener('click', () => {
      const passage = getCurrentPassage();
      if (passage && passage.hotspots && passage.hotspots.length > 0) {
        openDossierModal(passage.hotspots[0]);
      }
    });

    // Modals Close
    dom.btnCloseDossier.addEventListener('click', closeDossierModal);
    dom.dossierModal.addEventListener('click', (e) => {
      if (e.target === dom.dossierModal) closeDossierModal();
    });

    dom.btnCloseChapterModal.addEventListener('click', closeChapterModal);
    dom.chapterModal.addEventListener('click', (e) => {
      if (e.target === dom.chapterModal) closeChapterModal();
    });

    dom.btnModalSwitchStory.addEventListener('click', () => {
      closeChapterModal();
      switchStory(state.activeStoryId === 'mars' ? 'moon' : 'mars');
    });

    dom.btnCloseSettings.addEventListener('click', closeSettingsModal);
    dom.settingsModal.addEventListener('click', (e) => {
      if (e.target === dom.settingsModal) closeSettingsModal();
    });

    // Settings Modal Options
    dom.toggleAutoNarrate.addEventListener('click', () => {
      state.autoNarration = !state.autoNarration;
      dom.toggleAutoNarrate.classList.toggle('active', state.autoNarration);
      if (narration) narration.setAutoAdvance(state.autoNarration);
      saveProgress();
    });

    dom.toggleContrast.addEventListener('click', () => {
      state.highContrast = !state.highContrast;
      dom.toggleContrast.classList.toggle('active', state.highContrast);
      applySettings();
    });

    dom.toggleHotspotsSetting.addEventListener('click', () => {
      state.hotspotsVisible = !state.hotspotsVisible;
      dom.toggleHotspotsSetting.classList.toggle('active', state.hotspotsVisible);
      dom.btnToggleHotspots.classList.toggle('active', state.hotspotsVisible);
      const passage = getCurrentPassage();
      if (passage) renderHotspots(passage);
      saveProgress();
    });

    dom.textSizeSelect.addEventListener('change', (e) => {
      state.textSize = e.target.value;
      applySettings();
    });

    dom.subtitleSizeSelect.addEventListener('change', (e) => {
      state.subtitleSize = e.target.value;
      applySettings();
    });

    dom.btnResetStory.addEventListener('click', resetCurrentStory);

    // Ending Screen Actions
    dom.btnReplayFinal = document.getElementById('btn-replay-final');
    if (dom.btnReplayFinal) {
      dom.btnReplayFinal.addEventListener('click', () => {
        closeEndingSequence();
        const progress = getStoryProgress();
        progress.passageIndex = 0;
        render();
      });
    }

    dom.btnEndingSwitchStory = document.getElementById('btn-ending-switch-story');
    if (dom.btnEndingSwitchStory) {
      dom.btnEndingSwitchStory.addEventListener('click', () => {
        closeEndingSequence();
        switchStory(state.activeStoryId === 'mars' ? 'moon' : 'mars');
      });
    }

    dom.btnRestartFromEnding = document.getElementById('btn-restart-from-ending');
    if (dom.btnRestartFromEnding) {
      dom.btnRestartFromEnding.addEventListener('click', () => {
        closeEndingSequence();
        resetCurrentStory();
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', handleKeyDown);
  }

  /**
   * Application Initialization
   */
  function init() {
    initDOMElements();
    loadSavedProgress();

    // Default story is Mars per Master Execution Directive
    if (!state.activeStoryId) state.activeStoryId = 'mars';

    // Initialize Narration Engine
    if (window.NarrationEngine) {
      narration = new window.NarrationEngine({
        language: state.language,
        rate: state.narrationRate,
        onStateChange: (nState) => {
          updateNarrationButtonUI(nState.isPlaying, nState.isPaused);
        },
        onError: (err) => {
          console.warn("Speech Synthesis Notice:", err);
        }
      });
      narration.setAutoAdvance(state.autoNarration);
      if (state.chosenVoices) {
        if (state.chosenVoices.en) narration.setChosenVoice('en', state.chosenVoices.en);
        if (state.chosenVoices.hi) narration.setChosenVoice('hi', state.chosenVoices.hi);
      }
      narration.onVoices(() => {
        refreshVoiceDropdown();
      });
    }

    // Apply saved UI settings
    dom.body.classList.add(`theme-${state.activeStoryId}`);
    dom.btnStoryMars.classList.toggle('active', state.activeStoryId === 'mars');
    dom.btnStoryMoon.classList.toggle('active', state.activeStoryId === 'moon');

    dom.btnLangEn.classList.toggle('active', state.language === 'en');
    dom.btnLangHi.classList.toggle('active', state.language === 'hi');
    dom.rateSelect.value = state.narrationRate.toString();
    dom.btnToggleSubtitles.classList.toggle('active', state.subtitlesEnabled);

    // Mars-first Gateway behavior
    if (!state.isGatewayOpen) {
      dom.gateway.classList.add('closed');
    } else {
      dom.gateway.classList.remove('closed');
    }

    applySettings();
    refreshVoiceDropdown();
    updateGatewayUI();
    bindEvents();
    render();

    console.log("Unified Storybook Engine (Mars + Moon) initialized successfully. v2.0.0");
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
