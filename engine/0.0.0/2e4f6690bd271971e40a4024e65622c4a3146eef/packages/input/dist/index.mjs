import { defineSystemSet, defineSystem } from '../../ecs/dist/index.mjs';

// src/action-state.ts
var INPUT_MAP_KEY = "InputMap";
var DEFAULT_DEADZONE = 0.2;
function inverseLerp(a, b, val) {
  if (val <= a) return 0;
  if (val >= b) return 1;
  return (val - a) / (b - a);
}
function applyDeadzone(rawAbs, deadzone) {
  return rawAbs < deadzone ? 0 : inverseLerp(deadzone, 1, rawAbs);
}
function bindingContribution(binding, sample) {
  switch (binding.type) {
    case "key": {
      const down = sample.downKeys.has(binding.key);
      return { rawAbs: down ? 1 : 0, pressed: down };
    }
    case "mouseButton": {
      const down = sample.buttons[binding.button] === true;
      return { rawAbs: down ? 1 : 0, pressed: down };
    }
    case "gamepadButton": {
      const slots = sample.gamepads ?? [];
      let anyPressed = false;
      for (const slot of slots) {
        if (!slot.standardMapping) continue;
        if (slot.pressed.has(binding.button)) {
          anyPressed = true;
          break;
        }
      }
      return { rawAbs: anyPressed ? 1 : 0, pressed: anyPressed };
    }
    case "gamepadAxis": {
      const slots = sample.gamepads ?? [];
      let maxRawAbs = 0;
      for (const slot of slots) {
        if (!slot.standardMapping) continue;
        const rawAxis = slot.axes[binding.axis];
        const sign = binding.sign;
        if (sign === void 0) {
          const abs = Math.abs(rawAxis);
          if (abs > maxRawAbs) maxRawAbs = abs;
        } else if (sign === 1) {
          const v = Math.max(0, rawAxis);
          if (v > maxRawAbs) maxRawAbs = v;
        } else {
          const v = Math.max(0, -rawAxis);
          if (v > maxRawAbs) maxRawAbs = v;
        }
      }
      return { rawAbs: maxRawAbs, pressed: false };
    }
  }
}
function deriveActionStates(sample, inputMap, prevActionStates) {
  const deduped = /* @__PURE__ */ new Map();
  for (const config of inputMap) {
    deduped.set(config.action, config);
  }
  const prevByAction = /* @__PURE__ */ new Map();
  if (prevActionStates) {
    for (const s of prevActionStates) {
      prevByAction.set(s.action, s.pressed);
    }
  }
  const results = [];
  for (const config of deduped.values()) {
    const deadzone = config.deadzone ?? DEFAULT_DEADZONE;
    let aggregatedPressed = false;
    let aggregatedStrength = 0;
    let aggregatedRaw = 0;
    for (const binding of config.bindings) {
      const { rawAbs } = bindingContribution(binding, sample);
      if (rawAbs > aggregatedRaw) aggregatedRaw = rawAbs;
      if (rawAbs >= deadzone) {
        aggregatedPressed = true;
        const str = applyDeadzone(rawAbs, deadzone);
        if (str > aggregatedStrength) aggregatedStrength = str;
      }
    }
    const prevPressed = prevByAction.get(config.action) ?? false;
    const justPressed = aggregatedPressed && !prevPressed;
    const justReleased = sample.focusReset !== true && !aggregatedPressed && prevPressed;
    results.push({
      action: config.action,
      pressed: aggregatedPressed,
      justPressed,
      justReleased,
      strength: aggregatedStrength,
      raw: aggregatedRaw
    });
  }
  return results;
}
function getAxis(_inputMap, actionStates, neg, pos) {
  const posState = actionStates.find((s) => s.action === pos);
  const negState = actionStates.find((s) => s.action === neg);
  const posStrength = posState?.strength ?? 0;
  const negStrength = negState?.strength ?? 0;
  if (neg === pos) return 0;
  return posStrength - negStrength;
}
function getVector(inputMap, actionStates, negX, posX, negY, posY, opts) {
  const posXState = actionStates.find((s) => s.action === posX);
  const negXState = actionStates.find((s) => s.action === negX);
  const posYState = actionStates.find((s) => s.action === posY);
  const negYState = actionStates.find((s) => s.action === negY);
  const x = (posXState?.raw ?? 0) - (negXState?.raw ?? 0);
  const y = (posYState?.raw ?? 0) - (negYState?.raw ?? 0);
  const deadzone = opts?.deadzone ?? computeAverageDeadzone(inputMap, negX, posX, negY, posY);
  const length = Math.sqrt(x * x + y * y);
  if (length <= deadzone) {
    return { x: 0, y: 0 };
  }
  if (length > 1) {
    return { x: x / length, y: y / length };
  }
  const factor = inverseLerp(deadzone, 1, length) / length;
  return { x: x * factor, y: y * factor };
}
function computeAverageDeadzone(inputMap, negX, posX, negY, posY) {
  const map = /* @__PURE__ */ new Map();
  for (const c of inputMap) {
    map.set(c.action, c.deadzone ?? DEFAULT_DEADZONE);
  }
  const dzNegX = map.get(negX) ?? DEFAULT_DEADZONE;
  const dzPosX = map.get(posX) ?? DEFAULT_DEADZONE;
  const dzNegY = map.get(negY) ?? DEFAULT_DEADZONE;
  const dzPosY = map.get(posY) ?? DEFAULT_DEADZONE;
  return (dzNegX + dzPosX + dzNegY + dzPosY) / 4;
}

// src/gamepad-frame.ts
var STANDARD_BUTTON_COUNT = 17;
var STANDARD_BUTTON_INDEX = {
  a: 0,
  b: 1,
  x: 2,
  y: 3,
  leftshoulder: 4,
  rightshoulder: 5,
  lefttrigger: 6,
  righttrigger: 7,
  back: 8,
  start: 9,
  leftstick: 10,
  rightstick: 11,
  dpup: 12,
  dpdown: 13,
  dpleft: 14,
  dpright: 15,
  guide: 16
};
var STANDARD_AXIS_INDEX = {
  leftx: 0,
  lefty: 1,
  rightx: 2,
  righty: 3
};
var TRIGGER_PRESS_THRESHOLD = 0.5;
function remapToStandardLayout(gp, tokens) {
  const pressed = /* @__PURE__ */ new Set();
  const buttonValues = /* @__PURE__ */ new Map();
  const axes = [0, 0, 0, 0];
  for (const [name, token] of Object.entries(tokens)) {
    const stdButton = STANDARD_BUTTON_INDEX[name];
    const stdAxis = STANDARD_AXIS_INDEX[name];
    if (stdButton !== void 0) {
      if (token.kind === "button") {
        const raw = gp.buttons[token.index];
        if (raw) {
          buttonValues.set(stdButton, raw.value);
          if (raw.pressed) pressed.add(stdButton);
        }
      } else if (token.kind === "axis") {
        const value = gp.axes[token.index] ?? 0;
        buttonValues.set(stdButton, value);
        if (value > TRIGGER_PRESS_THRESHOLD) pressed.add(stdButton);
      }
      continue;
    }
    if (stdAxis !== void 0 && token.kind === "axis") {
      const raw = gp.axes[token.index] ?? 0;
      axes[stdAxis] = token.half === "-" ? -raw : raw;
    }
  }
  return { pressed, buttonValues, axes };
}
function emptySlot(index) {
  return {
    index,
    standardMapping: false,
    pressed: /* @__PURE__ */ new Set(),
    justPressed: /* @__PURE__ */ new Set(),
    justReleased: /* @__PURE__ */ new Set(),
    buttonValues: /* @__PURE__ */ new Map(),
    axes: [0, 0, 0, 0]
  };
}
function edges(prevPressed, curPressed) {
  const justPressed = /* @__PURE__ */ new Set();
  const justReleased = /* @__PURE__ */ new Set();
  for (const b of curPressed) {
    if (!prevPressed.has(b)) justPressed.add(b);
  }
  for (const b of prevPressed) {
    if (!curPressed.has(b)) justReleased.add(b);
  }
  return { justPressed, justReleased };
}
function diffGamepadFrame(prev, curGamepads, remapLookup) {
  const results = [];
  const prevIndices = new Set(prev.keys());
  const curIndices = /* @__PURE__ */ new Set();
  for (const gp of curGamepads) {
    curIndices.add(gp.index);
    const prevPressed = prev.get(gp.index)?.pressed ?? /* @__PURE__ */ new Set();
    results.push(
      gp.mapping === "standard" ? diffStandardSlot(gp, prevPressed) : diffNonStandardSlot(gp, prevPressed, remapLookup)
    );
  }
  for (const idx of prevIndices) {
    if (!curIndices.has(idx)) {
      results.push(emptySlot(idx));
    }
  }
  return results;
}
function diffStandardSlot(gp, prevPressed) {
  const curPressed = /* @__PURE__ */ new Set();
  const buttonValues = /* @__PURE__ */ new Map();
  const btnCount = Math.min(gp.buttons.length, STANDARD_BUTTON_COUNT);
  for (let b = 0; b < btnCount; b++) {
    const btn = gp.buttons[b];
    if (!btn) continue;
    buttonValues.set(b, btn.value);
    if (btn.pressed) curPressed.add(b);
  }
  const { justPressed, justReleased } = edges(prevPressed, curPressed);
  const axes = [
    gp.axes[0] ?? 0,
    gp.axes[1] ?? 0,
    gp.axes[2] ?? 0,
    gp.axes[3] ?? 0
  ];
  return {
    index: gp.index,
    standardMapping: true,
    pressed: curPressed,
    justPressed,
    justReleased,
    buttonValues,
    axes
  };
}
function diffNonStandardSlot(gp, prevPressed, remapLookup) {
  const tokens = remapLookup ? remapLookup(gp.id) : null;
  if (!tokens) return emptySlot(gp.index);
  const { pressed, buttonValues, axes } = remapToStandardLayout(gp, tokens);
  const { justPressed, justReleased } = edges(prevPressed, pressed);
  return {
    index: gp.index,
    standardMapping: true,
    pressed,
    justPressed,
    justReleased,
    buttonValues,
    axes
  };
}

