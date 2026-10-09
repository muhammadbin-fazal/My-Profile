import React, { useEffect, useRef } from 'react';
import './ElectricBorder.css';

const random = (value) => (Math.sin(value * 12.9898) * 43758.5453) % 1;

function noise2D(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const a = random(x0 + y0 * 57);
  const b = random(x0 + 1 + y0 * 57);
  const c = random(x0 + (y0 + 1) * 57);
  const d = random(x0 + 1 + (y0 + 1) * 57);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
}

function octavedNoise(progress, time, seed, amplitude, frequency) {
  let value = 0;
  let currentAmplitude = amplitude;
  let currentFrequency = frequency;
  for (let octave = 0; octave < 7; octave += 1) {
    value += currentAmplitude * noise2D(currentFrequency * progress + seed * 100, time * currentFrequency * 0.3);
    currentFrequency *= 1.6;
    currentAmplitude *= 0.7;
  }
  return value;
}

function cornerPoint(centerX, centerY, radius, startAngle, progress) {
  const angle = startAngle + progress * Math.PI / 2;
  return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
}

function roundedRectPoint(progress, left, top, width, height, radius) {
  const straightWidth = width - 2 * radius;
  const straightHeight = height - 2 * radius;
  const cornerArc = Math.PI * radius / 2;
  const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc;
  let distance = progress * totalPerimeter;

  if (distance <= straightWidth) return { x: left + radius + distance, y: top };
  distance -= straightWidth;
  if (distance <= cornerArc) return cornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, distance / cornerArc);
  distance -= cornerArc;
  if (distance <= straightHeight) return { x: left + width, y: top + radius + distance };
  distance -= straightHeight;
  if (distance <= cornerArc) return cornerPoint(left + width - radius, top + height - radius, radius, 0, distance / cornerArc);
  distance -= cornerArc;
  if (distance <= straightWidth) return { x: left + width - radius - distance, y: top + height };
  distance -= straightWidth;
  if (distance <= cornerArc) return cornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, distance / cornerArc);
  distance -= cornerArc;
  if (distance <= straightHeight) return { x: left, y: top + height - radius - distance };
  distance -= straightHeight;
  return cornerPoint(left + radius, top + radius, radius, Math.PI, distance / cornerArc);
}

function ElectricBorder({
  children,
  color = '#c0c0c0',
  speed = 1,
  chaos = 0.12,
  borderRadius = 8,
  className = '',
  style,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !container || !context) return undefined;

    const borderOffset = 32;
    const displacement = 24;
    const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 2);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let ratio = pixelRatio();
    let elapsed = 0;
    let previousFrame = 0;
    let animationFrame = 0;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width + borderOffset * 2;
      height = rect.height + borderOffset * 2;
      ratio = pixelRatio();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const draw = (currentTime) => {
      const delta = previousFrame ? Math.min((currentTime - previousFrame) / 1000, 0.05) : 0;
      elapsed += delta * speed;
      previousFrame = currentTime;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.lineCap = 'round';
      context.lineJoin = 'round';

      const left = borderOffset;
      const top = borderOffset;
      const borderWidth = width - borderOffset * 2;
      const borderHeight = height - borderOffset * 2;
      const radius = Math.min(borderRadius, borderWidth / 2, borderHeight / 2);
      const perimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius;
      const sampleCount = Math.max(24, Math.floor(perimeter / 3));

      context.beginPath();
      for (let index = 0; index <= sampleCount; index += 1) {
        const progress = index / sampleCount;
        const point = roundedRectPoint(progress, left, top, borderWidth, borderHeight, radius);
        const x = point.x + octavedNoise(progress * 8, elapsed, 0, chaos, 10) * displacement;
        const y = point.y + octavedNoise(progress * 8, elapsed, 1, chaos, 10) * displacement;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.stroke();
      if (!reducedMotion) animationFrame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
      if (reducedMotion) draw(performance.now());
    });
    updateSize();
    resizeObserver.observe(container);
    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [borderRadius, chaos, color, speed]);

  return (
    <div
      ref={containerRef}
      className={`electric-border ${className}`.trim()}
      style={{ '--electric-border-color': color, '--electric-border-radius': `${borderRadius}px`, ...style }}
    >
      <div className="eb-canvas-container" aria-hidden="true"><canvas ref={canvasRef} className="eb-canvas" /></div>
      <div className="eb-layers" aria-hidden="true"><div className="eb-glow-1" /><div className="eb-glow-2" /><div className="eb-background-glow" /></div>
      <div className="eb-content">{children}</div>
    </div>
  );
}

export default ElectricBorder;
