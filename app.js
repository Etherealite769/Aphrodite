/**
 * APHRODITE — Lyric Animated Video & Music Visualizer Engine
 * Powered by Web Audio API + HTML5 Canvas + Live Music Auto-Palette Engine
 */

(function () {
  'use strict';

  // --- Global State & Config ---
  const state = {
    mode: 'lotus',
    palette: 'gold',
    autoPalette: true,      // Auto-Sync Palette with Music Structure
    lyricStyle: 'mythic',
    sensitivity: 1.5,
    isPlaying: false,
    audioInitialized: false,
    useMic: false,
    audioData: null,
    lyrics: [],
    currentLyricIndex: -1,
    globalSyncOffset: 0.0,
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    ripples: [],
    particles: [],
    meteors: [],            // Meteor Shower System for Starburst
    gardenFlowers: [],      // Sacred Lotus Garden Flowers
    fireflies: [],          // Floating Golden Fireflies
    isLooping: false,       // Track Loop Toggle State
    rainDrops: [],          // Drizzle Rain Drops for Sacred Lotus
    rainSplashes: [],       // Rain Impact Splash Rings on Pond
    waveSplashes: [],       // Ocean Water Splashes for Cyber Waves
    sparklingStars: [],     // Sparkling Stars for Starburst
    floatingNotes: [],      // Floating Music Notes for 3D Spectrum
    galaxyTrails: [],       // Comet/Dust Trail Particles for Starburst
    nebulaNodes: [],        // Nebula Cloud Nodes for Galaxy
    planets: [],            // 3D Orbiting Planets for Starburst
    floatingInstruments: [],// 3D Spectrum Musical Instruments
    bassEnergy: 0,
    midEnergy: 0,
    trebleEnergy: 0,
    overallEnergy: 0,
    // Smoothed (lerped) energy values for silky animations
    smoothBass: 0,
    smoothMid: 0,
    smoothTreble: 0,
    smoothOverall: 0,
    beatPulse: 0.0,         // Decay factor for beat kicks
    melodyPitch: 0.0,       // Weighted average frequency pitch
    smoothMelody: 0.5,      // Smoothed melody pitch
    beatDetected: false,
    beatHoldFrames: 0,
    // Mode transition crossfade state
    prevMode: null,
    modeTransition: 0,      // 0 = fully transitioned, 1 = just started
    modeTransitionSpeed: 2.5, // How fast to crossfade (per second)
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordingStartTime: 0,
    recordingTimerInterval: null
  };

  // DOM Elements
  const canvas = document.getElementById('animationCanvas');
  const ctx = canvas.getContext('2d');
  const waveformCanvas = document.getElementById('waveformCanvas');
  const wfCtx = waveformCanvas ? waveformCanvas.getContext('2d') : null;

  const audioElement = document.getElementById('audioElement');
  const referenceVideo = document.getElementById('referenceVideo');
  const refVideoWindow = document.getElementById('refVideoWindow');
  const toggleRefVideoBtn = document.getElementById('toggleRefVideoBtn');
  const closeRefVideoBtn = document.getElementById('closeRefVideoBtn');

  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const replayBtn = document.getElementById('replayBtn');
  const loopBtn = document.getElementById('loopBtn');
  const progressContainer = document.getElementById('progressContainer');
  const progressFill = document.getElementById('progressFill');
  const progressHandle = document.getElementById('progressHandle');
  const currentTimeText = document.getElementById('currentTimeText');
  const durationTimeText = document.getElementById('durationTimeText');
  
  // Audio Adjuster Elements
  const volumeSlider = document.getElementById('volumeSlider');
  const sensitivitySlider = document.getElementById('sensitivitySlider');
  const volValEl = document.getElementById('volVal');
  const sensValEl = document.getElementById('sensVal');
  const volMuteBtn = document.getElementById('volMuteBtn');

  const bassLevelEl = document.getElementById('bassLevel');
  const midLevelEl = document.getElementById('midLevel');
  const trebleLevelEl = document.getElementById('trebleLevel');
  const ambientGlow = document.getElementById('ambientGlow');
  const micToggleBtn = document.getElementById('micToggleBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const audioSourceLabel = document.getElementById('audioSourceLabel');

  // Lyric Elements
  const lyricStage = document.getElementById('lyricStage');
  const lyricCurrentEl = document.getElementById('lyricCurrent');
  const lyricBackdropGlow = document.getElementById('lyricBackdropGlow');

  // Palette & Video Exporter Elements
  const recordVideoBtn = document.getElementById('recordVideoBtn');
  const recordingBadge = document.getElementById('recordingBadge');
  const recTimeEl = document.getElementById('recTime');

  // Audio Settings Popover
  const audioSettingsBtn = document.getElementById('audioSettingsBtn');
  const audioSettingsPopover = document.getElementById('audioSettingsPopover');
  const closeAudioSettingsBtn = document.getElementById('closeAudioSettings');

  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let micStreamNode = null;
  let mediaStreamDestination = null;
  let frequencyData = null;
  let timeData = null;
  let lastVolume = 0.9;
  const FFT_SIZE = 256;

  const palettes = {
    gold: { primary: '#ffd700', secondary: '#ff65a3', tertiary: '#a060ff', glow: 'rgba(255, 101, 163, 0.45)', bg: 'rgba(5, 5, 10, 0.24)' },
    ocean: { primary: '#00f2fe', secondary: '#4facfe', tertiary: '#00ffb7', glow: 'rgba(0, 242, 254, 0.45)', bg: 'rgba(4, 13, 26, 0.24)' },
    cyber: { primary: '#ff007f', secondary: '#7928ca', tertiary: '#00e5ff', glow: 'rgba(255, 0, 127, 0.55)', bg: 'rgba(10, 2, 18, 0.24)' },
    celestial: { primary: '#78ffd6', secondary: '#a8ff78', tertiary: '#fbf5b7', glow: 'rgba(120, 255, 214, 0.45)', bg: 'rgba(2, 18, 14, 0.24)' }
  };

  function init() {
    setupCanvas();
    loadAudioData();
    setupEventListeners();
    initParticles();
    initMeteors();
    initSacredGarden();
    initGalaxyTrails();
    initSparklingStars();
    initInstruments();
    applyPaletteTheme(state.palette);
    requestAnimationFrame(renderLoop);
  }

  function setupCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    if (waveformCanvas) {
      waveformCanvas.width = waveformCanvas.parentElement.clientWidth * window.devicePixelRatio;
      waveformCanvas.height = 36 * window.devicePixelRatio;
      if (wfCtx) wfCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  window.addEventListener('resize', setupCanvas);

  function loadAudioData() {
    fetch('audio_data.json?v=' + Date.now())
      .then(res => res.json())
      .then(data => {
        state.audioData = data;
        state.lyrics = data.lyrics || [];
        renderOverviewWaveform();
      })
      .catch(err => {
        fetch('lyrics.json?v=' + Date.now())
          .then(res => res.json())
          .then(lData => {
            state.lyrics = lData.lyrics || [];
          })
          .catch(e => console.log('[App] lyrics.json fallback warning:', e));
      });
  }

  function renderOverviewWaveform() {
    if (!wfCtx || !state.audioData || !state.audioData.waveform) return;
    const w = waveformCanvas.parentElement.clientWidth;
    const h = 36;
    wfCtx.clearRect(0, 0, w, h);

    const wf = state.audioData.waveform;
    const step = w / wf.length;
    const activePalette = palettes[state.palette];

    wfCtx.fillStyle = activePalette.secondary;
    for (let i = 0; i < wf.length; i++) {
      const amp = wf[i] * h * 0.85;
      const x = i * step;
      const y = (h - amp) / 2;
      wfCtx.fillRect(x, y, Math.max(1, step - 1), amp);
    }
  }

  function initAudioContext() {
    if (state.audioInitialized) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.88;

    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.fftSize);

    sourceNode = audioCtx.createMediaElementSource(audioElement);
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    mediaStreamDestination = audioCtx.createMediaStreamDestination();
    sourceNode.connect(mediaStreamDestination);

    state.audioInitialized = true;
  }

  // --- Beat & Melody Audio Frequency Processor ---
  // Lerp utility for smooth interpolation
  function lerp(current, target, factor) {
    return current + (target - current) * factor;
  }

  function updateAudioAnalysis() {
    if (!analyser) return;

    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeData);

    const smoothFactor = Math.min(1, deltaTime * 12); // ~0.19 at 60fps, scales with framerate

    // 1. Bass Energy (Rhythm Kick Beats: ~20Hz - 250Hz)
    let bassSum = 0;
    for (let i = 0; i < 10; i++) bassSum += frequencyData[i];
    state.bassEnergy = (bassSum / 10 / 255) * state.sensitivity;
    state.smoothBass = lerp(state.smoothBass, state.bassEnergy, smoothFactor);

    // 2. Mid Energy (Vocal Melody Range: ~250Hz - 3.5kHz)
    let midSum = 0;
    for (let i = 11; i < 50; i++) midSum += frequencyData[i];
    state.midEnergy = (midSum / 39 / 255) * state.sensitivity;
    state.smoothMid = lerp(state.smoothMid, state.midEnergy, smoothFactor);

    // 3. Treble Energy (Guitar Harmonics & Cymbals: ~3.5kHz - 16kHz)
    let trebleSum = 0;
    for (let i = 51; i < 110; i++) trebleSum += frequencyData[i];
    state.trebleEnergy = (trebleSum / 59 / 255) * state.sensitivity;
    state.smoothTreble = lerp(state.smoothTreble, state.trebleEnergy, smoothFactor);

    // 4. Weighted Melody Pitch Index
    let weightedPitchSum = 0;
    let totalWeight = 0;
    for (let i = 5; i < 90; i++) {
      weightedPitchSum += i * frequencyData[i];
      totalWeight += frequencyData[i];
    }
    state.melodyPitch = totalWeight > 0 ? (weightedPitchSum / totalWeight) / 90 : 0.5;
    state.smoothMelody = lerp(state.smoothMelody, state.melodyPitch, smoothFactor * 0.6);

    state.overallEnergy = (state.bassEnergy + state.midEnergy + state.trebleEnergy) / 3;
    state.smoothOverall = lerp(state.smoothOverall, state.overallEnergy, smoothFactor);

    // 5. Beat Kick Detector & Pulse Decay
    if (state.bassEnergy > 0.62 && state.beatHoldFrames <= 0) {
      state.beatDetected = true;
      state.beatHoldFrames = 10;
      state.beatPulse = 1.0;
      triggerBeatPulse();
      spawnExtraMeteor();
    } else {
      state.beatDetected = false;
      if (state.beatHoldFrames > 0) state.beatHoldFrames--;
    }

    // Smoother beat pulse decay (delta-time aware)
    state.beatPulse = Math.max(0, state.beatPulse - deltaTime * 4.2);

    bassLevelEl.textContent = `${Math.min(100, Math.round(state.smoothBass * 100))}%`;
    midLevelEl.textContent = `${Math.min(100, Math.round(state.smoothMid * 100))}%`;
    trebleLevelEl.textContent = `${Math.min(100, Math.round(state.smoothTreble * 100))}%`;

    const glowScale = 1 + state.smoothBass * 0.5 + state.beatPulse * 0.3;
    ambientGlow.style.transform = `translate(-50%, -50%) scale(${glowScale})`;
  }

  function triggerBeatPulse() {
    const activePalette = palettes[state.palette];
    state.ripples.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 80,
      y: window.innerHeight / 2 + (Math.random() - 0.5) * 80,
      radius: 15,
      maxRadius: 280 + state.bassEnergy * 220,
      color: activePalette.primary,
      opacity: 0.95,
      speed: 9 + state.bassEnergy * 12
    });
  }

  // --- Live Auto Palette Music Sync Engine ---
  function updateMusicAutoPaletteSync() {
    if (!state.autoPalette || !state.isPlaying || !audioElement) return;

    const t = audioElement.currentTime;
    let targetPalette = 'gold';

    if (t >= 0 && t < 38) {
      targetPalette = 'gold';
    } else if (t >= 38 && t < 85) {
      targetPalette = 'ocean';
    } else if (t >= 85 && t < 135) {
      targetPalette = 'cyber';
    } else if (t >= 135 && t < 185) {
      targetPalette = 'celestial';
    } else {
      targetPalette = 'gold';
    }

    if (targetPalette !== state.palette) {
      applyPaletteTheme(targetPalette);
    }
  }

  function applyPaletteTheme(paletteName) {
    state.palette = paletteName;
    document.body.className = `theme-${paletteName}`;

    document.querySelectorAll('.palette-btn').forEach(btn => {
      if (btn.getAttribute('data-palette') === paletteName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderOverviewWaveform();
  }

  // --- Tightly Synced Kinetic Lyric Engine ---
  function updateLyricSync() {
    if (!state.lyrics || state.lyrics.length === 0) return;

    const curTime = audioElement.currentTime;
    let foundIndex = -1;

    for (let i = 0; i < state.lyrics.length; i++) {
      const start = state.lyrics[i].start + state.globalSyncOffset;
      const end = state.lyrics[i].end + state.globalSyncOffset;
      if (curTime >= start && curTime < end) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== state.currentLyricIndex) {
      state.currentLyricIndex = foundIndex;
      renderActiveLyricLine(foundIndex, curTime);
    }

    if (foundIndex !== -1 && state.lyricStyle === 'karaoke') {
      updateKaraokeWordHighlights(state.lyrics[foundIndex], curTime);
    }

    if (referenceVideo && refVideoWindow.classList.contains('active')) {
      if (Math.abs(referenceVideo.currentTime - curTime) > 0.3) {
        referenceVideo.currentTime = curTime;
      }
    }
  }

  function renderActiveLyricLine(index, currentTime = 0) {
    if (lyricBackdropGlow) {
      lyricBackdropGlow.style.opacity = '0.9';
      lyricBackdropGlow.style.transform = 'translate(-50%, -50%) scale(1.15)';
      setTimeout(() => {
        if (lyricBackdropGlow) {
          lyricBackdropGlow.style.opacity = '0.6';
          lyricBackdropGlow.style.transform = 'translate(-50%, -50%) scale(1.0)';
        }
      }, 350);
    }

    if (index === -1) {
      let isInstrumentalSection = false;

      if (state.lyrics.length > 0) {
        const firstLineStart = state.lyrics[0].start + state.globalSyncOffset;
        const lastLineEnd = state.lyrics[state.lyrics.length - 1].end + state.globalSyncOffset;

        if (currentTime < firstLineStart) {
          isInstrumentalSection = true;
        } else if (currentTime > lastLineEnd) {
          isInstrumentalSection = true;
        } else {
          for (let i = 0; i < state.lyrics.length - 1; i++) {
            const lineEnd = state.lyrics[i].end + state.globalSyncOffset;
            const nextStart = state.lyrics[i + 1].start + state.globalSyncOffset;
            if (currentTime >= lineEnd && currentTime <= nextStart) {
              if ((nextStart - lineEnd) >= 5.0) {
                isInstrumentalSection = true;
              }
              break;
            }
          }
        }
      }

      if (isInstrumentalSection || currentTime === 0) {
        lyricCurrentEl.innerHTML = '<span class="placeholder-text">✨ APHRODITE — THE RIDLEYS ✨</span>';
      } else {
        lyricCurrentEl.innerHTML = '';
      }
      return;
    }

    const curLine = state.lyrics[index];

    if (state.lyricStyle === 'karaoke' && curLine.words) {
      lyricCurrentEl.innerHTML = curLine.words.map((w, i) => `<span class="word-span" id="word-${i}">${w}</span>`).join(' ');
    } else {
      lyricCurrentEl.textContent = curLine.text;
      lyricCurrentEl.classList.remove('pop-pulse');
      void lyricCurrentEl.offsetWidth; // Force synchronous reflow
      lyricCurrentEl.classList.add('pop-pulse');
    }
  }

  function updateKaraokeWordHighlights(line, currentTime) {
    if (!line.words || line.words.length === 0) return;
    const start = line.start + state.globalSyncOffset;
    const end = line.end + state.globalSyncOffset;
    const duration = end - start;
    const elapsed = currentTime - start;
    const progress = Math.max(0, Math.min(1, elapsed / duration));

    const activeWordIndex = Math.floor(progress * line.words.length);
    line.words.forEach((_, i) => {
      const span = document.getElementById(`word-${i}`);
      if (span) {
        if (i <= activeWordIndex) {
          span.classList.add('active-word');
        } else {
          span.classList.remove('active-word');
        }
      }
    });
  }

  function initParticles() {
    state.particles = [];
    const count = 200;
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 3.2 + 1,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
        dist: Math.random() * 320 + 50,
        opacity: Math.random() * 0.8 + 0.2
      });
    }
  }

  // --- Meteor Shower System ---
  function initMeteors() {
    state.meteors = [];
    for (let i = 0; i < 6; i++) {
      state.meteors.push(createMeteor());
    }
  }

  function createMeteor() {
    const w = window.innerWidth;
    return {
      x: Math.random() * (w * 1.2) - (w * 0.2),
      y: -50,
      length: Math.random() * 140 + 80,
      speed: Math.random() * 12 + 15,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      width: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.7 + 0.3
    };
  }

  function spawnExtraMeteor() {
    if (state.meteors.length < 12) {
      state.meteors.push(createMeteor());
    }
  }

  function drawMeteors(palette) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (let i = state.meteors.length - 1; i >= 0; i--) {
      const m = state.meteors[i];
      m.x += Math.cos(m.angle) * (m.speed + state.bassEnergy * 10);
      m.y += Math.sin(m.angle) * (m.speed + state.bassEnergy * 10);

      const tailX = m.x - Math.cos(m.angle) * m.length;
      const tailY = m.y - Math.sin(m.angle) * m.length;

      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, palette.primary);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = m.width + state.trebleEnergy * 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = palette.primary;
      ctx.stroke();

      if (m.y > h + 100 || m.x > w + 200) {
        state.meteors[i] = createMeteor();
      }
    }
  }

  // --- 🌸 Sacred Garden + Pond + Drizzle Rain System ---
  function initSacredGarden() {
    state.gardenFlowers = [];
    state.fireflies = [];
    state.pondRipples = [];
    state.koiFish = [];
    state.rainDrops = [];
    state.rainSplashes = [];

    // Initialize Drizzle Rain Drops
    for (let r = 0; r < 90; r++) {
      state.rainDrops.push({
        x: Math.random() * window.innerWidth * 1.3 - window.innerWidth * 0.15,
        y: Math.random() * window.innerHeight,
        length: Math.random() * 22 + 14,
        speed: Math.random() * 9 + 14,
        opacity: Math.random() * 0.4 + 0.15
      });
    }

    const flowerConfigs = [
      { relX: 0.12, relY: 0.22, petals: 10, scale: 0.5 },
      { relX: 0.88, relY: 0.22, petals: 10, scale: 0.5 },
      { relX: 0.22, relY: 0.38, petals: 12, scale: 0.65 },
      { relX: 0.78, relY: 0.38, petals: 12, scale: 0.65 },
      { relX: 0.08, relY: 0.78, petals: 14, scale: 0.85 },
      { relX: 0.92, relY: 0.78, petals: 14, scale: 0.85 },
      { relX: 0.32, relY: 0.82, petals: 12, scale: 0.75 },
      { relX: 0.68, relY: 0.82, petals: 12, scale: 0.75 },
      { relX: 0.50, relY: 0.86, petals: 16, scale: 0.95 }
    ];

    flowerConfigs.forEach(fc => {
      state.gardenFlowers.push({
        relX: fc.relX,
        relY: fc.relY,
        petals: fc.petals,
        scale: fc.scale,
        bloomProgress: 0.3,
        rotation: Math.random() * Math.PI * 2,
        leafRadius: fc.scale * 65
      });
    });

    for (let f = 0; f < 60; f++) {
      state.fireflies.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.8 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: -Math.random() * 1.2 - 0.3,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // Initialize Koi Fish
    for (let k = 0; k < 5; k++) {
      state.koiFish.push({
        x: Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2,
        y: 0,  // will be set relative to pondY
        relPondDepth: Math.random() * 0.5 + 0.15,
        speed: (Math.random() * 0.6 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
        tailPhase: Math.random() * Math.PI * 2,
        size: Math.random() * 12 + 8,
        hue: Math.random() > 0.5 ? 0 : 35  // red or gold koi
      });
    }
  }

  function drawSacredGarden(w, h, palette) {
    const pondY = h * 0.62;
    const pondH = h - pondY;

    // --- POND WATER BODY ---
    ctx.save();
    const waterGrad = ctx.createLinearGradient(0, pondY, 0, h);
    waterGrad.addColorStop(0, 'rgba(2, 18, 40, 0.15)');
    waterGrad.addColorStop(0.15, 'rgba(4, 22, 48, 0.55)');
    waterGrad.addColorStop(0.45, 'rgba(3, 16, 36, 0.78)');
    waterGrad.addColorStop(1, 'rgba(1, 8, 18, 0.95)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, pondY, w, pondH);
    ctx.restore();

    // --- ANIMATED WATER RIPPLE WAVES ---
    ctx.save();
    const rippleCount = 7;
    for (let r = 0; r < rippleCount; r++) {
      const ry = pondY + (r / rippleCount) * pondH * 0.7 + 15;
      ctx.beginPath();
      ctx.moveTo(0, ry);
      for (let x = 0; x <= w; x += 8) {
        const waveAmp = 3.5 + state.bassEnergy * 5 + state.midEnergy * 3;
        const waveY = ry + Math.sin(x * 0.012 + time * (1.5 + r * 0.25) + r * 1.8) * waveAmp
                         + Math.sin(x * 0.025 + time * 2.2 - r) * (waveAmp * 0.4);
        ctx.lineTo(x, waveY);
      }
      ctx.strokeStyle = `rgba(${r % 2 === 0 ? '120, 200, 255' : '80, 160, 220'}, ${0.06 + state.midEnergy * 0.08 - r * 0.005})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();

    // --- GLOWING POND SHORELINE ---
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, pondY);
    for (let x = 0; x <= w; x += 6) {
      const shoreWave = Math.sin(x * 0.015 + time * 0.8) * 6 + Math.sin(x * 0.04 + time * 1.6) * 3;
      ctx.lineTo(x, pondY + shoreWave);
    }
    const shoreGrad = ctx.createLinearGradient(0, pondY - 8, 0, pondY + 18);
    shoreGrad.addColorStop(0, 'transparent');
    shoreGrad.addColorStop(0.4, palette.primary);
    shoreGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = shoreGrad;
    ctx.lineWidth = 2.5 + state.bassEnergy * 2;
    ctx.shadowBlur = 18 + state.beatPulse * 12;
    ctx.shadowColor = palette.primary;
    ctx.stroke();
    ctx.restore();

    // --- EXPANDING CIRCULAR POND RIPPLES (from beat or periodic) ---
    if (state.beatDetected || Math.random() < 0.008) {
      state.pondRipples.push({
        x: Math.random() * w * 0.7 + w * 0.15,
        y: pondY + Math.random() * pondH * 0.5 + 15,
        radius: 2,
        maxRadius: 80 + state.bassEnergy * 60,
        opacity: 0.6
      });
    }

    ctx.save();
    for (let i = state.pondRipples.length - 1; i >= 0; i--) {
      const rp = state.pondRipples[i];
      rp.radius += 1.2 + state.midEnergy * 2;
      rp.opacity -= 0.008;

      if (rp.opacity <= 0 || rp.radius >= rp.maxRadius) {
        state.pondRipples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.save();
      ctx.translate(rp.x, rp.y);
      ctx.scale(1, 0.35); // flatten to ellipse for perspective
      ctx.arc(0, 0, rp.radius, 0, Math.PI * 2);
      ctx.restore();
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = rp.opacity;
      ctx.shadowBlur = 10;
      ctx.shadowColor = palette.primary;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
    ctx.restore();

    // --- LILY PADS on Pond ---
    const lilyPadConfigs = [
      { relX: 0.18, relPondY: 0.15, size: 32 },
      { relX: 0.72, relPondY: 0.22, size: 28 },
      { relX: 0.40, relPondY: 0.35, size: 35 },
      { relX: 0.85, relPondY: 0.12, size: 26 },
      { relX: 0.55, relPondY: 0.48, size: 30 },
      { relX: 0.28, relPondY: 0.55, size: 24 }
    ];

    lilyPadConfigs.forEach((lp, idx) => {
      const lpx = lp.relX * w;
      const lpy = pondY + lp.relPondY * pondH * 0.65 + 12;
      const bobY = lpy + Math.sin(time * 1.2 + idx * 1.5) * 3;

      ctx.save();
      ctx.translate(lpx, bobY);
      ctx.scale(1, 0.4); // perspective

      // Lily pad circle with a notch
      ctx.beginPath();
      ctx.arc(0, 0, lp.size, 0.15, Math.PI * 2 - 0.15);
      ctx.lineTo(0, 0);
      ctx.closePath();

      ctx.fillStyle = `rgba(15, 65, 35, ${0.7 + state.midEnergy * 0.2})`;
      ctx.strokeStyle = `rgba(100, 220, 140, ${0.5 + state.trebleEnergy * 0.3})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = palette.primary;
      ctx.fill();
      ctx.stroke();

      // Veins on lily pad
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -lp.size * 0.85);
      ctx.moveTo(0, 0);
      ctx.lineTo(-lp.size * 0.6, -lp.size * 0.5);
      ctx.moveTo(0, 0);
      ctx.lineTo(lp.size * 0.6, -lp.size * 0.5);
      ctx.strokeStyle = 'rgba(80, 180, 110, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    });

    // --- GLOWING KOI FISH ---
    state.koiFish.forEach((koi) => {
      const koiY = pondY + koi.relPondDepth * pondH * 0.6 + 20;
      koi.x += koi.speed * (1 + state.midEnergy * 1.5);
      koi.tailPhase += 0.08;

      // Wrap around
      if (koi.speed > 0 && koi.x > w + 30) koi.x = -30;
      if (koi.speed < 0 && koi.x < -30) koi.x = w + 30;

      const tailWag = Math.sin(koi.tailPhase) * 5;
      const dir = koi.speed > 0 ? 1 : -1;

      ctx.save();
      ctx.translate(koi.x, koiY);
      ctx.scale(dir, 1);
      ctx.globalAlpha = 0.55 + state.midEnergy * 0.25;

      // Body
      ctx.beginPath();
      ctx.moveTo(koi.size, 0);
      ctx.quadraticCurveTo(0, -koi.size * 0.5, -koi.size * 0.8, tailWag);
      ctx.quadraticCurveTo(0, koi.size * 0.5, koi.size, 0);
      const koiColor = koi.hue === 0 ? palette.secondary : palette.primary;
      ctx.fillStyle = koiColor;
      ctx.shadowBlur = 12;
      ctx.shadowColor = koiColor;
      ctx.fill();

      // Tail fin
      ctx.beginPath();
      ctx.moveTo(-koi.size * 0.7, tailWag);
      ctx.lineTo(-koi.size * 1.2, tailWag - 6);
      ctx.lineTo(-koi.size * 1.2, tailWag + 6);
      ctx.closePath();
      ctx.fillStyle = koiColor;
      ctx.fill();

      ctx.globalAlpha = 1.0;
      ctx.restore();
    });

    // --- LOTUS FLOWER LEAF PADS (original leaves) ---
    state.gardenFlowers.forEach((flower) => {
      const fx = flower.relX * w;
      const fy = flower.relY * h;

      if (fy >= pondY - 80) {
        ctx.save();
        ctx.translate(fx, fy + 12);
        ctx.scale(flower.scale, flower.scale * 0.45);

        ctx.beginPath();
        ctx.arc(0, 0, flower.leafRadius * 1.3, 0.2, Math.PI * 1.85);
        ctx.lineTo(0, 0);
        ctx.closePath();

        ctx.fillStyle = `rgba(18, 55, 38, ${0.4 + state.midEnergy * 0.3})`;
        ctx.strokeStyle = `rgba(120, 255, 180, ${0.3 + state.trebleEnergy * 0.4})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.shadowColor = palette.primary;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    });

    // --- LOTUS FLOWER BLOOMS ---
    state.gardenFlowers.forEach((flower, idx) => {
      const fx = flower.relX * w;
      const fy = flower.relY * h;

      flower.bloomProgress = Math.min(1.0, 0.35 + state.midEnergy * 0.6 + state.beatPulse * 0.2);
      flower.rotation += 0.002 * (idx % 2 === 0 ? 1 : -1);

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(flower.rotation);
      ctx.scale(flower.scale, flower.scale);

      const petalRadius = 45 * flower.bloomProgress + state.bassEnergy * 20;
      for (let p = 0; p < flower.petals; p++) {
        const pAngle = (p / flower.petals) * Math.PI * 2;
        ctx.save();
        ctx.rotate(pAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(16, -petalRadius / 2, 0, -petalRadius);
        ctx.quadraticCurveTo(-16, -petalRadius / 2, 0, 0);

        const pGrad = ctx.createLinearGradient(0, 0, 0, -petalRadius);
        pGrad.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
        pGrad.addColorStop(0.7, palette.secondary);
        pGrad.addColorStop(1, palette.primary);

        ctx.fillStyle = pGrad;
        ctx.shadowBlur = 12;
        ctx.shadowColor = palette.primary;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, 14 * flower.bloomProgress, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = palette.primary;
      ctx.fill();

      ctx.restore();

      // --- LOTUS REFLECTION IN POND ---
      if (fy < pondY + 30) {
        const reflY = pondY + (pondY - fy) * 0.35 + 25;
        ctx.save();
        ctx.translate(fx, reflY);
        ctx.rotate(-flower.rotation);
        ctx.scale(flower.scale * 0.7, -flower.scale * 0.25);
        ctx.globalAlpha = 0.12 + state.midEnergy * 0.08;

        for (let p = 0; p < flower.petals; p++) {
          const pAngle = (p / flower.petals) * Math.PI * 2;
          ctx.save();
          ctx.rotate(pAngle);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(12, -petalRadius * 0.4, 0, -petalRadius * 0.7);
          ctx.quadraticCurveTo(-12, -petalRadius * 0.4, 0, 0);
          ctx.fillStyle = palette.primary;
          ctx.fill();
          ctx.restore();
        }

        ctx.globalAlpha = 1.0;
        ctx.restore();
      }
    });

    // --- WATER SURFACE LIGHT SHIMMER ---
    ctx.save();
    for (let s = 0; s < 18; s++) {
      const sx = (s / 18) * w + Math.sin(time * 0.8 + s * 2) * 30;
      const sy = pondY + 8 + Math.sin(time * 1.5 + s * 0.9) * pondH * 0.3;
      const shimmerSize = 2 + Math.sin(time * 3 + s * 1.3) * 1.5;

      ctx.beginPath();
      ctx.arc(sx, sy, shimmerSize, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.08 + Math.sin(time * 2.5 + s) * 0.06 + state.trebleEnergy * 0.06;
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();

    // --- DRIZZLE RAIN POURING & POND SPLASHES ---
    ctx.save();
    for (let i = 0; i < state.rainDrops.length; i++) {
      const drop = state.rainDrops[i];
      drop.x += deltaTime * 40;
      drop.y += drop.speed * 60 * deltaTime;

      // Draw slanting rain drop line
      ctx.beginPath();
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - 4, drop.y + drop.length);
      ctx.strokeStyle = `rgba(180, 225, 255, ${drop.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Rain drop hits pond surface
      if (drop.y >= pondY) {
        if (Math.random() < 0.4) {
          state.rainSplashes.push({
            x: drop.x,
            y: pondY + Math.random() * pondH * 0.8,
            radius: 1,
            maxRadius: Math.random() * 14 + 6,
            opacity: 0.7
          });
        }
        drop.y = -drop.length - Math.random() * 40;
        drop.x = Math.random() * w * 1.3 - w * 0.15;
      }
    }

    // Draw rain splash rings on pond
    for (let s = state.rainSplashes.length - 1; s >= 0; s--) {
      const splash = state.rainSplashes[s];
      splash.radius += deltaTime * 24;
      splash.opacity -= deltaTime * 1.8;

      if (splash.opacity <= 0 || splash.radius >= splash.maxRadius) {
        state.rainSplashes.splice(s, 1);
        continue;
      }

      ctx.beginPath();
      ctx.save();
      ctx.translate(splash.x, splash.y);
      ctx.scale(1, 0.35);
      ctx.arc(0, 0, splash.radius, 0, Math.PI * 2);
      ctx.restore();
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 1;
      ctx.globalAlpha = splash.opacity;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
    ctx.restore();

    // --- FIREFLIES ---
    state.fireflies.forEach((ff) => {
      ff.x += ff.speedX * (1 + state.trebleEnergy * 2);
      ff.y += ff.speedY * (1 + state.midEnergy * 2.5);

      if (ff.y < -20) ff.y = h + 20;
      if (ff.x < 0) ff.x = w;
      if (ff.x > w) ff.x = 0;

      const alpha = Math.abs(Math.sin(time * 2 + ff.pulseOffset)) * 0.75 + 0.25;

      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.radius * (1 + state.midEnergy * 1.5), 0, Math.PI * 2);
      ctx.fillStyle = palette.primary;
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 12 + state.beatPulse * 10;
      ctx.shadowColor = palette.primary;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
  }

  // --- ⚡ 3D SPECTRUM FLOATING MUSICAL INSTRUMENTS SYSTEM ---
  function initInstruments() {
    state.floatingInstruments = [
      { name: 'Acoustic Guitar', symbol: '🎸', relX: 0.18, freqType: 'mid', bounceOffset: 0 },
      { name: 'Bass Guitar', symbol: '🎻', relX: 0.30, freqType: 'bass', bounceOffset: 1 },
      { name: 'Drums', symbol: '🥁', relX: 0.46, freqType: 'bass', bounceOffset: 2 },
      { name: 'Piano', symbol: '🎹', relX: 0.60, freqType: 'mid', bounceOffset: 3 },
      { name: 'Harp', symbol: '🎼', relX: 0.74, freqType: 'treble', bounceOffset: 4 },
      { name: 'Vinyl Record', symbol: '📀', relX: 0.86, freqType: 'treble', bounceOffset: 5 }
    ];
  }

  function drawFloatingInstruments(w, h, palette) {
    const baseY = h * 0.58;

    state.floatingInstruments.forEach((inst) => {
      const ix = inst.relX * w;
      let energy = 0;
      if (inst.freqType === 'bass') energy = state.bassEnergy + state.beatPulse * 0.5;
      else if (inst.freqType === 'mid') energy = state.midEnergy;
      else energy = state.trebleEnergy;

      const floatY = baseY - (energy * 100 + Math.sin(time * 3 + inst.bounceOffset) * 18);
      const scale = 1.0 + energy * 0.45;

      ctx.save();
      ctx.translate(ix, floatY);
      ctx.scale(scale, scale);

      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 10, 25, 0.75)';
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 2 + energy * 3;
      ctx.shadowBlur = 20 + energy * 20;
      ctx.shadowColor = palette.primary;
      ctx.fill();
      ctx.stroke();

      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(inst.symbol, 0, 2);

      ctx.restore();
    });
  }

  // --- ⚡ MUSIC PRODUCTION STUDIO ROOM ENVIRONMENT ---
  function drawStudioRoomEnvironment(w, h, palette) {
    const foamCols = 16;
    const foamRows = 8;
    const cellW = w / foamCols;
    const cellH = (h * 0.72) / foamRows;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    for (let r = 0; r < foamRows; r++) {
      for (let c = 0; c < foamCols; c++) {
        const fx = c * cellW;
        const fy = r * cellH;
        ctx.strokeRect(fx, fy, cellW, cellH);

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + cellW / 2, fy + cellH / 2);
        ctx.lineTo(fx + cellW, fy);
        ctx.stroke();
      }
    }
    ctx.restore();

    const neonBarW = 12;
    const neonBarH = h * 0.55;
    const leftNeonX = 24;
    const rightNeonX = w - 36;
    const neonY = h * 0.12;

    const neonGrad = ctx.createLinearGradient(0, neonY, 0, neonY + neonBarH);
    neonGrad.addColorStop(0, palette.primary);
    neonGrad.addColorStop(0.5, palette.secondary);
    neonGrad.addColorStop(1, palette.tertiary);

    ctx.fillStyle = neonGrad;
    ctx.shadowBlur = 25 + state.trebleEnergy * 25 + state.beatPulse * 20;
    ctx.shadowColor = palette.primary;

    ctx.fillRect(leftNeonX, neonY, neonBarW, neonBarH);
    ctx.fillRect(rightNeonX, neonY, neonBarW, neonBarH);

    const speakerW = Math.min(110, Math.max(50, w * 0.15));
    const speakerH = speakerW * 2.0;
    const speakerY = h * 0.42;

    const leftSpeakerX = Math.max(8, w * 0.04);
    const rightSpeakerX = Math.min(w - speakerW - 8, w * 0.96 - speakerW);

    [leftSpeakerX, rightSpeakerX].forEach(sx => {
      ctx.fillStyle = '#0a0d18';
      ctx.strokeStyle = palette.primary;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = palette.primary;
      ctx.fillRect(sx, speakerY, speakerW, speakerH);
      ctx.strokeRect(sx, speakerY, speakerW, speakerH);

      ctx.beginPath();
      ctx.arc(sx + speakerW / 2, speakerY + (speakerH * 0.2), speakerW * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = '#151c2e';
      ctx.fill();
      ctx.strokeStyle = palette.secondary;
      ctx.stroke();

      const wooferRadius = (speakerW * 0.35) + state.bassEnergy * 14 + state.beatPulse * 10;
      ctx.beginPath();
      ctx.arc(sx + speakerW / 2, speakerY + (speakerH * 0.65), wooferRadius, 0, Math.PI * 2);
      const wooferGrad = ctx.createRadialGradient(sx + speakerW / 2, speakerY + 145, 5, sx + speakerW / 2, speakerY + 145, wooferRadius);
      wooferGrad.addColorStop(0, '#ffffff');
      wooferGrad.addColorStop(0.4, palette.primary);
      wooferGrad.addColorStop(1, '#080c14');
      ctx.fillStyle = wooferGrad;
      ctx.shadowBlur = 18 + state.bassEnergy * 15;
      ctx.shadowColor = palette.primary;
      ctx.fill();
      ctx.stroke();
    });

    const deskY = h * 0.72;
    const deskH = h - deskY;
    const deskGrad = ctx.createLinearGradient(0, deskY, 0, h);
    deskGrad.addColorStop(0, '#0e1220');
    deskGrad.addColorStop(0.4, '#080a14');
    deskGrad.addColorStop(1, '#020308');

    ctx.fillStyle = deskGrad;
    ctx.fillRect(0, deskY, w, deskH);

    ctx.beginPath();
    ctx.moveTo(0, deskY);
    ctx.lineTo(w, deskY);
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 3 + state.beatPulse * 2;
    ctx.shadowBlur = 18;
    ctx.shadowColor = palette.primary;
    ctx.stroke();

    const channelCount = 14;
    const chanW = (w * 0.6) / channelCount;
    const chanStartX = (w - channelCount * chanW) / 2;

    for (let c = 0; c < channelCount; c++) {
      const cx = chanStartX + c * chanW;

      ctx.beginPath();
      ctx.moveTo(cx + chanW / 2, deskY + 18);
      ctx.lineTo(cx + chanW / 2, deskY + 75);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const freqIndex = Math.floor((c / channelCount) * (frequencyData ? frequencyData.length * 0.7 : 1));
      const ampVal = frequencyData ? (frequencyData[freqIndex] / 255) : 0.3;
      const knobY = deskY + 75 - ampVal * 50;

      ctx.fillStyle = c % 2 === 0 ? palette.primary : palette.secondary;
      ctx.shadowBlur = 8;
      ctx.shadowColor = palette.primary;
      ctx.fillRect(cx + chanW / 2 - 8, knobY - 5, 16, 10);
    }

    // --- FLOATING MUSIC NOTES (🎵 🎶 🎼 ♩ ♪) ---
    if (Math.random() < 0.18 || state.beatDetected) {
      const symbols = ['🎵', '🎶', '🎼', '♩', '♪'];
      state.floatingNotes.push({
        x: Math.random() * w * 0.75 + w * 0.12,
        y: deskY - 10,
        vy: -(Math.random() * 1.8 + 1.2 + state.smoothMid * 2),
        vx: (Math.random() - 0.5) * 0.9,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: Math.random() * 16 + 20,
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        opacity: 1.0,
        color: Math.random() > 0.5 ? palette.primary : palette.secondary
      });
    }

    ctx.save();
    for (let fn = state.floatingNotes.length - 1; fn >= 0; fn--) {
      const note = state.floatingNotes[fn];
      note.y += note.vy * 60 * deltaTime;
      note.x += (note.vx + Math.sin(time * 2 + fn) * 0.5) * 60 * deltaTime;
      note.rotation += note.rotSpeed;
      note.opacity -= deltaTime * 0.35;

      if (note.opacity <= 0 || note.y < -30) {
        state.floatingNotes.splice(fn, 1);
        continue;
      }

      ctx.save();
      ctx.translate(note.x, note.y);
      ctx.rotate(note.rotation);
      ctx.font = `${note.size * (1 + state.smoothTreble * 0.4)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = note.color;
      ctx.globalAlpha = note.opacity;
      ctx.shadowBlur = 15;
      ctx.shadowColor = note.color;
      ctx.fillText(note.symbol, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  let time = 0;
  let lastFrameTime = 0;
  let deltaTime = 0.016;

  function renderLoop(timestamp) {
    // Delta-time calculation for frame-rate independent smoothness
    if (lastFrameTime === 0) lastFrameTime = timestamp;
    deltaTime = Math.min(0.05, (timestamp - lastFrameTime) / 1000); // cap at 50ms (20fps min)
    lastFrameTime = timestamp;
    time += deltaTime;

    if (state.isPlaying) {
      updateAudioAnalysis();
      updateLyricSync();
      updateMusicAutoPaletteSync();
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const palette = palettes[state.palette];

    // INSTANT ZERO-DELAY CANVAS BACKGROUND CLEAR MATCHING ACTIVE PALETTE
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    // --- SMOOTH MODE TRANSITION CROSSFADE ---
    if (state.modeTransition > 0) {
      state.modeTransition = Math.max(0, state.modeTransition - deltaTime * state.modeTransitionSpeed);

      // Draw previous mode fading out
      if (state.prevMode && state.modeTransition > 0) {
        ctx.save();
        ctx.globalAlpha = state.modeTransition;
        drawModeScene(state.prevMode, w, h, palette);
        ctx.restore();
      }

      // Draw current mode fading in
      ctx.save();
      ctx.globalAlpha = 1 - state.modeTransition;
      drawModeScene(state.mode, w, h, palette);
      ctx.restore();
    } else {
      drawModeScene(state.mode, w, h, palette);
    }

    drawRipples(palette);
    updatePlaybackProgress();

    requestAnimationFrame(renderLoop);
  }

  // Extracted mode drawing into its own function for crossfade reuse
  function drawModeScene(mode, w, h, palette) {
    switch (mode) {
      case 'lotus':
        drawSacredLotus(w, h, palette);
        drawSacredGarden(w, h, palette);
        break;
      case 'ocean':
        drawCyberWaves(w, h, palette);
        break;
      case 'starburst':
        drawGalaxyStarburst(w, h, palette);
        drawMeteors(palette);
        break;
      case 'equalizer':
        drawStudioRoomEnvironment(w, h, palette);
        draw3DSpectrumEqualizer(w, h, palette);
        drawFloatingInstruments(w, h, palette);
        break;
    }
  }

  // --------------------------------------------------------------------------
  // 1. 🌸 SACRED LOTUS
  // --------------------------------------------------------------------------
  function drawSacredLotus(w, h, palette) {
    const cx = w / 2;
    const cy = h / 2;
    const petals = 18;

    const lotusScale = Math.min(1.0, Math.max(0.48, w / 950));
    const baseRadius = (100 * lotusScale) + state.bassEnergy * 70 * lotusScale + state.beatPulse * 35 * lotusScale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * (0.15 + state.melodyPitch * 0.2));

    const ringRadius = baseRadius * (1.35 + state.trebleEnergy * 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = palette.secondary;
    ctx.lineWidth = 2 + state.midEnergy * 6 + state.beatPulse * 4;
    ctx.shadowBlur = 22;
    ctx.shadowColor = palette.primary;
    ctx.stroke();

    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const freqIndex = Math.floor((i / petals) * (frequencyData ? frequencyData.length * 0.6 : 10));
      const freqAmp = frequencyData ? (frequencyData[freqIndex] / 255) * state.sensitivity : 0.2;
      const petalLength = baseRadius + freqAmp * 140 + state.midEnergy * 50;

      ctx.save();
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(28 + freqAmp * 20, -petalLength / 2, 0, -petalLength);
      ctx.quadraticCurveTo(-28 - freqAmp * 20, -petalLength / 2, 0, 0);

      const grad = ctx.createLinearGradient(0, 0, 0, -petalLength);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0.08)');
      grad.addColorStop(0.6, palette.secondary);
      grad.addColorStop(1, palette.primary);

      ctx.fillStyle = grad;
      ctx.shadowBlur = 15 + state.beatPulse * 15;
      ctx.shadowColor = palette.primary;
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + state.trebleEnergy * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }

    const coreRadius = 32 + state.bassEnergy * 25 + state.beatPulse * 20;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    const coreGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, coreRadius + 15);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, palette.primary);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.fill();

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // 2. 🌊 CYBER WAVES
  // --------------------------------------------------------------------------
  function drawCyberWaves(w, h, palette) {
    const moonX = w * 0.82;
    const moonY = h * 0.24;
    ctx.save();
    ctx.beginPath();
    ctx.arc(moonX, moonY, 48 + state.bassEnergy * 15, 0, Math.PI * 2);
    const moonGrad = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 70);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.5, palette.primary);
    moonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGrad;
    ctx.shadowBlur = 35 + state.beatPulse * 20;
    ctx.shadowColor = palette.primary;
    ctx.fill();
    ctx.restore();

    const waveCount = 5;
    const cy = h * 0.68;
    let boatWaveY = cy;

    for (let i = 0; i < waveCount; i++) {
      ctx.beginPath();
      ctx.moveTo(0, h);

      const waveFreqShift = i * 0.4;
      const baseAmp = 35 + (i + 1) * 18 * (state.midEnergy * 1.5 + state.bassEnergy * 0.8 + 0.4);

      ctx.lineTo(0, cy);
      const points = [];
      const segmentWidth = w / 8;

      for (let s = 0; s <= 8; s++) {
        const px = s * segmentWidth;
        const binIndex = Math.floor((s / 8) * (frequencyData ? frequencyData.length * 0.6 : 1));
        const audioAmp = frequencyData ? (frequencyData[binIndex] / 255) * 50 * state.sensitivity : 10;
        const py = cy + Math.sin(s * 0.5 + time * (1.2 + i * 0.3) + waveFreqShift) * baseAmp - audioAmp;
        points.push({ x: px, y: py });
      }

      for (let p = 0; p < points.length - 1; p++) {
        const p1 = points[p];
        const p2 = points[p + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }

      ctx.lineTo(w, h);
      ctx.closePath();

      const waveGrad = ctx.createLinearGradient(0, cy - 120, 0, h);
      if (i === 0) {
        waveGrad.addColorStop(0, palette.primary);
        waveGrad.addColorStop(1, 'rgba(5, 5, 10, 0.92)');
      } else if (i === 1) {
        waveGrad.addColorStop(0, palette.secondary);
        waveGrad.addColorStop(1, 'rgba(5, 5, 10, 0.82)');
      } else {
        waveGrad.addColorStop(0, palette.tertiary);
        waveGrad.addColorStop(1, 'rgba(5, 5, 10, 0.7)');
      }

      ctx.fillStyle = waveGrad;
      ctx.globalAlpha = 0.38 + i * 0.12;
      ctx.shadowBlur = 20 + state.beatPulse * 15;
      ctx.shadowColor = palette.primary;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      if (i === 0) boatWaveY = cy + Math.sin(time * 1.5) * 25 - state.bassEnergy * 30;
    }

    const boatX = w * 0.35;
    const boatY = boatWaveY - 10;
    const boatTilt = Math.sin(time * 2) * 0.12 + (state.bassEnergy - 0.5) * 0.1;

    ctx.save();
    ctx.translate(boatX, boatY);
    ctx.rotate(boatTilt);

    ctx.beginPath();
    ctx.moveTo(-45, 0);
    ctx.quadraticCurveTo(0, 22, 55, 0);
    ctx.lineTo(40, -12);
    ctx.lineTo(-35, -12);
    ctx.closePath();
    ctx.fillStyle = '#0a1020';
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = palette.primary;
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(5, -12);
    ctx.lineTo(5, -75);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(5, -70);
    ctx.lineTo(45, -35);
    ctx.lineTo(5, -15);
    ctx.closePath();
    const sailGrad = ctx.createLinearGradient(5, -70, 45, -15);
    sailGrad.addColorStop(0, palette.primary);
    sailGrad.addColorStop(1, palette.secondary);
    ctx.fillStyle = sailGrad;
    ctx.shadowBlur = 18;
    ctx.shadowColor = palette.primary;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(5, -75, 5 + state.beatPulse * 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = palette.primary;
    ctx.fill();

    ctx.restore();

    // --- WATER SPLASHES & OCEAN SPRAY PARTICLES ---
    if (state.beatDetected || Math.random() < 0.35) {
      state.waveSplashes.push({
        x: boatX + (Math.random() - 0.5) * 50,
        y: boatY + 6,
        vx: (Math.random() - 0.5) * 3 - 1.2,
        vy: -(Math.random() * 5 + 3 + state.smoothBass * 5),
        gravity: 0.28,
        radius: Math.random() * 3 + 1.5,
        opacity: 0.9,
        color: Math.random() > 0.5 ? palette.primary : palette.secondary
      });
    }

    ctx.save();
    for (let sp = state.waveSplashes.length - 1; sp >= 0; sp--) {
      const splash = state.waveSplashes[sp];
      splash.x += splash.vx * 60 * deltaTime;
      splash.y += splash.vy * 60 * deltaTime;
      splash.vy += splash.gravity * 60 * deltaTime;
      splash.opacity -= deltaTime * 0.9;

      if (splash.opacity <= 0 || splash.y > h) {
        state.waveSplashes.splice(sp, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(splash.x, splash.y, splash.radius * (1 + state.smoothBass * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = splash.color;
      ctx.globalAlpha = splash.opacity;
      ctx.shadowBlur = 10;
      ctx.shadowColor = splash.color;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
    ctx.restore();

    state.particles.forEach((p, idx) => {
      p.x += p.vx * (1 + state.trebleEnergy * 3.5 + state.beatPulse * 2);
      p.y += p.vy * (1 + state.bassEnergy * 3.5 + state.beatPulse * 2);

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * (1 + state.midEnergy * 1.2), 0, Math.PI * 2);
      ctx.fillStyle = idx % 2 === 0 ? palette.primary : palette.secondary;
      ctx.shadowBlur = 10 + state.trebleEnergy * 10;
      ctx.shadowColor = palette.primary;
      ctx.fill();
    });
  }

  // --------------------------------------------------------------------------
  // 3. 🌌 GALAXY STARBURST + COSMIC TRAIL + SPARKLING STARS SYSTEM
  // --------------------------------------------------------------------------
  function initSparklingStars() {
    state.sparklingStars = [];
    for (let s = 0; s < 140; s++) {
      state.sparklingStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 2.8 + 1.2,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 2.5 + 1.0,
        colorIdx: Math.floor(Math.random() * 3)
      });
    }
  }

  function drawSparklingStars(w, h, palette) {
    const colors = [palette.primary, palette.secondary, palette.tertiary];
    ctx.save();
    state.sparklingStars.forEach((star) => {
      star.phase += deltaTime * star.twinkleSpeed;
      const twinkleAlpha = Math.abs(Math.sin(star.phase)) * 0.75 + 0.25 + state.smoothTreble * 0.25;

      const starColor = colors[star.colorIdx];
      const r = star.radius * (1 + state.smoothTreble * 0.6);

      // Draw 4-Point Starburst Sparkle
      ctx.beginPath();
      ctx.moveTo(star.x - r * 2.5, star.y);
      ctx.lineTo(star.x + r * 2.5, star.y);
      ctx.moveTo(star.x, star.y - r * 2.5);
      ctx.lineTo(star.x, star.y + r * 2.5);
      ctx.strokeStyle = starColor;
      ctx.lineWidth = 1;
      ctx.globalAlpha = Math.min(1.0, twinkleAlpha * 0.7);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = Math.min(1.0, twinkleAlpha);
      ctx.shadowBlur = 8;
      ctx.shadowColor = starColor;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  function initGalaxyTrails() {
    state.galaxyTrails = [];
    state.nebulaNodes = [];

    // Comet trail particles — orbit around center with fading tails
    for (let t = 0; t < 40; t++) {
      state.galaxyTrails.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 280 + 80,
        speed: (Math.random() * 0.012 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 3 + 1.5,
        trail: [],      // Array of {x, y} positions for fading tail
        maxTrail: Math.floor(Math.random() * 18 + 12),
        colorIdx: Math.floor(Math.random() * 3) // 0=primary, 1=secondary, 2=tertiary
      });
    }

    // Nebula cloud nodes — soft radial gradient blobs
    for (let n = 0; n < 8; n++) {
      state.nebulaNodes.push({
        relX: Math.random() * 0.7 + 0.15,
        relY: Math.random() * 0.7 + 0.15,
        radius: Math.random() * 120 + 60,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.003 + 0.001,
        driftDist: Math.random() * 40 + 20,
        colorIdx: Math.floor(Math.random() * 3)
      });
    }

    // 🪐 Orbiting 3D Planets System
    state.planets = [
      {
        name: 'Crimson Terrestrial',
        orbitRadius: 160,
        speed: 0.28,
        size: 13,
        angle: 4.2,
        colorCore: '#ff007f',
        colorEdge: '#4a0022',
        hasRings: false,
        moons: []
      },
      {
        name: 'Ice Giant',
        orbitRadius: 250,
        speed: -0.18,
        size: 18,
        angle: 2.1,
        colorCore: '#00f2fe',
        colorEdge: '#06283d',
        hasRings: true,
        ringColor1: 'rgba(0, 242, 254, 0.65)',
        ringColor2: 'rgba(79, 172, 254, 0.25)',
        ringRadiusX: 34,
        ringRadiusY: 9,
        tilt: -0.25,
        moons: [{ radius: 4, dist: 28, speed: -2.2, angle: 1.2, color: '#a8ff78' }]
      },
      {
        name: 'Ringed Golden Gas Giant',
        orbitRadius: 360,
        speed: 0.12,
        size: 26,
        angle: 0.6,
        colorCore: '#ffd700',
        colorEdge: '#7d5a00',
        hasRings: true,
        ringColor1: 'rgba(255, 215, 0, 0.8)',
        ringColor2: 'rgba(255, 101, 163, 0.4)',
        ringRadiusX: 52,
        ringRadiusY: 15,
        tilt: 0.38,
        moons: [
          { radius: 5, dist: 42, speed: 1.8, angle: 0, color: '#ffffff' },
          { radius: 3.5, dist: 54, speed: -1.2, angle: 3.1, color: '#a060ff' }
        ]
      },
      {
        name: 'Emerald Aurora Planet',
        orbitRadius: 470,
        speed: -0.08,
        size: 21,
        angle: 5.4,
        colorCore: '#78ffd6',
        colorEdge: '#0a4232',
        hasRings: true,
        ringColor1: 'rgba(120, 255, 214, 0.75)',
        ringColor2: 'rgba(168, 255, 120, 0.3)',
        ringRadiusX: 42,
        ringRadiusY: 11,
        tilt: 0.42,
        moons: [{ radius: 4.5, dist: 35, speed: 1.4, angle: 2.5, color: '#ffffff' }]
      }
    ];
  }

  function drawGalaxyStarburst(w, h, palette) {
    const cx = w / 2;
    const cy = h / 2;

    // --- SPARKLING STARS OUTSIDE ---
    drawSparklingStars(w, h, palette);

    // --- NEBULA CLOUDS (soft background galaxy haze) ---
    ctx.save();
    state.nebulaNodes.forEach((neb) => {
      neb.driftAngle += neb.driftSpeed;
      const nx = neb.relX * w + Math.cos(neb.driftAngle) * neb.driftDist;
      const ny = neb.relY * h + Math.sin(neb.driftAngle) * neb.driftDist;
      const pulsedR = neb.radius + state.bassEnergy * 40 + state.beatPulse * 25;

      const colors = [palette.primary, palette.secondary, palette.tertiary];
      const nebColor = colors[neb.colorIdx];

      const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, pulsedR);
      nebGrad.addColorStop(0, nebColor);
      nebGrad.addColorStop(0.4, nebColor);
      nebGrad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(nx, ny, pulsedR, 0, Math.PI * 2);
      ctx.fillStyle = nebGrad;
      ctx.globalAlpha = 0.06 + state.overallEnergy * 0.06;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
    ctx.restore();

    // --- SPIRAL ARMS ---
    const spiralArms = 3;
    const pointsPerArm = 50;
    const spiralRotation = time * (0.2 + state.melodyPitch * 0.3);

    for (let arm = 0; arm < spiralArms; arm++) {
      const armAngleOffset = (arm / spiralArms) * Math.PI * 2;

      // Draw a thick, glowing spiral arm "band"
      ctx.beginPath();
      for (let pt = 0; pt < pointsPerArm; pt++) {
        const r = pt * 7.5 + state.bassEnergy * 35;
        const theta = pt * 0.18 + armAngleOffset + spiralRotation;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r;

        if (pt === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      ctx.strokeStyle = arm % 2 === 0 ? palette.primary : palette.secondary;
      ctx.lineWidth = 2 + state.midEnergy * 4 + state.beatPulse * 3;
      ctx.shadowBlur = 20 + state.beatPulse * 15;
      ctx.shadowColor = palette.primary;
      ctx.globalAlpha = 0.45;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Galaxy dust along the arm (small dim dots following the spiral path)
      ctx.save();
      for (let pt = 2; pt < pointsPerArm; pt += 2) {
        const r = pt * 7.5 + state.bassEnergy * 35;
        const theta = pt * 0.18 + armAngleOffset + spiralRotation;
        const scatter = (Math.random() - 0.5) * 22;
        const px = cx + Math.cos(theta) * r + Math.cos(theta + 1.57) * scatter;
        const py = cy + Math.sin(theta) * r + Math.sin(theta + 1.57) * scatter;

        ctx.beginPath();
        ctx.arc(px, py, 1 + Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = arm % 3 === 0 ? palette.primary : arm % 3 === 1 ? palette.secondary : palette.tertiary;
        ctx.globalAlpha = 0.2 + Math.random() * 0.25;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
      ctx.restore();
    }

    // --- BEAT STARBURST RAYS ---
    if (state.beatPulse > 0.15) {
      const rayCount = 14;
      for (let r = 0; r < rayCount; r++) {
        const rayAngle = (r / rayCount) * Math.PI * 2 + time * 0.5;
        const rayLen = 160 + state.beatPulse * 260;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rayAngle) * rayLen, cy + Math.sin(rayAngle) * rayLen);
        ctx.strokeStyle = `rgba(255, 215, 0, ${state.beatPulse * 0.45})`;
        ctx.lineWidth = 2 + state.beatPulse * 3.5;
        ctx.stroke();
      }
    }

    // --- COMET TRAIL PARTICLES (orbiting with fading tails) ---
    ctx.save();
    const colors = [palette.primary, palette.secondary, palette.tertiary];
    state.galaxyTrails.forEach((gt) => {
      gt.angle += gt.speed * (1 + state.overallEnergy * 3 + state.beatPulse * 2);
      const currentDist = gt.dist + Math.sin(time * 1.8 + gt.angle * 3) * 35 + state.bassEnergy * 50;
      const px = cx + Math.cos(gt.angle) * currentDist;
      const py = cy + Math.sin(gt.angle) * currentDist;

      // Push position onto trail history
      gt.trail.push({ x: px, y: py });
      if (gt.trail.length > gt.maxTrail) gt.trail.shift();

      // Draw fading trail
      const trailColor = colors[gt.colorIdx];
      for (let t = 0; t < gt.trail.length - 1; t++) {
        const progress = t / gt.trail.length;
        ctx.beginPath();
        ctx.moveTo(gt.trail[t].x, gt.trail[t].y);
        ctx.lineTo(gt.trail[t + 1].x, gt.trail[t + 1].y);
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = gt.size * progress;
        ctx.globalAlpha = progress * 0.5;
        ctx.stroke();
      }

      // Head glow
      ctx.beginPath();
      ctx.arc(px, py, gt.size + state.midEnergy * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10 + state.beatPulse * 8;
      ctx.shadowColor = trailColor;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });
    ctx.restore();

    // --- ORBITING PARTICLES ---
    state.particles.forEach((p, i) => {
      p.angle += p.speed * (1 + state.bassEnergy * 2.5 + state.melodyPitch * 2);
      const currentDist = p.dist + Math.sin(time * 2.5 + i) * 25 + state.bassEnergy * 90 + state.beatPulse * 45;
      const px = cx + Math.cos(p.angle) * currentDist;
      const py = cy + Math.sin(p.angle) * currentDist;

      if (i % 5 === 0) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.04 + state.trebleEnergy * 0.25})`;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(px, py, p.radius + state.midEnergy * 4 + state.beatPulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = i % 3 === 0 ? palette.primary : i % 3 === 1 ? palette.secondary : palette.tertiary;
      ctx.shadowBlur = 14 + state.midEnergy * 10;
      ctx.shadowColor = palette.primary;
      ctx.fill();
    });

    // --- GALAXY CORE ---
    ctx.beginPath();
    ctx.arc(cx, cy, 50 + state.bassEnergy * 45 + state.beatPulse * 25, 0, Math.PI * 2);
    const starGrad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 95);
    starGrad.addColorStop(0, '#ffffff');
    starGrad.addColorStop(0.4, palette.primary);
    starGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = starGrad;
    ctx.fill();

    // --- 🪐 ORBITING 3D PLANETS SYSTEM ---
    const orbitScale = Math.min(1.0, Math.max(0.42, w / 950));
    state.planets.forEach((planet) => {
      planet.angle += planet.speed * deltaTime * (1 + state.smoothOverall * 1.5);
      const baseOrbitR = planet.orbitRadius * orbitScale;
      const currentOrbitR = baseOrbitR + Math.sin(time * 0.8 + planet.angle) * (15 * orbitScale) + state.smoothBass * (40 * orbitScale);
      const px = cx + Math.cos(planet.angle) * currentOrbitR;
      const py = cy + Math.sin(planet.angle) * currentOrbitR * 0.65; // Perspective tilt

      const planetSize = (planet.size * orbitScale) + state.smoothMid * 6 * orbitScale + state.beatPulse * 4 * orbitScale;

      // 1. Orbital Ring Guide Line
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, currentOrbitR, currentOrbitR * 0.65, 0, 0, Math.PI * 2);
      ctx.strokeStyle = planet.colorCore;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.12 + state.smoothMid * 0.1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Back Half of Planetary Ring (if any)
      if (planet.hasRings) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(planet.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.ringRadiusX + state.beatPulse * 5, planet.ringRadiusY, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = planet.ringColor1;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = planet.ringColor1;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Planet Atmosphere Outer Glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, planetSize * 1.5, 0, Math.PI * 2);
      const atmosGrad = ctx.createRadialGradient(px, py, planetSize * 0.8, px, py, planetSize * 1.6);
      atmosGrad.addColorStop(0, planet.colorCore);
      atmosGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = atmosGrad;
      ctx.globalAlpha = 0.4 + state.beatPulse * 0.3;
      ctx.fill();
      ctx.restore();

      // 4. Planet 3D Sphere (shaded relative to light from core at cx, cy)
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, planetSize, 0, Math.PI * 2);

      // Vector towards light source (core at cx, cy)
      const dx = cx - px;
      const dy = cy - py;
      const dist = Math.hypot(dx, dy);
      const lightX = px + (dx / dist) * (planetSize * 0.4);
      const lightY = py + (dy / dist) * (planetSize * 0.4);

      const sphereGrad = ctx.createRadialGradient(lightX, lightY, planetSize * 0.1, px, py, planetSize);
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.35, planet.colorCore);
      sphereGrad.addColorStop(1, planet.colorEdge);

      ctx.fillStyle = sphereGrad;
      ctx.shadowBlur = 15 + state.beatPulse * 10;
      ctx.shadowColor = planet.colorCore;
      ctx.fill();
      ctx.restore();

      // 5. Front Half of Planetary Ring
      if (planet.hasRings) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(planet.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, planet.ringRadiusX + state.beatPulse * 5, planet.ringRadiusY, 0, 0, Math.PI);
        ctx.strokeStyle = planet.ringColor1;
        ctx.lineWidth = 3.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = planet.ringColor1;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(0, 0, (planet.ringRadiusX + 6) + state.beatPulse * 5, planet.ringRadiusY + 2, 0, 0, Math.PI);
        ctx.strokeStyle = planet.ringColor2;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Orbiting Moons
      if (planet.moons && planet.moons.length > 0) {
        planet.moons.forEach((moon) => {
          moon.angle += moon.speed * deltaTime * (1 + state.smoothTreble * 2);
          const mx = px + Math.cos(moon.angle) * moon.dist;
          const my = py + Math.sin(moon.angle) * (moon.dist * 0.45);

          ctx.save();
          ctx.beginPath();
          ctx.arc(mx, my, moon.radius, 0, Math.PI * 2);
          ctx.fillStyle = moon.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = moon.color;
          ctx.fill();
          ctx.restore();
        });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. ⚡ 3D SPECTRUM EQUALIZER
  // --------------------------------------------------------------------------
  function draw3DSpectrumEqualizer(w, h, palette) {
    if (!frequencyData) return;

    const barCount = 48;
    const barWidth = (w * 0.62) / barCount;
    const startX = (w - barCount * barWidth) / 2;
    const baseY = h * 0.72;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * (frequencyData.length * 0.75));
      const rawVal = (frequencyData[dataIndex] / 255) * state.sensitivity;
      const barHeight = Math.max(8, rawVal * (h * 0.40) + (i < 8 ? state.beatPulse * 40 : 0));

      const x = startX + i * barWidth;
      const y = baseY - barHeight;

      const barGrad = ctx.createLinearGradient(0, baseY, 0, y);
      barGrad.addColorStop(0, palette.secondary);
      barGrad.addColorStop(0.6, palette.primary);
      barGrad.addColorStop(1, '#ffffff');

      ctx.fillStyle = barGrad;
      ctx.shadowBlur = 12 + state.beatPulse * 8;
      ctx.shadowColor = palette.primary;
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 2, y - 4, barWidth - 4, 3);

      ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + state.beatPulse * 0.12})`;
      ctx.fillRect(x + 2, baseY + 6, barWidth - 4, barHeight * 0.25);
    }

    ctx.beginPath();
    ctx.moveTo(startX - 20, baseY);
    ctx.lineTo(startX + barCount * barWidth + 20, baseY);
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 3 + state.beatPulse * 2;
    ctx.shadowBlur = 15 + state.beatPulse * 15;
    ctx.shadowColor = palette.primary;
    ctx.stroke();
  }

  function drawRipples(palette) {
    for (let i = state.ripples.length - 1; i >= 0; i--) {
      const r = state.ripples[i];
      r.radius += r.speed;
      r.opacity -= 0.015;

      if (r.opacity <= 0 || r.radius >= r.maxRadius) {
        state.ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3;
      ctx.globalAlpha = r.opacity;
      ctx.shadowBlur = 18;
      ctx.shadowColor = r.color;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }

  function updatePlaybackProgress() {
    if (!audioElement || isNaN(audioElement.duration)) return;

    const current = audioElement.currentTime;
    const duration = audioElement.duration;
    const pct = (current / duration) * 100;

    progressFill.style.width = `${pct}%`;
    progressHandle.style.left = `${pct}%`;

    currentTimeText.textContent = formatTime(current);
    durationTimeText.textContent = formatTime(duration);
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  }

  function toggleVideoRecording() {
    initAudioContext();
    if (state.isRecording) {
      stopVideoRecording();
    } else {
      startVideoRecording();
    }
  }

  function startVideoRecording() {
    try {
      const canvasStream = canvas.captureStream(60);
      const combinedStream = new MediaStream();

      canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
      if (mediaStreamDestination && mediaStreamDestination.stream) {
        mediaStreamDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
      }

      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      state.mediaRecorder = new MediaRecorder(combinedStream, options);
      state.recordedChunks = [];

      state.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          state.recordedChunks.push(e.data);
        }
      };

      state.mediaRecorder.onstop = exportRecordedVideo;

      state.mediaRecorder.start(100);
      state.isRecording = true;
      state.recordingStartTime = Date.now();

      recordingBadge.classList.add('active');
      recordVideoBtn.classList.add('btn-accent');
      recordVideoBtn.textContent = '⏹ Stop & Download Video';

      state.recordingTimerInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - state.recordingStartTime) / 1000);
        recTimeEl.textContent = formatTime(elapsedSec);
      }, 1000);

      if (!state.isPlaying) {
        togglePlayPause();
      }
    } catch (err) {
      alert('Error initializing video recorder: ' + err.message);
      console.error(err);
    }
  }

  function stopVideoRecording() {
    if (!state.mediaRecorder) return;
    state.mediaRecorder.stop();
    state.isRecording = false;

    recordingBadge.classList.remove('active');
    recordVideoBtn.textContent = '🎥 Export Video';

    if (state.recordingTimerInterval) {
      clearInterval(state.recordingTimerInterval);
    }
  }

  function exportRecordedVideo() {
    const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `Aphrodite_Lyric_Video_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  function setupEventListeners() {
    playPauseBtn.addEventListener('click', togglePlayPause);

    if (replayBtn) {
      replayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioElement.currentTime = 0;
        if (referenceVideo) referenceVideo.currentTime = 0;
        if (!state.isPlaying) {
          togglePlayPause();
        }
      });
    }

    if (loopBtn) {
      loopBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.isLooping = !state.isLooping;
        audioElement.loop = state.isLooping;
        loopBtn.classList.toggle('active', state.isLooping);
        loopBtn.title = state.isLooping ? 'Toggle Track Loop (Loop ON)' : 'Toggle Track Loop (Loop OFF)';
      });
    }

    audioElement.addEventListener('ended', () => {
      if (state.isLooping) {
        audioElement.currentTime = 0;
        audioElement.play();
      } else {
        state.isPlaying = false;
        playIcon.textContent = '▶';
      }
    });

    progressContainer.addEventListener('click', (e) => {
      if (!audioElement.duration) return;
      const rect = progressContainer.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      const targetTime = clickPos * audioElement.duration;
      audioElement.currentTime = targetTime;
      if (referenceVideo) referenceVideo.currentTime = targetTime;
    });

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        audioElement.volume = val;
        if (volValEl) volValEl.textContent = `${Math.round(val * 100)}%`;
        if (volMuteBtn) volMuteBtn.textContent = val === 0 ? '🔇' : '🔊';
      });
    }

    if (sensitivitySlider) {
      sensitivitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.sensitivity = val;
        if (sensValEl) sensValEl.textContent = `${val.toFixed(1)}x`;
      });
    }

    if (volMuteBtn) {
      volMuteBtn.addEventListener('click', () => {
        if (audioElement.volume > 0) {
          lastVolume = audioElement.volume;
          audioElement.volume = 0;
          if (volumeSlider) volumeSlider.value = 0;
          if (volValEl) volValEl.textContent = '0%';
          volMuteBtn.textContent = '🔇';
        } else {
          audioElement.volume = lastVolume || 0.9;
          if (volumeSlider) volumeSlider.value = audioElement.volume;
          if (volValEl) volValEl.textContent = `${Math.round(audioElement.volume * 100)}%`;
          volMuteBtn.textContent = '🔊';
        }
      });
    }

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newMode = btn.getAttribute('data-mode');
        if (newMode === state.mode) return;

        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Trigger smooth crossfade transition
        state.prevMode = state.mode;
        state.mode = newMode;
        state.modeTransition = 1.0;
      });
    });

    document.querySelectorAll('.lyric-style-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.lyric-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.lyricStyle = btn.getAttribute('data-style');

        lyricStage.className = `lyric-stage style-${state.lyricStyle}`;
        if (state.currentLyricIndex !== -1) {
          renderActiveLyricLine(state.currentLyricIndex, audioElement.currentTime);
        }
      });
    });

    // Zero-Delay Live Palette Switcher while Music Plays
    document.querySelectorAll('.palette-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.autoPalette = false; // Disable auto-sync if user manually clicks a palette
        const selectedPalette = btn.getAttribute('data-palette');
        applyPaletteTheme(selectedPalette);
      });
    });

    // Audio Settings Popover Toggle
    if (audioSettingsBtn && audioSettingsPopover) {
      audioSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioSettingsPopover.classList.toggle('active');
      });
    }

    if (closeAudioSettingsBtn && audioSettingsPopover) {
      closeAudioSettingsBtn.addEventListener('click', () => {
        audioSettingsPopover.classList.remove('active');
      });
    }

    if (toggleRefVideoBtn) {
      toggleRefVideoBtn.addEventListener('click', () => {
        refVideoWindow.classList.toggle('active');
        if (refVideoWindow.classList.contains('active') && referenceVideo) {
          referenceVideo.currentTime = audioElement.currentTime;
          if (state.isPlaying) referenceVideo.play();
        }
      });
    }

    if (closeRefVideoBtn) {
      closeRefVideoBtn.addEventListener('click', () => {
        refVideoWindow.classList.remove('active');
        if (referenceVideo) referenceVideo.pause();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    });

    recordVideoBtn.addEventListener('click', toggleVideoRecording);

    window.addEventListener('click', (e) => {
      if (e.target.closest('.control-panel-wrapper') || e.target.closest('.app-header') || e.target.closest('.reference-video-window') || e.target.closest('.audio-settings-popover')) return;

      // Close the audio settings popover if clicking outside
      if (audioSettingsPopover && audioSettingsPopover.classList.contains('active')) {
        audioSettingsPopover.classList.remove('active');
      }

      const palette = palettes[state.palette];
      state.ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 5,
        maxRadius: 200,
        color: palette.primary,
        opacity: 1.0,
        speed: 6
      });
    });

    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });

    micToggleBtn.addEventListener('click', toggleMicrophone);
  }

  function togglePlayPause() {
    initAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (state.isPlaying) {
      audioElement.pause();
      if (referenceVideo) referenceVideo.pause();
      state.isPlaying = false;
      playIcon.textContent = '▶';
    } else {
      audioElement.play();
      if (referenceVideo && refVideoWindow.classList.contains('active')) {
        referenceVideo.currentTime = audioElement.currentTime;
        referenceVideo.play();
      }
      state.isPlaying = true;
      playIcon.textContent = '⏸';
    }
  }

  function toggleMicrophone() {
    initAudioContext();
    if (state.useMic) {
      if (micStreamNode) {
        micStreamNode.disconnect();
      }
      sourceNode.connect(analyser);
      state.useMic = false;
      micToggleBtn.classList.remove('active');
      audioSourceLabel.textContent = 'The Ridleys — Aphrodite';
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          sourceNode.disconnect();
          micStreamNode = audioCtx.createMediaStreamSource(stream);
          micStreamNode.connect(analyser);
          state.useMic = true;
          micToggleBtn.classList.add('active');
          audioSourceLabel.textContent = 'Source: Live Microphone';
        })
        .catch(err => {
          alert('Microphone access required for Live Mic Mode.');
          console.error(err);
        });
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();