// src/gesture-recognizer.ts
var LONG_PRESS_DURATION_MS = 500;
var LONG_PRESS_SLOP = 10;
var DOUBLE_TAP_INTERVAL_MS = 350;
var DOUBLE_TAP_DISTANCE = 10;
var SWIPE_VELOCITY_THRESHOLD = 0.5;
var SWIPE_WINDOW_MS = 100;
var SWIPE_DIRECTIONS = ["left", "right", "up", "down"];
var IDENTITY_GESTURE = Object.freeze({ pinchScale: 1, rotationAngle: 0 });
function createRecognizerState() {
  return {
    pinch: null,
    gesture: IDENTITY_GESTURE,
    longPresses: /* @__PURE__ */ new Map(),
    lastTap: null,
    swipeHistory: /* @__PURE__ */ new Map()
  };
}
function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}
function angleOf(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}
function normalizeAngle(a) {
  let r = a;
  while (r > Math.PI) r -= 2 * Math.PI;
  while (r <= -Math.PI) r += 2 * Math.PI;
  return r;
}
function dominantDirection(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? SWIPE_DIRECTIONS[1] : SWIPE_DIRECTIONS[0];
  return dy >= 0 ? SWIPE_DIRECTIONS[3] : SWIPE_DIRECTIONS[2];
}
function narrowGesturePointerType(pt) {
  switch (pt) {
    case "mouse":
      return "mouse";
    case "pen":
      return "pen";
    case "touch":
      return "touch";
  }
}
function emitPinchLifecycle(ctx, phase, tracker, now) {
  const pointerIds = [tracker.pointerA, tracker.pointerB];
  const pointerType = narrowGesturePointerType(tracker.pointerType);
  ctx.events.push({ kind: `pinch-${phase}`, pointerIds, pointerType, timestamp: now });
  ctx.events.push({ kind: `rotate-${phase}`, pointerIds, pointerType, timestamp: now });
}
function handleDown(ctx, ev, now) {
  ctx.longPresses.set(ev.pointerId, {
    downTime: now,
    x: ev.x,
    y: ev.y,
    pointerType: ev.pointerType,
    armed: true,
    fired: false
  });
  ctx.swipeHistory.set(ev.pointerId, [{ t: now, x: ev.x, y: ev.y }]);
}
function handleMove(ctx, ev, now) {
  const lp = ctx.longPresses.get(ev.pointerId);
  if (lp?.armed && distance(lp.x, lp.y, ev.x, ev.y) > LONG_PRESS_SLOP) {
    ctx.longPresses.set(ev.pointerId, { ...lp, armed: false });
  }
  const hist = ctx.swipeHistory.get(ev.pointerId);
  if (hist) {
    hist.push({ t: now, x: ev.x, y: ev.y });
    pruneSwipeWindow(hist, now);
  }
}
function pruneSwipeWindow(hist, now) {
  const cutoff = now - SWIPE_WINDOW_MS;
  while (hist.length > 1 && hist[0] !== void 0 && hist[0].t < cutoff) {
    hist.shift();
  }
}
function detectSwipe(ctx, ev, now) {
  const hist = ctx.swipeHistory.get(ev.pointerId);
  if (!hist || hist.length === 0) return;
  const cutoff = now - SWIPE_WINDOW_MS;
  const oldest = hist.find((s) => s.t >= cutoff) ?? hist[0];
  if (!oldest) return;
  const dt = now - oldest.t;
  if (dt <= 0) return;
  const dist = distance(oldest.x, oldest.y, ev.x, ev.y);
  if (dist / dt < SWIPE_VELOCITY_THRESHOLD) return;
  ctx.events.push({
    kind: "swipe",
    pointerId: ev.pointerId,
    direction: dominantDirection(ev.x - oldest.x, ev.y - oldest.y),
    pointerType: narrowGesturePointerType(ev.pointerType),
    timestamp: now
  });
}
function detectDoubleTap(ctx, ev, now) {
  const prev = ctx.lastTap;
  const withinTime = prev !== null && now - prev.time <= DOUBLE_TAP_INTERVAL_MS;
  const withinDist = prev !== null && distance(prev.x, prev.y, ev.x, ev.y) <= DOUBLE_TAP_DISTANCE;
  if (prev !== null && withinTime && withinDist) {
    ctx.events.push({
      kind: "double-tap",
      pointerId: ev.pointerId,
      x: ev.x,
      y: ev.y,
      pointerType: narrowGesturePointerType(ev.pointerType),
      timestamp: now
    });
    ctx.lastTap = null;
    return;
  }
  ctx.lastTap = { time: now, x: ev.x, y: ev.y };
}
function endPinchIfMember(ctx, pointerId, phase, now) {
  const pinch = ctx.pinch;
  if (!pinch || pinch.pointerA !== pointerId && pinch.pointerB !== pointerId) return;
  emitPinchLifecycle(ctx, phase, pinch, now);
  ctx.pinch = null;
  if (phase === "cancel") {
    ctx.gesture = { pinchScale: 1, rotationAngle: 0 };
  }
}
function handleUp(ctx, ev, now) {
  detectSwipe(ctx, ev, now);
  detectDoubleTap(ctx, ev, now);
  ctx.longPresses.delete(ev.pointerId);
  ctx.swipeHistory.delete(ev.pointerId);
  endPinchIfMember(ctx, ev.pointerId, "end", now);
}
function handleCancel(ctx, ev, now) {
  ctx.longPresses.delete(ev.pointerId);
  ctx.swipeHistory.delete(ev.pointerId);
  endPinchIfMember(ctx, ev.pointerId, "cancel", now);
}
function tryLockPair(ctx, pointerMap, now) {
  if (ctx.pinch !== null || pointerMap.size < 2) return;
  const ids = [...pointerMap.keys()].sort((a2, b2) => a2 - b2);
  const idA = ids[0];
  const idB = ids[1];
  if (idA === void 0 || idB === void 0) return;
  const a = pointerMap.get(idA);
  const b = pointerMap.get(idB);
  if (!a || !b) return;
  ctx.pinch = {
    pointerA: idA,
    pointerB: idB,
    initialDistance: distance(a.x, a.y, b.x, b.y) || 1,
    lastAngle: angleOf(a.x, a.y, b.x, b.y),
    pointerType: a.pointerType
  };
  ctx.gesture = { pinchScale: 1, rotationAngle: 0 };
  emitPinchLifecycle(ctx, "begin", ctx.pinch, now);
}
function updatePinchContinuous(ctx, pointerMap) {
  const pinch = ctx.pinch;
  if (!pinch) return;
  const a = pointerMap.get(pinch.pointerA);
  const b = pointerMap.get(pinch.pointerB);
  if (!a || !b) return;
  const curDist = distance(a.x, a.y, b.x, b.y);
  const curAngle = angleOf(a.x, a.y, b.x, b.y);
  const delta = normalizeAngle(curAngle - pinch.lastAngle);
  ctx.gesture = {
    pinchScale: curDist / pinch.initialDistance,
    rotationAngle: ctx.gesture.rotationAngle + delta
  };
  ctx.pinch = { ...pinch, lastAngle: curAngle };
}
function fireLongPresses(ctx, pointerMap, now) {
  const pinch = ctx.pinch;
  for (const [id, lp] of ctx.longPresses) {
    if (!lp.armed || lp.fired) continue;
    if (now - lp.downTime < LONG_PRESS_DURATION_MS) continue;
    if (!pointerMap.has(id)) continue;
    if (pinch && (pinch.pointerA === id || pinch.pointerB === id)) continue;
    ctx.events.push({
      kind: "long-press",
      pointerId: id,
      x: lp.x,
      y: lp.y,
      pointerType: narrowGesturePointerType(lp.pointerType),
      timestamp: now
    });
    ctx.longPresses.set(id, { ...lp, fired: true });
  }
}
function processGestureFrame(phaseQueue, pointerMap, prevState, now) {
  const ctx = {
    pinch: prevState.pinch,
    gesture: { ...prevState.gesture },
    longPresses: new Map(prevState.longPresses),
    lastTap: prevState.lastTap,
    swipeHistory: cloneSwipeHistory(prevState.swipeHistory),
    events: []
  };
  for (const ev of phaseQueue) {
    switch (ev.phase) {
      case "down":
        handleDown(ctx, ev, now);
        break;
      case "move":
        handleMove(ctx, ev, now);
        break;
      case "up":
        handleUp(ctx, ev, now);
        break;
      case "cancel":
        handleCancel(ctx, ev, now);
        break;
    }
  }
  tryLockPair(ctx, pointerMap, now);
  updatePinchContinuous(ctx, pointerMap);
  fireLongPresses(ctx, pointerMap, now);
  const gesture = Object.freeze({
    pinchScale: ctx.gesture.pinchScale,
    rotationAngle: ctx.gesture.rotationAngle
  });
  const newState = {
    pinch: ctx.pinch,
    gesture,
    longPresses: ctx.longPresses,
    lastTap: ctx.lastTap,
    swipeHistory: ctx.swipeHistory
  };
  return { newState, gestureState: gesture, gestureEvents: ctx.events };
}
function cloneSwipeHistory(src) {
  const out = /* @__PURE__ */ new Map();
  for (const [id, samples] of src) out.set(id, [...samples]);
  return out;
}

