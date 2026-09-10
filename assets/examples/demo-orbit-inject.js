/* Injected into engine example pages so production WebGPU demos can drag-orbit.
   Captures World instances as they are attached, then yaws/pitches a perspective
   Camera around the origin. No-ops on 2D/orthographic scenes. */
(function () {
  if (window.__fxDemoOrbit) return;
  window.__fxDemoOrbit = 1;

  try {
    HTMLCanvasElement.prototype.requestPointerLock = function () {
      return Promise.resolve();
    };
  } catch (e) {}

  var origAdd = Set.prototype.add;
  Set.prototype.add = function (value) {
    if (
      value &&
      typeof value.query === 'function' &&
      typeof value.update === 'function' &&
      typeof value.set === 'function' &&
      typeof value.spawn === 'function'
    ) {
      var list = window.__fxWorlds || (window.__fxWorlds = []);
      if (list.indexOf(value) < 0) list.push(value);
    }
    return origAdd.call(this, value);
  };

  function unletterbox() {
    var letterbox = document.getElementById('FX_LETTERBOX');
    if (letterbox && letterbox.parentNode) letterbox.parentNode.removeChild(letterbox);
    var canvas = document.querySelector('#app') || document.querySelector('canvas');
    if (!canvas) return canvas;
    canvas.style.setProperty('width', '100%', 'important');
    canvas.style.setProperty('height', '100%', 'important');
    canvas.style.setProperty('max-width', 'none', 'important');
    canvas.style.setProperty('max-height', 'none', 'important');
    canvas.style.display = 'block';
    var body = document.body;
    if (body) {
      body.style.display = 'block';
      body.style.width = '100%';
      body.style.height = '100%';
      body.style.margin = '0';
      body.style.overflow = 'hidden';
    }
    var html = document.documentElement;
    if (html) {
      html.style.width = '100%';
      html.style.height = '100%';
    }
    return canvas;
  }

  function tokens() {
    var map = window.__fxComp;
    if (!map || typeof map.get !== 'function') return null;
    var Transform = map.get('Transform');
    var Camera = map.get('Camera');
    if (!Transform || !Camera) return null;
    return { Transform: Transform, Camera: Camera };
  }

  function worlds() {
    return window.__fxWorlds || [];
  }

  function cameraOf(world, Camera) {
    try {
      var q = world.query({ read: [Camera] });
      if (!q || !q.ok) return null;
      for (var row of q.value) {
        var got = world.get(row.entity, Camera);
        if (!got || !got.ok) continue;
        if (got.value && got.value.projection === 1) continue;
        return row.entity;
      }
    } catch (e) {}
    return null;
  }

  function readVec3(values, fallback) {
    return [
      Number(values && values[0] != null ? values[0] : fallback[0]),
      Number(values && values[1] != null ? values[1] : fallback[1]),
      Number(values && values[2] != null ? values[2] : fallback[2]),
    ];
  }

  function clampPitch(pitch) {
    var limit = Math.PI / 2 - 0.01;
    return Math.max(-limit, Math.min(limit, pitch));
  }

  function lookQuat(ex, ey, ez, tx, ty, tz) {
    var fx = ex - tx, fy = ey - ty, fz = ez - tz;
    var fl = Math.hypot(fx, fy, fz) || 1;
    fx /= fl; fy /= fl; fz /= fl;
    var rx = fz, ry = 0, rz = -fx;
    var rl = Math.hypot(rx, ry, rz);
    if (rl < 1e-6) { rx = 0; ry = 0; rz = 1; rl = 1; }
    rx /= rl; ry /= rl; rz /= rl;
    var ux = fy * rz - fz * ry, uy = fz * rx - fx * rz, uz = fx * ry - fy * rx;
    var m00 = rx, m01 = ry, m02 = rz, m10 = ux, m11 = uy, m12 = uz, m20 = fx, m21 = fy, m22 = fz;
    var trace = m00 + m11 + m22, qx, qy, qz, qw, s;
    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1);
      qx = (m12 - m21) * s; qy = (m20 - m02) * s; qz = (m01 - m10) * s; qw = 0.25 / s;
    } else if (m00 > m11 && m00 > m22) {
      s = 2 * Math.sqrt(1 + m00 - m11 - m22);
      qx = 0.25 * s; qy = (m10 + m01) / s; qz = (m20 + m02) / s; qw = (m12 - m21) / s;
    } else if (m11 > m22) {
      s = 2 * Math.sqrt(1 + m11 - m00 - m22);
      qx = (m10 + m01) / s; qy = 0.25 * s; qz = (m21 + m12) / s; qw = (m20 - m02) / s;
    } else {
      s = 2 * Math.sqrt(1 + m22 - m00 - m11);
      qx = (m20 + m02) / s; qy = (m21 + m12) / s; qz = 0.25 * s; qw = (m01 - m10) / s;
    }
    return [qx, qy, qz, qw];
  }

  function mountHint(canvas) {
    if (document.getElementById('fx-demo-orbit-hint')) return { dismiss: function () {} };
    var hud = document.createElement('div');
    hud.id = 'fx-demo-orbit-hint';
    var zh = (typeof navigator !== 'undefined' ? navigator.language : '').toLowerCase().indexOf('zh') === 0;
    hud.textContent = zh ? '拖动旋转 · 滚轮缩放' : 'Drag to orbit · scroll to zoom';
    hud.style.cssText =
      'position:fixed;left:16px;bottom:16px;z-index:5;color:#fff;font:13px/1.4 system-ui,sans-serif;padding:8px 12px;background:rgba(0,0,0,.55);border-radius:6px;pointer-events:none;opacity:1;transition:opacity .35s ease';
    (canvas.ownerDocument.body || document.body).appendChild(hud);
    var dismissed = false;
    var timer = window.setTimeout(dismiss, 5200);
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      window.clearTimeout(timer);
      hud.style.opacity = '0';
      window.setTimeout(function () { if (hud.parentNode) hud.parentNode.removeChild(hud); }, 400);
    }
    return { dismiss: dismiss };
  }

  function attach(canvas, world, Transform, Camera, entity) {
    if (canvas.dataset.fxOrbit === '1') return;
    canvas.dataset.fxOrbit = '1';
    var lookAt = [0, 0, 0];
    var yaw = 0, pitch = 0, radius = 3;
    var userControlled = false, dragging = false, pointerId = null, dragDistance = 0;
    canvas.style.cursor = 'grab';
    canvas.style.touchAction = 'none';
    canvas.style.pointerEvents = 'auto';
    canvas.title = canvas.title || 'Drag to orbit · 拖动旋转';
    var hint = mountHint(canvas);

    function syncFromWorld() {
      var xf = world.get(entity, Transform);
      if (!xf || !xf.ok) return false;
      var pos = readVec3(xf.value.pos, [0, 0, 3]);
      var dx = pos[0] - lookAt[0], dy = pos[1] - lookAt[1], dz = pos[2] - lookAt[2];
      radius = Math.hypot(dx, dy, dz);
      if (radius < 1e-5) radius = 1;
      yaw = Math.atan2(dx, dz);
      pitch = clampPitch(Math.asin(Math.max(-1, Math.min(1, dy / radius))));
      radius = Math.max(0.35, Math.min(80, radius));
      return true;
    }

    function apply() {
      var cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw);
      var ex = lookAt[0] + sy * cp * radius;
      var ey = lookAt[1] + sp * radius;
      var ez = lookAt[2] + cy * cp * radius;
      var quat = lookQuat(ex, ey, ez, lookAt[0], lookAt[1], lookAt[2]);
      world.set(entity, Transform, { pos: [ex, ey, ez], quat: quat, scale: [1, 1, 1] });
    }

    function takeControl() {
      hint.dismiss();
      if (!userControlled) {
        syncFromWorld();
        userControlled = true;
      }
    }

    canvas.addEventListener('pointerdown', function (ev) {
      if (ev.button !== 0) return;
      takeControl();
      dragging = true;
      dragDistance = 0;
      pointerId = ev.pointerId;
      canvas.style.cursor = 'grabbing';
      try { canvas.setPointerCapture(ev.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!dragging || ev.pointerId !== pointerId) return;
      dragDistance += Math.hypot(ev.movementX, ev.movementY);
      yaw -= ev.movementX * 0.005;
      pitch = clampPitch(pitch + ev.movementY * 0.005);
      apply();
    });
    function endDrag(ev) {
      if (ev && ev.pointerId !== pointerId) return;
      dragging = false;
      pointerId = null;
      canvas.style.cursor = 'grab';
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('click', function (ev) {
      if (dragDistance > 4) {
        ev.stopImmediatePropagation();
        ev.preventDefault();
      }
      dragDistance = 0;
    }, true);
    canvas.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      takeControl();
      radius = Math.max(0.35, Math.min(80, radius * Math.exp(ev.deltaY * 0.0015)));
      apply();
    }, { passive: false });

    function tick() {
      if (userControlled) apply();
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var tries = 0;
  function boot() {
    unletterbox();
    var canvas = document.querySelector('#app') || document.querySelector('canvas');
    if (canvas && canvas.dataset.fxOrbit === '1') return;
    var tok = tokens();
    if (!tok || !canvas) {
      if (++tries < 180) requestAnimationFrame(boot);
      return;
    }
    var list = worlds();
    for (var i = 0; i < list.length; i++) {
      var entity = cameraOf(list[i], tok.Camera);
      if (entity == null) continue;
      attach(canvas, list[i], tok.Transform, tok.Camera, entity);
      return;
    }
    if (++tries < 180) requestAnimationFrame(boot);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(unletterbox, 120);
  setTimeout(unletterbox, 500);
  setTimeout(boot, 800);
})();
