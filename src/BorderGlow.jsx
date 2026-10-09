import React, { useCallback, useEffect, useRef } from 'react';
import './BorderGlow.css';

function parseHSL(value) {
  const match = value.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor);
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  return Object.fromEntries(opacities.map((opacity, index) => [
    `--glow-color${keys[index]}`,
    `hsl(${h}deg ${s}% ${l}% / ${Math.min(opacity * intensity, 100)}%)`,
  ]));
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors) {
  const palette = colors.length ? colors : ['#c0c0c0'];
  const variables = {};
  GRADIENT_KEYS.forEach((key, index) => {
    const color = palette[Math.min(COLOR_MAP[index], palette.length - 1)];
    variables[key] = `radial-gradient(at ${GRADIENT_POSITIONS[index]}, ${color} 0px, transparent 50%)`;
  });
  variables['--gradient-base'] = `linear-gradient(${palette[0]} 0 100%)`;
  return variables;
}

function isLightColor(color) {
  const value = color.trim().replace('#', '');
  if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
  const hex = value.length === 3 ? value.split('').map((character) => character + character).join('') : value;
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180;
}

const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
const easeInCubic = (value) => value * value * value;

function BorderGlow({
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '340 35 78',
  backgroundColor = '#120f17',
  borderRadius = 8,
  glowRadius = 24,
  glowIntensity = 0.9,
  coneSpread = 25,
  animated = false,
  colors = ['#c0c0c0', '#ed3c9e', '#f4f1f5'],
  fillOpacity = 0.35,
  style,
}) {
  const cardRef = useRef(null);
  const animationFrames = useRef(new Set());
  const timeouts = useRef(new Set());
  const reducedMotion = useRef(false);

  const getCenter = useCallback((element) => {
    const { width, height } = element.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((element, x, y) => {
    const [centerX, centerY] = getCenter(element);
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const horizontalRatio = deltaX === 0 ? Infinity : centerX / Math.abs(deltaX);
    const verticalRatio = deltaY === 0 ? Infinity : centerY / Math.abs(deltaY);
    return Math.min(Math.max(1 / Math.min(horizontalRatio, verticalRatio), 0), 1);
  }, [getCenter]);

  const getCursorAngle = useCallback((element, x, y) => {
    const [centerX, centerY] = getCenter(element);
    const deltaX = x - centerX;
    const deltaY = y - centerY;
    if (deltaX === 0 && deltaY === 0) return 0;
    return (Math.atan2(deltaY, deltaX) * 180 / Math.PI + 450) % 360;
  }, [getCenter]);

  const setProximity = useCallback((value) => {
    const element = cardRef.current;
    if (!element) return;
    const sensitivity = Math.max(edgeSensitivity, 1);
    element.style.setProperty('--edge-proximity', String(Math.min(value * 100 / sensitivity, 1)));
  }, [edgeSensitivity]);

  const handlePointerMove = useCallback((event) => {
    const card = cardRef.current;
    if (!card || reducedMotion.current) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setProximity(getEdgeProximity(card, x, y));
    card.style.setProperty('--cursor-angle', `${getCursorAngle(card, x, y)}deg`);
  }, [getCursorAngle, getEdgeProximity, setProximity]);

  const handlePointerLeave = useCallback(() => {
    if (!reducedMotion.current) setProximity(0);
  }, [setProximity]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => { reducedMotion.current = motionPreference.matches; };
    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);
    if (!animated || reducedMotion.current) {
      return () => motionPreference.removeEventListener('change', updateMotionPreference);
    }

    const schedule = (callback, delay = 0) => {
      const timeout = window.setTimeout(() => {
        timeouts.current.delete(timeout);
        const frame = window.requestAnimationFrame((time) => {
          animationFrames.current.delete(frame);
          callback(time);
        });
        animationFrames.current.add(frame);
      }, delay);
      timeouts.current.add(timeout);
    };
    const run = ({ start, end, duration, delay = 0, ease = easeOutCubic, update, finish }) => {
      const startAfter = performance.now() + delay;
      const tick = (time) => {
        const progress = Math.min(Math.max((time - startAfter) / duration, 0), 1);
        update(start + (end - start) * ease(progress));
        if (progress < 1) {
          const frame = window.requestAnimationFrame(tick);
          animationFrames.current.add(frame);
        } else if (finish) finish();
      };
      schedule(tick, delay);
    };

    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', '110deg');
    run({ start: 0, end: 100, duration: 500, update: setProximity });
    run({ start: 110, end: 287.5, duration: 1500, ease: easeInCubic, update: (angle) => card.style.setProperty('--cursor-angle', `${angle}deg`) });
    run({ start: 287.5, end: 465, duration: 2250, delay: 1500, update: (angle) => card.style.setProperty('--cursor-angle', `${angle}deg`) });
    run({ start: 100, end: 0, duration: 1500, delay: 2500, ease: easeInCubic, update: setProximity, finish: () => card.classList.remove('sweep-active') });

    return () => {
      motionPreference.removeEventListener('change', updateMotionPreference);
      timeouts.current.forEach(window.clearTimeout);
      animationFrames.current.forEach(window.cancelAnimationFrame);
      timeouts.current.clear();
      animationFrames.current.clear();
      card.classList.remove('sweep-active');
    };
  }, [animated, setProximity]);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`border-glow-card${isLightColor(backgroundColor) ? ' border-glow-card--light' : ''}${className ? ` ${className}` : ''}`}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': `${coneSpread}deg`,
        '--fill-opacity': fillOpacity,
        '--edge-proximity': 0,
        '--cursor-angle': '0deg',
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
        ...style,
      }}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}

export default BorderGlow;