// src/input-snapshot.ts
function createEmptyInputBackendSample() {
  return {
    downKeys: /* @__PURE__ */ new Set(),
    upKeys: /* @__PURE__ */ new Set(),
    buttons: [false, false, false],
    movementX: 0,
    movementY: 0,
    wheelDelta: 0,
    focused: true,
    pointerLocked: false
  };
}
function emptyGamepadReader() {
  return Object.freeze({
    connected: false,
    standardMapping: false,
    button(_b) {
      return false;
    },
    buttonValue(_b) {
      return 0;
    },
    justPressed(_b) {
      return false;
    },
    justReleased(_b) {
      return false;
    },
    axis(_a) {
      return 0;
    }
  });
}
function buildGamepadReader(slot) {
  if (!slot.standardMapping) {
    return Object.freeze({
      connected: true,
      standardMapping: false,
      button: emptyGamepadReader().button,
      buttonValue: emptyGamepadReader().buttonValue,
      justPressed: emptyGamepadReader().justPressed,
      justReleased: emptyGamepadReader().justReleased,
      axis: emptyGamepadReader().axis
    });
  }
  return Object.freeze({
    connected: true,
    standardMapping: true,
    button(b) {
      return slot.pressed.has(b);
    },
    buttonValue(b) {
      return slot.buttonValues.get(b) ?? 0;
    },
    justPressed(b) {
      return slot.justPressed.has(b);
    },
    justReleased(b) {
      return slot.justReleased.has(b);
    },
    axis(a) {
      return slot.axes[a];
    }
  });
}
function snapshotFromSample(sample, actionStates, inputMap, previousSnapshot) {
  const heldKeys = new Set(sample.downKeys);
  const upEdges = new Set(sample.upKeys);
  const justPressedKeys = new Set(sample.pressedKeys);
  if (sample.pressedKeys === void 0) {
    for (const key of heldKeys) {
      if (!previousSnapshot?.keyboard.down(key)) justPressedKeys.add(key);
    }
  }
  const heldCodes = new Set(sample.downCodes ?? []);
  const upCodeEdges = new Set(sample.upCodes ?? []);
  const justPressedCodes = new Set(sample.pressedCodes);
  if (sample.pressedCodes === void 0) {
    for (const code of heldCodes) {
      if (!previousSnapshot?.keyboard.downCode(code)) justPressedCodes.add(code);
    }
  }
  const buttons = [
    sample.buttons[0],
    sample.buttons[1],
    sample.buttons[2]
  ];
  const justPressedButtons = sample.pressedButtons === void 0 ? [
    buttons[0] && (previousSnapshot === void 0 || !previousSnapshot.mouse.button(0)),
    buttons[1] && (previousSnapshot === void 0 || !previousSnapshot.mouse.button(1)),
    buttons[2] && (previousSnapshot === void 0 || !previousSnapshot.mouse.button(2))
  ] : [sample.pressedButtons[0], sample.pressedButtons[1], sample.pressedButtons[2]];
  const justReleasedButtons = sample.releasedButtons === void 0 ? [
    sample.focusReset !== true && previousSnapshot?.mouse.button(0) === true && !buttons[0],
    sample.focusReset !== true && previousSnapshot?.mouse.button(1) === true && !buttons[1],
    sample.focusReset !== true && previousSnapshot?.mouse.button(2) === true && !buttons[2]
  ] : [sample.releasedButtons[0], sample.releasedButtons[1], sample.releasedButtons[2]];
  const movementDelta = Object.freeze({ x: sample.movementX, y: sample.movementY });
  const mousePosition = sample.mouseX === void 0 || sample.mouseY === void 0 ? void 0 : Object.freeze({ x: sample.mouseX, y: sample.mouseY });
  const wheelDelta = sample.wheelDelta;
  const gamepadSlots = sample.gamepads ?? [];
  const caps = sample.capabilities ?? Object.freeze({ gamepad: false, pointer: false });
  const pointerEvts = sample.pointerEvents ?? [];
  const gesture = sample.gestures ?? IDENTITY_GESTURE;
  const gestureEvts = sample.gestureEvents ?? [];
  const _virtualAxes = sample.virtualAxes ?? [];
  const virtualAxesMap = /* @__PURE__ */ new Map();
  for (const va of _virtualAxes) {
    virtualAxesMap.set(va.name, va);
  }
  const gamepadSlotMap = /* @__PURE__ */ new Map();
  for (const slot of gamepadSlots) {
    gamepadSlotMap.set(slot.index, slot);
  }
  const actionMap = /* @__PURE__ */ new Map();
  if (actionStates) {
    for (const a of actionStates) {
      actionMap.set(a.action, a);
    }
  }
  function emptyActionReader() {
    return Object.freeze({
      isPressed: () => false,
      justPressed: () => false,
      justReleased: () => false,
      strength: 0
    });
  }
  const snapshot = {
    keyboard: {
      down(key) {
        return heldKeys.has(key);
      },
      justPressed(key) {
        return justPressedKeys.has(key);
      },
      up(key) {
        return upEdges.has(key);
      },
      downCode(code) {
        return heldCodes.has(code);
      },
      justPressedCode(code) {
        return justPressedCodes.has(code);
      },
      upCode(code) {
        return upCodeEdges.has(code);
      }
    },
    mouse: {
      position: mousePosition,
      movementDelta,
      pointerLocked: sample.pointerLocked,
      button(i) {
        return buttons[i] === true;
      },
      justPressed(i) {
        return justPressedButtons[i] === true;
      },
      justReleased(i) {
        return justReleasedButtons[i] === true;
      },
      wheelDelta
    },
    gamepad(i) {
      const slot = gamepadSlotMap.get(i);
      if (!slot) return emptyGamepadReader();
      return buildGamepadReader(slot);
    },
    capabilities: caps,
    pointer(id) {
      const entry = (sample.pointers ?? []).find((p) => p.pointerId === id);
      if (!entry) {
        return Object.freeze({
          active: false,
          pointerId: -1,
          x: 0,
          y: 0,
          pressure: 0,
          pointerType: "mouse",
          delta: Object.freeze({ x: 0, y: 0 })
        });
      }
      return Object.freeze({
        ...entry,
        delta: Object.freeze({ x: entry.delta.x, y: entry.delta.y })
      });
    },
    virtualAxis(name) {
      const va = virtualAxesMap.get(name);
      if (!va) return Object.freeze({ x: 0, y: 0 });
      return Object.freeze({ x: va.x, y: va.y });
    },
    action(name) {
      const s = actionMap.get(name);
      if (!s) return emptyActionReader();
      return Object.freeze({
        isPressed: () => s.pressed,
        justPressed: () => s.justPressed,
        justReleased: () => s.justReleased,
        strength: s.strength
      });
    },
    getAxis(neg, pos) {
      if (!actionStates || !inputMap) return 0;
      return getAxis(inputMap, actionStates, neg, pos);
    },
    getVector(negX, posX, negY, posY, opts) {
      if (!actionStates || !inputMap) return { x: 0, y: 0 };
      return getVector(inputMap, actionStates, negX, posX, negY, posY, opts);
    },
    pointerEvents: pointerEvts,
    gesture,
    gestureEvents: gestureEvts
  };
  snapshot._actionStates = actionStates;
  snapshot._inputMap = inputMap;
  return Object.freeze(snapshot);
}
function readActionStatesForEdgeDiff(snap) {
  return snap._actionStates;
}
function createInputSnapshot() {
  return snapshotFromSample(createEmptyInputBackendSample());
}
var INPUT_SNAPSHOT_RESOURCE_KEY = "InputSnapshot";

