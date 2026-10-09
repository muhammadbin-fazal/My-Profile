import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import './RubberSegment.css';

const EASE_OUT = [0.23, 1, 0.32, 1];
const SPRING_UI = { type: 'spring', duration: 0.3, bounce: 0 };
const SPRING_MOMENTUM = { type: 'spring', duration: 0.4, bounce: 0.2 };
const SPRING_RELAX = { type: 'spring', duration: 0.16, bounce: 0 };
const DILATE = 0.19;
const HANDOFF = 0.15;
const FLICK = 110;
const MAX_VELOCITY = 2000;
const DEADZONE = 4;
const SLOP = 10;
const RUBBER = 0.55;
const SIZES = {
  sm: { height: 28, font: 12, pad: 10, min: 36 },
  md: { height: 36, font: 13, pad: 14, min: 44 },
  lg: { height: 44, font: 14, pad: 18, min: 48 },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rubber = (over, dim) => (over * dim * RUBBER) / (dim + RUBBER * Math.abs(over));
const project = (velocity, glide) => {
  const decay = 1 - 0.1 * Math.pow(0.05, glide / 100);
  return ((velocity / 1000) * decay) / (1 - decay);
};
const velocityOf = (history, now) => {
  const recent = history.filter(([time]) => now - time <= 100);
  if (recent.length < 2) return 0;
  const [startTime, startX] = recent[0];
  const [endTime, endX] = recent[recent.length - 1];
  return endTime - startTime >= 8 ? ((endX - startX) / (endTime - startTime)) * 1000 : 0;
};
const nearestSlot = (slots, x) => {
  let best = 0;
  for (let index = 1; index < slots.length; index += 1) {
    if (Math.abs((slots[index].l + slots[index].r) / 2 - x) < Math.abs((slots[best].l + slots[best].r) / 2 - x)) best = index;
  }
  return best;
};

function RubberSegment({
  items,
  value,
  defaultValue,
  onChange,
  trackColor = '#27272a',
  thumbColor = '#fafafa',
  textColor = '#fafafa',
  activeTextColor = '#18181b',
  size = 'md',
  radius = 10,
  inset = 3,
  equalSlots = true,
  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,
  draggable = true,
  disabled = false,
  className = '',
  'aria-label': ariaLabel = 'Segmented control',
}) {
  const list = items.map((item) => (typeof item === 'string' ? { value: item, label: item } : item));
  const [inner, setInner] = useState(defaultValue ?? list[0]?.value);
  const current = value !== undefined ? value : inner;
  const index = Math.max(0, list.findIndex((item) => item.value === current));
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const slots = useRef([]);
  const box = useRef(null);
  const committed = useRef(index);
  const handoff = useRef(0);
  const drag = useRef(null);
  const gen = useRef(0);

  const edgeL = useMotionValue(0);
  const edgeR = useMotionValue(0);
  const innerW = useMotionValue(0);
  const thumbRadius = Math.max(0, radius - inset);
  const clipPath = useTransform(
    () => `inset(0 ${Math.max(0, innerW.get() - edgeR.get())}px 0 ${Math.max(0, edgeL.get())}px round ${thumbRadius}px)`,
  );
  const t = (seconds) => seconds / Math.max(speed, 0.01);

  const jumpTo = (slotIndex) => {
    const slot = slots.current[slotIndex];
    if (!slot) return;
    clearTimeout(handoff.current);
    gen.current += 1;
    edgeL.jump(slot.l);
    edgeR.jump(slot.r);
  };

  const measure = () => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    box.current = rect;
    slots.current = list.map((_, slotIndex) => {
      const element = itemRefs.current[slotIndex];
      if (!element) return { l: 0, r: 0 };
      const itemRect = element.getBoundingClientRect();
      return { l: itemRect.left - rect.left - inset, r: itemRect.right - rect.left - inset };
    });
    innerW.set(rect.width - inset * 2);
    jumpTo(committed.current);
  };

  const listKey = list.map((item) => item.value).join('|');
  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    if (typeof document !== 'undefined' && document.fonts) document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [listKey, size, inset, equalSlots]);

  useEffect(() => {
    if (!drag.current && committed.current !== index) {
      committed.current = index;
      jumpTo(index);
    }
  });

  useEffect(() => () => {
    clearTimeout(handoff.current);
    edgeL.stop();
    edgeR.stop();
  }, [edgeL, edgeR]);

  const commit = (slotIndex) => {
    committed.current = slotIndex;
    if (slotIndex === index) return;
    if (value === undefined) setInner(list[slotIndex].value);
    onChange?.(list[slotIndex].value, slotIndex);
  };

  const land = (slotIndex, velocity, flick, withSquash) => {
    const slot = slots.current[slotIndex];
    if (!slot) return;
    const generation = ++gen.current;
    const direction = Math.sign((slot.l + slot.r) / 2 - (edgeL.get() + edgeR.get()) / 2) || 1;
    const [lead, leadTo, trail, trailTo] = direction > 0
      ? [edgeR, slot.r, edgeL, slot.l]
      : [edgeL, slot.l, edgeR, slot.r];
    const velocityFor = (motionValue) => clamp(velocity === null ? motionValue.getVelocity() : velocity, -MAX_VELOCITY, MAX_VELOCITY);
    animate(lead, leadTo, {
      ...(flick ? SPRING_MOMENTUM : SPRING_UI),
      duration: t(flick ? 0.4 : 0.3),
      velocity: velocityFor(lead),
    });
    const trailVelocity = velocityFor(trail);
    if (!withSquash || squash <= 0) {
      animate(trail, trailTo, { ...SPRING_UI, duration: t(0.3), velocity: trailVelocity });
      return;
    }
    animate(trail, trailTo + direction * squash, { ...SPRING_UI, duration: t(0.3), velocity: trailVelocity }).then(() => {
      if (gen.current === generation) animate(trail, trailTo, { ...SPRING_RELAX, duration: t(0.16) });
    });
  };

  const travel = (from, to) => {
    const start = slots.current[from];
    const end = slots.current[to];
    if (!start || !end) return;
    clearTimeout(handoff.current);
    gen.current += 1;
    if (reduce) {
      edgeL.jump(end.l);
      edgeR.jump(end.r);
      return;
    }
    const stretchFactor = stretch / 100;
    const tween = { duration: t(DILATE), ease: EASE_OUT };
    animate(edgeL, end.l + (Math.min(start.l, end.l) - end.l) * stretchFactor, tween);
    animate(edgeR, end.r + (Math.max(start.r, end.r) - end.r) * stretchFactor, tween);
    handoff.current = setTimeout(() => land(to, null, false, true), t(HANDOFF) * 1000);
  };

  const localX = (event) => event.clientX - (box.current ? box.current.left : 0) - inset;

  const handlePointerDown = (event, slotIndex) => {
    if (disabled || drag.current || event.button !== 0) return;
    box.current = trackRef.current.getBoundingClientRect();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}
    const x = localX(event);
    const onThumb = draggable && x >= edgeL.get() && x <= edgeR.get();
    drag.current = { id: event.pointerId, x0: x, slot: slotIndex, onThumb, live: false, offset: 0, w: 0, hist: [[event.timeStamp, x]] };
    if (onThumb) {
      clearTimeout(handoff.current);
      gen.current += 1;
      edgeL.stop();
      edgeR.stop();
    } else if (!reduce) {
      event.currentTarget.dataset.pressed = '';
    }
  };

  const handlePointerMove = (event) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id || !state.onThumb) return;
    const x = localX(event);
    state.hist.push([event.timeStamp, x]);
    if (state.hist.length > 8) state.hist.shift();
    if (!state.live) {
      if (Math.abs(x - state.x0) < DEADZONE) return;
      state.live = true;
      state.offset = x - edgeL.get();
      state.w = edgeR.get() - edgeL.get();
      if (trackRef.current) trackRef.current.dataset.held = '';
    }
    const width = innerW.get();
    const left = x - state.offset;
    const maxLeft = width - state.w;
    if (reduce) {
      const clampedLeft = clamp(left, 0, maxLeft);
      edgeL.set(clampedLeft);
      edgeR.set(clampedLeft + state.w);
    } else if (left < 0) {
      edgeL.set(0);
      edgeR.set(state.w - rubber(-left, state.w));
    } else if (left > maxLeft) {
      edgeR.set(width);
      edgeL.set(maxLeft + rubber(left - maxLeft, state.w));
    } else {
      edgeL.set(left);
      edgeR.set(left + state.w);
    }
  };

  const release = () => {
    const state = drag.current;
    drag.current = null;
    if (!state) return null;
    if (trackRef.current) delete trackRef.current.dataset.held;
    const element = itemRefs.current[state.slot];
    if (element) delete element.dataset.pressed;
    return state;
  };

  const handlePointerUp = (event) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    release();
    const x = localX(event);
    if (!state.live) {
      if (Math.abs(x - state.x0) <= SLOP && state.slot !== committed.current) {
        const from = committed.current;
        commit(state.slot);
        travel(from, state.slot);
      }
      return;
    }
    const velocity = velocityOf(state.hist, event.timeStamp);
    const flick = Math.abs(velocity) > FLICK;
    let to = nearestSlot(slots.current, (edgeL.get() + edgeR.get()) / 2 + project(velocity, glide));
    if (flick && to === committed.current) to = clamp(to + Math.sign(velocity), 0, list.length - 1);
    commit(to);
    if (reduce) jumpTo(to);
    else land(to, velocity, flick, flick);
  };

  const handlePointerCancel = (event) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    release();
    if (!state.live) return;
    if (reduce) jumpTo(committed.current);
    else land(committed.current, null, false, false);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    const last = list.length - 1;
    let next = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = Math.min(last, index + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    if (next === index) return;
    commit(next);
    jumpTo(next);
    itemRefs.current[next]?.focus();
  };

  const preset = SIZES[size] || SIZES.md;

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      data-equal={equalSlots ? '' : undefined}
      data-draggable={draggable && !disabled ? '' : undefined}
      className={`rubber-segment${className ? ` ${className}` : ''}`}
      style={{
        '--rs-track': trackColor,
        '--rs-thumb': thumbColor,
        '--rs-ink': textColor,
        '--rs-ink-active': activeTextColor,
        '--rs-radius': `${radius}px`,
        '--rs-inset': `${inset}px`,
        '--rs-thumb-radius': `${thumbRadius}px`,
        '--rs-h': `${preset.height}px`,
        '--rs-font': `${preset.font}px`,
        '--rs-pad': `${preset.pad}px`,
        '--rs-min': `${preset.min}px`,
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handlePointerCancel}
    >
      {list.map((item, slotIndex) => (
        <button
          key={item.value}
          ref={(element) => { itemRefs.current[slotIndex] = element; }}
          type="button"
          role="radio"
          aria-checked={slotIndex === index}
          tabIndex={slotIndex === index ? 0 : -1}
          disabled={disabled}
          className="rubber-segment__item"
          onPointerDown={(event) => handlePointerDown(event, slotIndex)}
          onKeyDown={handleKeyDown}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      <motion.div className="rubber-segment__thumb" aria-hidden="true" style={{ clipPath }}>
        {list.map((item) => (
          <span key={item.value} className="rubber-segment__item rubber-segment__copy">
            {item.icon}
            {item.label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default RubberSegment;
