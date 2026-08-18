(function () {
  'use strict';

  var root = document.getElementById('forgeax-evolution');
  if (!root) return;

  var MIN_SCORE = -15;
  var MAX_SCORE = 15;
  var DEFAULT_SCORE = 0;
  var VIDEO_FPS = 30;
  var FRAME_COUNT = 241;
  var STAGES = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0'];
  var slider = root.querySelector('.about-evolution__slider');
  var video = root.querySelector('.about-evolution__video');
  var canvas = root.querySelector('.about-evolution__canvas');
  var loadState = root.querySelector('.about-evolution__load');
  var status = root.querySelector('.about-evolution__status');
  var version = root.querySelector('.about-evolution__version');
  var ghost = root.querySelector('.about-evolution__ghost');
  var stageName = root.querySelector('.about-evolution__stage');
  var stageIndex = root.querySelector('.about-evolution__stage-index');
  var markers = Array.prototype.slice.call(root.querySelectorAll('.about-evolution__markers li'));
  var tickTrack = root.querySelector('.about-evolution__ticks');
  var ticks = [];
  var ready = false;
  var seekFrame = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function modelFor(score) {
    var safe = clamp(score, MIN_SCORE, MAX_SCORE);
    var progress = (safe - MIN_SCORE) / (MAX_SCORE - MIN_SCORE);
    var displayScore = Math.round(safe);
    var frameIndex = displayScore - MIN_SCORE;
    var currentStage = Math.min(STAGES.length - 1, Math.floor(frameIndex / 6));
    return {
      score: safe,
      progress: progress,
      displayScore: displayScore,
      stageIndex: currentStage,
      stage: STAGES[currentStage],
      stageProgress: currentStage === STAGES.length - 1 ? 0 : (frameIndex - currentStage * 6) / 6,
      version: (1 + progress * 5).toFixed(1),
      frame: Math.round(progress * (FRAME_COUNT - 1))
    };
  }

  function resizeCanvas() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    var height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function drawFrame() {
    if (!video.videoWidth || video.readyState < 2) return;
    resizeCanvas();
    var context = canvas.getContext('2d');
    if (!context) return;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  function requestFrame(score) {
    if (!ready || !Number.isFinite(video.duration)) return;
    var model = modelFor(score);
    var last = Math.max(0, video.duration - 1 / VIDEO_FPS);
    var target = model.progress * last;
    cancelAnimationFrame(seekFrame);
    seekFrame = requestAnimationFrame(function () {
      if (Math.abs(video.currentTime - target) < 0.001) {
        drawFrame();
      } else {
        video.currentTime = target;
      }
    });
  }

  function update(score, shouldSeek) {
    var model = modelFor(score);
    root.dataset.stage = String(model.stageIndex);
    root.style.setProperty('--strength', String(model.progress));
    root.style.setProperty('--stage-progress', String(model.stageProgress));
    version.textContent = model.version;
    ghost.textContent = model.stage;
    stageName.textContent = model.stage;
    stageIndex.textContent = 'VER ' + model.stage + ' / 6.0';
    slider.value = String(model.score);
    slider.setAttribute('aria-valuetext', model.version);
    canvas.dataset.frame = String(model.frame).padStart(3, '0');

    ticks.forEach(function (tick, index) {
      tick.classList.toggle('is-active', MIN_SCORE + index <= model.displayScore);
    });
    markers.forEach(function (marker, index) {
      marker.classList.toggle('is-current', index === model.stageIndex);
      marker.classList.toggle('is-passed', index < model.stageIndex);
    });
    if (shouldSeek) requestFrame(model.score);
  }

  for (var i = 0; i < 31; i += 1) {
    var tick = document.createElement('i');
    tickTrack.appendChild(tick);
    ticks.push(tick);
  }

  slider.addEventListener('input', function () {
    update(Number(slider.value), true);
  });

  video.addEventListener('loadeddata', function () {
    ready = true;
    slider.disabled = false;
    loadState.hidden = true;
    status.textContent = root.dataset.ready;
    update(Number(slider.value), true);
    drawFrame();
  }, { once: true });

  video.addEventListener('seeked', drawFrame);
  video.addEventListener('error', function () {
    ready = false;
    slider.disabled = true;
    loadState.hidden = false;
    loadState.classList.add('is-error');
    loadState.textContent = root.dataset.error;
    status.textContent = root.dataset.error;
  }, { once: true });

  window.addEventListener('resize', drawFrame, { passive: true });
  update(DEFAULT_SCORE, false);
  status.textContent = root.dataset.loading;
  video.load();
})();