// src/ui-ownership.ts
function contains(root, value) {
  const NodeCtor = globalThis.Node;
  return NodeCtor && value instanceof NodeCtor ? value === root || root.contains(value) : false;
}
function resolveUiOwnership(event, host) {
  const path = event.composedPath;
  if (typeof path === "function") {
    const composed = path.call(event);
    return {
      owned: composed.some((item) => contains(host, item)) || composed.length === 0 && contains(host, event.target),
      source: composed.length === 0 ? "target-fallback" : "composed-path"
    };
  }
  if ("target" in event) {
    return { owned: contains(host, event.target), source: "target-fallback" };
  }
  return { owned: false, source: "unknown" };
}
function isUiOwnedEvent(event, host) {
  return resolveUiOwnership(event, host).owned;
}
function createUiInputResetBoundary(options) {
  let disposed = false;
  const reset = () => {
    if (!disposed) options.clear();
  };
  const onAbort = () => reset();
  options.signal?.addEventListener("abort", onAbort, { once: true });
  return {
    reset,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      options.signal?.removeEventListener("abort", onAbort);
    }
  };
}

// src/virtual-joystick.ts
function computeVec(ptrX, ptrY, originX, originY, radius, deadzone) {
  const rawX = (ptrX - originX) / radius;
  const rawY = (ptrY - originY) / radius;
  const mag = Math.sqrt(rawX * rawX + rawY * rawY);
  if (mag < deadzone) return { x: 0, y: 0 };
  if (mag > 1) {
    return { x: rawX / mag, y: rawY / mag };
  }
  return { x: rawX, y: rawY };
}
function deriveVirtualAxes(configs, pointerMap, bindState) {
  const results = [];
  for (const cfg of configs) {
    const bs = bindState.get(cfg.name);
    if (bs?.pointerId !== void 0) {
      const ptr = pointerMap.get(bs.pointerId);
      if (ptr) {
        const vec = computeVec(ptr.x, ptr.y, bs.originX, bs.originY, cfg.radius, cfg.deadzone);
        results.push({ name: cfg.name, x: vec.x, y: vec.y });
      } else {
        bs.pointerId = void 0;
        results.push({ name: cfg.name, x: 0, y: 0 });
      }
    } else {
      results.push({ name: cfg.name, x: 0, y: 0 });
    }
  }
  return results;
}
function handleVirtualJoystickUnbind(bindState, pointerId) {
  for (const bs of bindState.values()) {
    if (bs.pointerId === pointerId) {
      bs.pointerId = void 0;
    }
  }
}

// src/browser-backend.ts
function coercePointerType(raw) {
  if (raw === "pen") return "pen";
  if (raw === "touch") return "touch";
  return "mouse";
}
function attachBrowserInputBackend(canvas, options = {}) {
  const doc = options.document ?? globalThis.document;
  const win = options.window ?? globalThis.window;
  const heldKeys = /* @__PURE__ */ new Set();
  const upEdges = /* @__PURE__ */ new Set();
  const heldCodes = /* @__PURE__ */ new Set();
  const upCodeEdges = /* @__PURE__ */ new Set();
  const pressedKeys = /* @__PURE__ */ new Set();
  const pressedCodes = /* @__PURE__ */ new Set();
  const buttons = [false, false, false];
  const pressedButtons = [false, false, false];
  const releasedButtons = [false, false, false];
  let mvx = 0;
  let mvy = 0;
  let wheelAccum = 0;
  let detached = false;
  const isUiEvent = (event) => options.uiRoot !== void 0 && isUiOwnedEvent(event, options.uiRoot);
  let w3cLocked = false;
  let providerLocked = false;
  let gameGate = true;
  let inputAllowed = true;
  function emitLockError(path, cause) {
    try {
      options.onLockError?.({ path, cause });
    } catch {
    }
  }
  function releaseProviderLock() {
    if (providerLocked && options.lockProvider?.exitLock) {
      try {
        options.lockProvider.exitLock();
      } catch (err) {
        emitLockError("provider", err);
      }
    }
    providerLocked = false;
  }
  const nav = options.navigator ?? globalThis.navigator;
  const gamepadAvailable = typeof nav?.getGamepads === "function";
  const pointerAvailable = typeof globalThis.PointerEvent !== "undefined";
  const caps = { gamepad: gamepadAvailable, pointer: pointerAvailable };
  let prevGamepadFrame = /* @__PURE__ */ new Map();
  let gamepadBaselinePending = false;
  let focusResetPending = false;
  let controllerDb;
  let dbLoadStarted = false;
  const guidCache = /* @__PURE__ */ new Map();
  let controllerDbApi;
  function kickOffDbLoad() {
    if (dbLoadStarted) return;
    dbLoadStarted = true;
    const loadApi = controllerDbApi ? Promise.resolve(controllerDbApi) : import('./controller-db.mjs').then((m) => {
      controllerDbApi = m;
      return m;
    });
    const loadText = options.loadControllerDb ? options.loadControllerDb() : import('./controller-db-data.mjs').then((m) => m.loadBundledControllerDb());
    Promise.all([loadApi, loadText]).then(([api, txt]) => {
      controllerDb = api.parseControllerDb(txt);
    }).catch(() => {
      dbLoadStarted = false;
    });
  }
  function remapLookup(gamepadId) {
    if (!controllerDb || !controllerDbApi) return null;
    let guid = guidCache.get(gamepadId);
    if (!guidCache.has(gamepadId)) {
      guid = controllerDbApi.extractGuidFromGamepadId(gamepadId);
      guidCache.set(gamepadId, guid);
    }
    if (!guid) return null;
    const ua = typeof globalThis.navigator?.userAgent === "string" ? globalThis.navigator.userAgent : "";
    const platform = controllerDbApi.platformFromUserAgent(ua);
    const entry = controllerDbApi.selectBestMappingEntry(controllerDb, guid, platform);
    return entry ? entry.tokens : null;
  }
  const pointerMap = /* @__PURE__ */ new Map();
  const phaseQueue = [];
  let mouseX;
  let mouseY;
  const vjConfigs = options.virtualJoysticks ?? [];
  const vjBindState = /* @__PURE__ */ new Map();
  const now = options.now ?? (() => performance.now());
  let recognizerState = createRecognizerState();
  function computePointerCoords(ev) {
    const rect = canvas.getBoundingClientRect?.();
    if (!rect) return { x: ev.clientX, y: ev.clientY };
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (ev.clientX - rect.left) * scaleX,
      y: (ev.clientY - rect.top) * scaleY
    };
  }
  function isFocused() {
    return typeof doc?.hasFocus === "function" ? doc.hasFocus() : true;
  }
  function onKeyDown(ev) {
    if (!inputAllowed) return;
    if (isUiEvent(ev)) {
      clear();
      return;
    }
    if (!heldKeys.has(ev.key)) pressedKeys.add(ev.key);
    heldKeys.add(ev.key);
    if (ev.code) {
      if (!heldCodes.has(ev.code)) pressedCodes.add(ev.code);
      heldCodes.add(ev.code);
    }
    if (ev.key === "Escape" && providerLocked) {
      releaseProviderLock();
    }
  }
  function onKeyUp(ev) {
    if (!inputAllowed) return;
    if (isUiEvent(ev)) return;
    heldKeys.delete(ev.key);
    if (isFocused()) {
      upEdges.add(ev.key);
    }
    if (ev.code) {
      heldCodes.delete(ev.code);
      if (isFocused()) upCodeEdges.add(ev.code);
    }
  }
  function onPointerDown(ev) {
    if (!inputAllowed) return;
    if (isUiEvent(ev)) {
      clear();
      return;
    }
    if (ev.pointerType === "mouse") {
      if (ev.button === 0 || ev.button === 1 || ev.button === 2) {
        if (!buttons[ev.button]) pressedButtons[ev.button] = true;
        buttons[ev.button] = true;
      }
    }
    if (!w3cLocked && !providerLocked && typeof canvas.setPointerCapture === "function") {
      try {
        canvas.setPointerCapture(ev.pointerId);
      } catch {
      }
    }
    const coords = computePointerCoords(ev);
    if (ev.pointerType === "mouse") {
      mouseX = coords.x;
      mouseY = coords.y;
    }
    pointerMap.set(ev.pointerId, {
      x: coords.x,
      y: coords.y,
      pressure: ev.pressure,
      pointerType: coercePointerType(ev.pointerType),
      prevX: coords.x,
      prevY: coords.y
    });
    phaseQueue.push({
      pointerId: ev.pointerId,
      phase: "down",
      x: coords.x,
      y: coords.y,
      pressure: ev.pressure,
      pointerType: coercePointerType(ev.pointerType)
    });
    if (vjConfigs.length > 0) {
      for (const cfg of vjConfigs) {
        const { region } = cfg;
        if (coords.x >= region.x && coords.x <= region.x + region.width && coords.y >= region.y && coords.y <= region.y + region.height) {
          const existing = vjBindState.get(cfg.name);
          if (!existing?.pointerId) {
            const originX = cfg.mode === "fixed" ? cfg.anchor?.x ?? region.x + region.width / 2 : coords.x;
            const originY = cfg.mode === "fixed" ? cfg.anchor?.y ?? region.y + region.height / 2 : coords.y;
            if (existing) {
              existing.pointerId = ev.pointerId;
              existing.originX = originX;
              existing.originY = originY;
            } else {
              vjBindState.set(cfg.name, { pointerId: ev.pointerId, originX, originY });
            }
            break;
          }
        }
      }
    }
  }
  function onPointerUp(ev) {
    if (!inputAllowed) return;
    if (isUiEvent(ev)) return;
    if (ev.pointerType === "mouse") {
      if (ev.button === 0 || ev.button === 1 || ev.button === 2) {
        if (buttons[ev.button]) releasedButtons[ev.button] = true;
        buttons[ev.button] = false;
      }
    }
    const entry = pointerMap.get(ev.pointerId);
    if (entry) {
      phaseQueue.push({
        pointerId: ev.pointerId,
        phase: "up",
        x: entry.x,
        y: entry.y,
        pressure: ev.pressure,
        pointerType: coercePointerType(ev.pointerType)
      });
      pointerMap.delete(ev.pointerId);
    }
    if (vjBindState.size > 0) {
      handleVirtualJoystickUnbind(vjBindState, ev.pointerId);
    }
  }
  function onPointerMove(ev) {
    if (!inputAllowed) return;
    if (isUiEvent(ev)) return;
    if (ev.pointerType === "mouse") {
      mvx += ev.movementX;
      mvy += ev.movementY;
    }
    const coords = computePointerCoords(ev);
    if (ev.pointerType === "mouse") {
      mouseX = coords.x;
      mouseY = coords.y;
    }
    const entry = pointerMap.get(ev.pointerId);
    if (entry) {
      entry.x = coords.x;
      entry.y = coords.y;
      entry.pressure = ev.pressure;
      phaseQueue.push({
        pointerId: ev.pointerId,
        phase: "move",
        x: coords.x,
        y: coords.y,
        pressure: ev.pressure,
        pointerType: coercePointerType(ev.pointerType)
      });
    }
  }
  function onPointerCancel(ev) {
    if (!inputAllowed) return;
    if (isUiEvent(ev)) return;
    const entry = pointerMap.get(ev.pointerId);
    if (entry) {
      phaseQueue.push({
        pointerId: ev.pointerId,
        phase: "cancel",
        x: entry.x,
        y: entry.y,
        pressure: ev.pressure,
        pointerType: coercePointerType(ev.pointerType)
      });
      pointerMap.delete(ev.pointerId);
    }
    if (vjBindState.size > 0) {
      handleVirtualJoystickUnbind(vjBindState, ev.pointerId);
    }
  }
  function onVisibilityChange() {
    if (doc.visibilityState === "hidden") {
      onBlur();
    }
  }
  function onWheel(ev) {
    if (!inputAllowed) return;
    if (isUiEvent(ev)) {
      clear();
      return;
    }
    const dy = ev.deltaY;
    if (typeof dy === "number" && dy !== 0) {
      wheelAccum += dy > 0 ? 1 : -1;
    }
  }
  function onBlur() {
    upEdges.clear();
    upCodeEdges.clear();
    pressedKeys.clear();
    pressedCodes.clear();
    pressedButtons[0] = false;
    pressedButtons[1] = false;
    pressedButtons[2] = false;
    releasedButtons[0] = false;
    releasedButtons[1] = false;
    releasedButtons[2] = false;
    heldKeys.clear();
    heldCodes.clear();
    buttons[0] = false;
    buttons[1] = false;
    buttons[2] = false;
    mvx = 0;
    mvy = 0;
    wheelAccum = 0;
    if (typeof doc.exitPointerLock === "function" && doc.pointerLockElement === canvas) {
      doc.exitPointerLock();
    }
    w3cLocked = false;
    releaseProviderLock();
    if (pointerMap.size > 0) {
      for (const [id, entry] of pointerMap) {
        phaseQueue.push({
          pointerId: id,
          phase: "cancel",
          x: entry.x,
          y: entry.y,
          pressure: entry.pressure,
          pointerType: entry.pointerType
        });
      }
      pointerMap.clear();
    }
    prevGamepadFrame.clear();
    gamepadBaselinePending = true;
    focusResetPending = true;
    vjBindState.clear();
  }
  const safeAdd = (target, kind, handler) => {
    target?.addEventListener?.(kind, handler);
  };
  const safeRemove = (target, kind, handler) => {
    target?.removeEventListener?.(kind, handler);
  };
  safeAdd(win, "keydown", onKeyDown);
  safeAdd(win, "keyup", onKeyUp);
  safeAdd(win, "blur", onBlur);
  safeAdd(canvas, "pointerdown", onPointerDown);
  safeAdd(canvas, "pointerup", onPointerUp);
  safeAdd(canvas, "pointermove", onPointerMove);
  safeAdd(canvas, "pointercancel", onPointerCancel);
  safeAdd(canvas, "wheel", onWheel);
  safeAdd(doc, "visibilitychange", onVisibilityChange);
  function onPointerLockChange() {
    const wasLocked = w3cLocked;
    w3cLocked = doc.pointerLockElement === canvas;
    if (wasLocked && !w3cLocked && !providerLocked) onBlur();
  }
  safeAdd(doc, "pointerlockchange", onPointerLockChange);
  function onPointerLockError(event) {
    emitLockError("w3c", event);
  }
  safeAdd(doc, "pointerlockerror", onPointerLockError);
  let _prevTouchAction;
  if (canvas.style) {
    _prevTouchAction = canvas.style.touchAction;
    canvas.style.touchAction = "none";
  }
  function onCanvasClick() {
    if (!inputAllowed) return;
    if (!gameGate) return;
    if (options.pointerLockAllowed && !options.pointerLockAllowed()) return;
    if (options.lockProvider) {
      providerLocked = true;
      try {
        const result = options.lockProvider.requestLock();
        if (result && typeof result.catch === "function") {
          result.catch((cause) => {
            providerLocked = false;
            emitLockError("provider", cause);
          });
        }
      } catch (cause) {
        providerLocked = false;
        emitLockError("provider", cause);
      }
      return;
    }
    const fn = canvas.requestPointerLock;
    if (typeof fn !== "function") return;
    try {
      const r = fn.call(canvas);
      if (r && typeof r.catch === "function") {
        r.catch((cause) => {
          emitLockError("w3c", cause);
        });
      }
    } catch (cause) {
      emitLockError("w3c", cause);
    }
  }
  safeAdd(canvas, "click", onCanvasClick);
  function sample() {
    if (!inputAllowed) {
      clear();
      return createEmptyInputBackendSample();
    }
    let gamepads;
    if (gamepadAvailable) {
      try {
        const rawGamepads = nav.getGamepads?.() ?? [];
        const valid = [];
        let hasNonStandard = false;
        for (const gp of rawGamepads) {
          if (!gp?.connected) continue;
          valid.push(gp);
          if (gp.mapping !== "standard") hasNonStandard = true;
        }
        if (hasNonStandard) kickOffDbLoad();
        gamepads = diffGamepadFrame(prevGamepadFrame, valid, remapLookup);
        if (gamepadBaselinePending) {
          gamepads = gamepads.map((slot) => ({
            ...slot,
            justPressed: /* @__PURE__ */ new Set(),
            justReleased: /* @__PURE__ */ new Set()
          }));
          gamepadBaselinePending = false;
        }
        const nextFrame = /* @__PURE__ */ new Map();
        for (const slot of gamepads) {
          if (slot.pressed.size > 0 || slot.standardMapping) {
            nextFrame.set(slot.index, slot);
          }
        }
        prevGamepadFrame = nextFrame;
      } catch {
      }
    }
    let pointers;
    if (pointerMap.size > 0) {
      pointers = [];
      for (const [id, entry] of pointerMap) {
        const deltaX = entry.x - entry.prevX;
        const deltaY = entry.y - entry.prevY;
        pointers.push({
          pointerId: id,
          x: entry.x,
          y: entry.y,
          pressure: entry.pressure,
          pointerType: entry.pointerType,
          active: true,
          delta: Object.freeze({ x: deltaX, y: deltaY })
        });
        entry.prevX = entry.x;
        entry.prevY = entry.y;
      }
    }
    const pointerEvents = phaseQueue.length > 0 ? [...phaseQueue] : void 0;
    let virtualAxes;
    if (vjConfigs.length > 0) {
      virtualAxes = deriveVirtualAxes(vjConfigs, pointerMap, vjBindState);
    }
    const gestureResult = processGestureFrame(
      phaseQueue,
      pointerMap,
      recognizerState,
      now()
    );
    recognizerState = gestureResult.newState;
    const gestureEvents = gestureResult.gestureEvents.length > 0 ? gestureResult.gestureEvents : void 0;
    const gs = gestureResult.gestureState;
    const gestures = gs.pinchScale !== 1 || gs.rotationAngle !== 0 ? gs : void 0;
    const out = {
      downKeys: new Set(heldKeys),
      upKeys: new Set(upEdges),
      downCodes: new Set(heldCodes),
      upCodes: new Set(upCodeEdges),
      pressedKeys: new Set(pressedKeys),
      pressedCodes: new Set(pressedCodes),
      buttons: [buttons[0], buttons[1], buttons[2]],
      pressedButtons: [pressedButtons[0], pressedButtons[1], pressedButtons[2]],
      releasedButtons: [releasedButtons[0], releasedButtons[1], releasedButtons[2]],
      movementX: mvx,
      movementY: mvy,
      ...mouseX !== void 0 && mouseY !== void 0 ? { mouseX, mouseY } : {},
      wheelDelta: wheelAccum,
      focused: isFocused(),
      capabilities: caps,
      pointerLocked: w3cLocked || providerLocked,
      ...gamepads ? { gamepads } : {},
      ...pointers ? { pointers } : {},
      ...pointerEvents ? { pointerEvents } : {},
      ...virtualAxes ? { virtualAxes } : {},
      ...gestures ? { gestures } : {},
      ...gestureEvents ? { gestureEvents } : {},
      ...focusResetPending ? { focusReset: true } : {}
    };
    upEdges.clear();
    upCodeEdges.clear();
    pressedKeys.clear();
    pressedCodes.clear();
    pressedButtons[0] = false;
    pressedButtons[1] = false;
    pressedButtons[2] = false;
    releasedButtons[0] = false;
    releasedButtons[1] = false;
    releasedButtons[2] = false;
    mvx = 0;
    mvy = 0;
    wheelAccum = 0;
    phaseQueue.length = 0;
    focusResetPending = false;
    return out;
  }
  function setPointerLockAllowed(allowed) {
    gameGate = allowed;
    if (!allowed) {
      if (typeof doc.exitPointerLock === "function" && doc.pointerLockElement === canvas) {
        doc.exitPointerLock();
      }
      releaseProviderLock();
    }
  }
  function setInputAllowed(allowed) {
    inputAllowed = allowed;
    clear();
  }
  function clear() {
    heldKeys.clear();
    upEdges.clear();
    pressedKeys.clear();
    heldCodes.clear();
    upCodeEdges.clear();
    pressedCodes.clear();
    pointerMap.clear();
    phaseQueue.length = 0;
    prevGamepadFrame.clear();
    vjBindState.clear();
    recognizerState = createRecognizerState();
    buttons[0] = false;
    buttons[1] = false;
    buttons[2] = false;
    pressedButtons[0] = false;
    pressedButtons[1] = false;
    pressedButtons[2] = false;
    releasedButtons[0] = false;
    releasedButtons[1] = false;
    releasedButtons[2] = false;
    mvx = 0;
    mvy = 0;
    wheelAccum = 0;
    if (typeof doc?.exitPointerLock === "function" && doc.pointerLockElement === canvas) {
      doc.exitPointerLock();
    }
    w3cLocked = false;
    releaseProviderLock();
  }
  function detach() {
    if (detached) return;
    detached = true;
    safeRemove(win, "keydown", onKeyDown);
    safeRemove(win, "keyup", onKeyUp);
    safeRemove(win, "blur", onBlur);
    safeRemove(canvas, "pointerdown", onPointerDown);
    safeRemove(canvas, "pointerup", onPointerUp);
    safeRemove(canvas, "pointermove", onPointerMove);
    safeRemove(canvas, "pointercancel", onPointerCancel);
    safeRemove(canvas, "wheel", onWheel);
    safeRemove(doc, "visibilitychange", onVisibilityChange);
    safeRemove(doc, "pointerlockchange", onPointerLockChange);
    safeRemove(doc, "pointerlockerror", onPointerLockError);
    safeRemove(canvas, "click", onCanvasClick);
    clear();
    if (canvas.style && _prevTouchAction !== void 0) {
      canvas.style.touchAction = _prevTouchAction;
    }
  }
  const backend = {
    sample,
    clear,
    detach,
    setPointerLockAllowed,
    setInputAllowed
  };
  const handle = Object.assign(detach, { backend });
  return handle;
}

// src/canvas-input-boundary.ts
function createCanvasInputBoundary(source) {
  let active = "editor";
  let gamePointerLockAllowed = false;
  let editorInputAllowed = true;
  let gameInputAllowed = true;
  source.setPointerLockAllowed?.(false);
  const empty = () => createEmptyInputBackendSample();
  const clear = () => {
    source.clear?.();
    source.setPointerLockAllowed?.(false);
  };
  const routed = (consumer) => ({
    sample: () => consumer === active ? source.sample() : empty(),
    setPointerLockAllowed: (allowed) => {
      if (consumer === "game") {
        gamePointerLockAllowed = allowed;
        source.setPointerLockAllowed?.(active === "game" && allowed);
      } else {
        source.setPointerLockAllowed?.(false);
      }
    },
    setInputAllowed: (allowed) => {
      if (consumer === "game") gameInputAllowed = allowed;
      else editorInputAllowed = allowed;
      source.setInputAllowed?.(active === "game" ? gameInputAllowed : editorInputAllowed);
    },
    clear: () => {
      if (consumer === active) clear();
    },
    detach: () => source.detach()
  });
  const grantGame = () => {
    if (active === "game") return;
    clear();
    active = "game";
    source.setPointerLockAllowed?.(gamePointerLockAllowed);
    source.setInputAllowed?.(gameInputAllowed);
  };
  const revokeGame = () => {
    clear();
    active = "editor";
    source.setInputAllowed?.(editorInputAllowed);
  };
  return {
    editor: routed("editor"),
    game: routed("game"),
    owner: () => active,
    grantGame,
    revokeGame,
    handleUiEvent: (event, host) => {
      if (!isUiOwnedEvent(event, host)) return false;
      clear();
      return true;
    },
    detach: () => source.detach()
  };
}

// src/composite-backend.ts
var CODE_TO_KEY = {
  Space: " ",
  ShiftLeft: "Shift",
  ShiftRight: "Shift",
  ControlLeft: "Control",
  ControlRight: "Control",
  AltLeft: "Alt",
  AltRight: "Alt",
  MetaLeft: "Meta",
  MetaRight: "Meta",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Minus: "-",
  Equal: "=",
  Backquote: "`"
};
function keyForCode(code) {
  if (CODE_TO_KEY[code] !== void 0) return CODE_TO_KEY[code];
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  if (/^Numpad[0-9]$/.test(code)) return code.slice(6);
  if (/^F(?:[1-9]|1[0-2])$/.test(code)) return code;
  if (/^Arrow(?:Up|Down|Left|Right)$/.test(code)) return code;
  if (/^(?:Escape|Enter|Tab|Backspace|Delete|Home|End|PageUp|PageDown|Insert)$/.test(code))
    return code;
  return void 0;
}
function codeForKey(key) {
  if (/^[a-zA-Z]$/.test(key)) return `Key${key.toUpperCase()}`;
  if (/^[0-9]$/.test(key)) return `Digit${key}`;
  if (key === " ") return "Space";
  if (/^(?:Arrow(?:Up|Down|Left|Right)|Escape|Enter|Tab|Backspace|Delete|Home|End|PageUp|PageDown|Insert)$/.test(
    key
  ))
    return key;
  if (/^F(?:[1-9]|1[0-2])$/.test(key)) return key;
  const entry = Object.entries(CODE_TO_KEY).find(([, value]) => value === key);
  return entry?.[0];
}
function normalizeKey(value) {
  const logical = keyForCode(value);
  return logical === void 0 ? { key: value, code: codeForKey(value) } : { key: logical, code: value };
}
function makeCompositeBackend(inner, options) {
  let yieldToHuman = options?.yieldToHuman ?? true;
  let inputAllowed = true;
  let leaseRevoked = false;
  let leaseGeneration = 0;
  const heldKeys = /* @__PURE__ */ new Set();
  const heldCodes = /* @__PURE__ */ new Set();
  const buttons = [false, false, false];
  const upEdges = /* @__PURE__ */ new Set();
  const upCodeEdges = /* @__PURE__ */ new Set();
  const pressedKeys = /* @__PURE__ */ new Set();
  const pressedCodes = /* @__PURE__ */ new Set();
  const pressedButtons = [false, false, false];
  const releasedButtons = [false, false, false];
  let mvx = 0;
  let mvy = 0;
  let wheel = 0;
  function injectionActive() {
    return heldKeys.size > 0 || heldCodes.size > 0 || upEdges.size > 0 || upCodeEdges.size > 0 || pressedKeys.size > 0 || pressedCodes.size > 0 || buttons.some((b) => b) || pressedButtons.some((b) => b) || releasedButtons.some((b) => b);
  }
  function sample() {
    const base = inner.sample();
    if (!inputAllowed) {
      clearInjected();
      return {
        ...base,
        downKeys: /* @__PURE__ */ new Set(),
        upKeys: /* @__PURE__ */ new Set(),
        downCodes: /* @__PURE__ */ new Set(),
        upCodes: /* @__PURE__ */ new Set(),
        pressedKeys: /* @__PURE__ */ new Set(),
        pressedCodes: /* @__PURE__ */ new Set(),
        buttons: [false, false, false],
        pressedButtons: [false, false, false],
        releasedButtons: [false, false, false],
        movementX: 0,
        movementY: 0,
        wheelDelta: 0,
        pointerLocked: false
      };
    }
    const downKeys = new Set(base.downKeys);
    const downCodes = base.downCodes === void 0 && heldCodes.size === 0 ? void 0 : new Set(base.downCodes ?? []);
    for (const k of heldKeys) {
      const code = codeForKey(k);
      if (yieldToHuman && (base.downKeys.has(k) || code !== void 0 && base.downCodes?.has(code) === true))
        continue;
      downKeys.add(k);
    }
    for (const code of heldCodes) {
      const key = keyForCode(code);
      if (yieldToHuman && (base.downCodes?.has(code) === true || key !== void 0 && base.downKeys.has(key)))
        continue;
      downCodes?.add(code);
    }
    const mergedUp = new Set(base.upKeys);
    for (const k of upEdges) {
      const code = codeForKey(k);
      if (yieldToHuman && (base.downKeys.has(k) || code !== void 0 && base.downCodes?.has(code) === true))
        continue;
      mergedUp.add(k);
    }
    const mergedUpCodes = base.upCodes === void 0 && upCodeEdges.size === 0 ? void 0 : new Set(base.upCodes ?? []);
    for (const code of upCodeEdges) {
      const key = keyForCode(code);
      if (yieldToHuman && (base.downCodes?.has(code) === true || key !== void 0 && base.downKeys.has(key)))
        continue;
      mergedUpCodes?.add(code);
    }
    const mergedPressed = base.pressedKeys === void 0 && pressedKeys.size === 0 ? void 0 : /* @__PURE__ */ new Set([...base.pressedKeys ?? [], ...pressedKeys]);
    if (yieldToHuman && (base.downKeys.size > 0 || (base.downCodes?.size ?? 0) > 0) && mergedPressed !== void 0) {
      for (const key of pressedKeys) {
        const code = codeForKey(key);
        if (base.downKeys.has(key) || code !== void 0 && base.downCodes?.has(code) === true)
          mergedPressed.delete(key);
      }
    }
    const mergedPressedCodes = base.pressedCodes === void 0 && pressedCodes.size === 0 ? void 0 : new Set(base.pressedCodes ?? []);
    if (yieldToHuman && mergedPressedCodes !== void 0) {
      for (const code of pressedCodes) {
        const key = keyForCode(code);
        if (base.downCodes?.has(code) === true || key !== void 0 && base.downKeys.has(key))
          mergedPressedCodes.delete(code);
      }
    }
    const mergedButtons = [
      base.buttons[0] || buttons[0],
      base.buttons[1] || buttons[1],
      base.buttons[2] || buttons[2]
    ];
    const mergedPressedButtons = base.pressedButtons === void 0 && !pressedButtons.some(Boolean) ? void 0 : [
      (base.pressedButtons?.[0] ?? false) || pressedButtons[0],
      (base.pressedButtons?.[1] ?? false) || pressedButtons[1],
      (base.pressedButtons?.[2] ?? false) || pressedButtons[2]
    ];
    const mergedReleasedButtons = base.releasedButtons === void 0 && !releasedButtons.some(Boolean) ? void 0 : [
      (base.releasedButtons?.[0] ?? false) || releasedButtons[0],
      (base.releasedButtons?.[1] ?? false) || releasedButtons[1],
      (base.releasedButtons?.[2] ?? false) || releasedButtons[2]
    ];
    const focused = base.focused || injectionActive();
    const out = {
      ...base,
      // carry inner optional fields (pointers/gamepads/gestures/...) untouched
      downKeys,
      upKeys: mergedUp,
      ...downCodes === void 0 ? {} : { downCodes },
      ...mergedUpCodes === void 0 ? {} : { upCodes: mergedUpCodes },
      ...mergedPressed === void 0 ? {} : { pressedKeys: mergedPressed },
      ...mergedPressedCodes === void 0 ? {} : { pressedCodes: mergedPressedCodes },
      buttons: mergedButtons,
      ...mergedPressedButtons === void 0 ? {} : { pressedButtons: mergedPressedButtons },
      ...mergedReleasedButtons === void 0 ? {} : { releasedButtons: mergedReleasedButtons },
      movementX: base.movementX + mvx,
      movementY: base.movementY + mvy,
      wheelDelta: base.wheelDelta + wheel,
      focused,
      pointerLocked: base.pointerLocked
      // AI never fabricates a lock
    };
    upEdges.clear();
    upCodeEdges.clear();
    pressedKeys.clear();
    pressedCodes.clear();
    pressedButtons[0] = false;
    pressedButtons[1] = false;
    pressedButtons[2] = false;
    releasedButtons[0] = false;
    releasedButtons[1] = false;
    releasedButtons[2] = false;
    mvx = 0;
    mvy = 0;
    wheel = 0;
    return out;
  }
  const lockGate = inner.setPointerLockAllowed ? { setPointerLockAllowed: (allowed) => inner.setPointerLockAllowed?.(allowed) } : {};
  const inputGate = {
    setInputAllowed: (allowed) => {
      inputAllowed = allowed;
      inner.setInputAllowed?.(allowed);
      clearInjected();
    }
  };
  const clearInjected = () => {
    upEdges.clear();
    upCodeEdges.clear();
    pressedKeys.clear();
    pressedCodes.clear();
    for (const k of heldKeys) upEdges.add(k);
    for (const code of heldCodes) upCodeEdges.add(code);
    heldKeys.clear();
    heldCodes.clear();
    pressedButtons[0] = false;
    pressedButtons[1] = false;
    pressedButtons[2] = false;
    releasedButtons[0] = false;
    releasedButtons[1] = false;
    releasedButtons[2] = false;
    if (buttons[0]) releasedButtons[0] = true;
    if (buttons[1]) releasedButtons[1] = true;
    if (buttons[2]) releasedButtons[2] = true;
    buttons[0] = buttons[1] = buttons[2] = false;
    mvx = 0;
    mvy = 0;
    wheel = 0;
  };
  const beginInjectedLease = () => {
    leaseGeneration += 1;
    leaseRevoked = false;
    clearInjected();
  };
  const revokeInjectedLease = () => {
    leaseGeneration += 1;
    leaseRevoked = true;
    clearInjected();
  };
  const createInjectedLease = () => {
    beginInjectedLease();
    const generation = leaseGeneration;
    const active = () => inputAllowed && !leaseRevoked && generation === leaseGeneration;
    return {
      sample,
      detach: () => {
      },
      press(key) {
        if (!active()) return;
        const normalized = normalizeKey(key);
        if (!heldKeys.has(normalized.key)) pressedKeys.add(normalized.key);
        heldKeys.add(normalized.key);
        if (normalized.code !== void 0) {
          if (!heldCodes.has(normalized.code)) pressedCodes.add(normalized.code);
          heldCodes.add(normalized.code);
        }
      },
      release(key) {
        if (!active()) return;
        const normalized = normalizeKey(key);
        if (heldKeys.delete(normalized.key)) upEdges.add(normalized.key);
        if (normalized.code !== void 0 && heldCodes.delete(normalized.code))
          upCodeEdges.add(normalized.code);
      },
      setButton(slot, down) {
        if (!active()) return;
        if (down && !buttons[slot]) pressedButtons[slot] = true;
        if (!down && buttons[slot]) releasedButtons[slot] = true;
        buttons[slot] = down;
      },
      addMovement(dx, dy) {
        if (!active()) return;
        mvx += dx;
        mvy += dy;
      },
      addWheel(notches) {
        if (!active()) return;
        wheel += notches;
      },
      clearInjected() {
        if (active()) clearInjected();
      },
      revokeInjectedLease() {
        if (active()) revokeInjectedLease();
      }
    };
  };
  return {
    sample,
    ...lockGate,
    ...inputGate,
    // Teardown belongs to the human backend -- revoke the synthetic lease
    // first, then forward the physical listener teardown.  `clear()` is also
    // exposed so an owner can revoke input without detaching the browser.
    clear: () => {
      clearInjected();
      inner.clear?.();
    },
    detach: () => {
      clearInjected();
      inner.detach();
    },
    press(key) {
      if (leaseRevoked || !inputAllowed) return;
      const normalized = normalizeKey(key);
      if (!heldKeys.has(normalized.key)) pressedKeys.add(normalized.key);
      heldKeys.add(normalized.key);
      if (normalized.code !== void 0) {
        if (!heldCodes.has(normalized.code)) pressedCodes.add(normalized.code);
        heldCodes.add(normalized.code);
      }
    },
    release(key) {
      if (leaseRevoked || !inputAllowed) return;
      const normalized = normalizeKey(key);
      if (heldKeys.delete(normalized.key)) upEdges.add(normalized.key);
      if (normalized.code !== void 0 && heldCodes.delete(normalized.code))
        upCodeEdges.add(normalized.code);
    },
    setButton(slot, down) {
      if (leaseRevoked || !inputAllowed) return;
      if (down && !buttons[slot]) pressedButtons[slot] = true;
      if (!down && buttons[slot]) releasedButtons[slot] = true;
      buttons[slot] = down;
    },
    addMovement(dx, dy) {
      if (leaseRevoked || !inputAllowed) return;
      mvx += dx;
      mvy += dy;
    },
    addWheel(notches) {
      if (leaseRevoked || !inputAllowed) return;
      wheel += notches;
    },
    clearInjected,
    beginInjectedLease,
    revokeInjectedLease,
    createInjectedLease,
    setYieldToHuman(yield_) {
      yieldToHuman = yield_;
    }
  };
}
var FRAME_START_SCAN_SYSTEM_NAME = "input-frame-start-scan";
var InputSet = defineSystemSet({ name: "input" });
var INPUT_BACKEND_KEY = "InputBackend";
var InputFrameStartScan = defineSystem({
  name: FRAME_START_SCAN_SYSTEM_NAME,
  queries: [],
  fn: (world) => {
    const backend = world.getResource(INPUT_BACKEND_KEY);
    const sample = backend.sample();
    let actionStates;
    let inputMap;
    if (world.hasResource(INPUT_MAP_KEY)) {
      inputMap = world.getResource(INPUT_MAP_KEY);
      let prevActionStates;
      if (world.hasResource(INPUT_SNAPSHOT_RESOURCE_KEY)) {
        const prevSnap = world.getResource(INPUT_SNAPSHOT_RESOURCE_KEY);
        prevActionStates = readActionStatesForEdgeDiff(prevSnap);
      }
      actionStates = deriveActionStates(sample, inputMap, prevActionStates);
    }
    const previousSnapshot = world.hasResource(INPUT_SNAPSHOT_RESOURCE_KEY) ? world.getResource(INPUT_SNAPSHOT_RESOURCE_KEY) : void 0;
    const snapshot = snapshotFromSample(sample, actionStates, inputMap, previousSnapshot);
    world.insertResource(INPUT_SNAPSHOT_RESOURCE_KEY, snapshot);
  }
});

// src/plugin-service.ts
function inputBackendPlugin(backend) {
  return {
    name: "input-backend",
    provide: "input",
    apply(ctx) {
      ctx.provide("input", backend);
    }
  };
}
function ownedInputBackendPlugin(backend, dispose) {
  return {
    name: "input-backend",
    provide: "input",
    apply(ctx) {
      ctx.provide("input", backend);
      ctx.effect(() => dispose, "input/backend");
    }
  };
}

export { DOUBLE_TAP_DISTANCE, DOUBLE_TAP_INTERVAL_MS, FRAME_START_SCAN_SYSTEM_NAME, IDENTITY_GESTURE, INPUT_BACKEND_KEY, INPUT_MAP_KEY, INPUT_SNAPSHOT_RESOURCE_KEY, InputFrameStartScan, InputSet, LONG_PRESS_DURATION_MS, LONG_PRESS_SLOP, SWIPE_VELOCITY_THRESHOLD, SWIPE_WINDOW_MS, attachBrowserInputBackend, createCanvasInputBoundary, createInputSnapshot, createUiInputResetBoundary, deriveActionStates, getAxis, getVector, inputBackendPlugin, isUiOwnedEvent, makeCompositeBackend, ownedInputBackendPlugin, resolveUiOwnership, snapshotFromSample };
