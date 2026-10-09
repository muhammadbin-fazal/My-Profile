import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Galaxy({
  mouseRepulsion = true,
  mouseInteraction = true,
  density = 1,
  glowIntensity = 0.3,
  saturation = 0,
  hueShift = 140,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  repulsionStrength = 2,
  autoCenterRepulsion = 0,
  starSpeed = 0.5,
  speed = 1,
  className = '',
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return undefined;
    }

    const scene = new THREE.Scene();
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    camera.position.z = 1;
    const count = Math.max(180, Math.min(3000, Math.round(520 * Math.max(density, 0.1))));
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const hues = new Float32Array(count);

    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() * 2 - 1) * aspect;
      positions[index * 3 + 1] = Math.random() * 2 - 1;
      positions[index * 3 + 2] = 0;
      sizes[index] = 0.65 + Math.random() * 1.8;
      phases[index] = Math.random() * Math.PI * 2;
      speeds[index] = 0.35 + Math.random() * 1.3;
      hues[index] = Math.random() * 0.18 - 0.09;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aPosition', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aHue', new THREE.BufferAttribute(hues, 1));

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uBounds: { value: new THREE.Vector2(aspect, 1) },
      uMouse: { value: new THREE.Vector2(100, 100) },
      uMouseActive: { value: 0 },
      uMouseEnabled: { value: mouseRepulsion && mouseInteraction ? 1 : 0 },
      uRepulsion: { value: Math.max(0, repulsionStrength) * 0.13 },
      uCenterRepulsion: { value: Math.max(0, autoCenterRepulsion) * 0.13 },
      uRotation: { value: rotationSpeed },
      uStarSpeed: { value: starSpeed },
      uTwinkle: { value: Math.max(0, twinkleIntensity) },
      uGlow: { value: Math.max(0, glowIntensity) },
      uHue: { value: ((hueShift % 360) + 360) % 360 / 360 },
      uSaturation: { value: Math.min(1, Math.max(0, saturation)) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute vec3 aPosition;
        attribute float aSize;
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aHue;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uBounds;
        uniform vec2 uMouse;
        uniform float uMouseActive;
        uniform float uMouseEnabled;
        uniform float uRepulsion;
        uniform float uCenterRepulsion;
        uniform float uRotation;
        uniform float uStarSpeed;
        uniform float uTwinkle;
        uniform float uGlow;
        uniform float uHue;
        varying float vAlpha;
        varying float vHue;

        void main() {
          vec2 point = aPosition.xy;
          float angle = uTime * uRotation * 0.12;
          float cosine = cos(angle);
          float sine = sin(angle);
          point = mat2(cosine, -sine, sine, cosine) * point;
          point.y = mod(point.y + uTime * uStarSpeed * aSpeed * 0.035 + 1.0, 2.0) - 1.0;

          vec2 mouseDelta = point - uMouse * uBounds;
          float mouseDistance = length(mouseDelta);
          float mouseForce = (1.0 - smoothstep(0.0, 0.42, mouseDistance)) * uRepulsion * uMouseActive * uMouseEnabled;
          point += normalize(mouseDelta + vec2(0.0001)) * mouseForce;

          vec2 centerDelta = point;
          float centerDistance = length(centerDelta);
          float centerForce = (1.0 - smoothstep(0.0, 0.55, centerDistance)) * uCenterRepulsion;
          point += normalize(centerDelta + vec2(0.0001)) * centerForce;

          vec4 viewPosition = modelViewMatrix * vec4(point, 0.0, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = aSize * (1.0 + uResolution.y / 850.0) * (1.0 + uGlow * 0.35);
          vAlpha = 0.56 + (0.44 * (0.5 + 0.5 * sin(uTime * aSpeed + aPhase)) * uTwinkle);
          vHue = uHue + aHue;
        }
      `,
      fragmentShader: `
        uniform float uHue;
        uniform float uSaturation;
        uniform float uGlow;
        varying float vAlpha;
        varying float vHue;

        vec3 hueToRgb(float hue) {
          vec3 rgb = abs(fract(hue + vec3(0.0, 0.6666667, 0.3333333)) * 6.0 - 3.0);
          return clamp(rgb - 1.0, 0.0, 1.0);
        }

        void main() {
          float radius = length(gl_PointCoord - 0.5) * 2.0;
          float core = 1.0 - smoothstep(0.18, 0.72, radius);
          float halo = exp(-radius * 5.2) * uGlow;
          float alpha = max(core, halo) * vAlpha;
          vec3 tint = hueToRgb(vHue);
          vec3 color = mix(vec3(0.84, 0.91, 0.94), tint, uSaturation);
          gl_FragColor = vec4(color * (0.82 + halo * 1.6), alpha);
          if (alpha < 0.015) discard;
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.className = 'galaxy-canvas';
    container.appendChild(renderer.domElement);

    const pointer = new THREE.Vector2(100, 100);
    const onPointerMove = (event) => {
      if (!mouseInteraction || !mouseRepulsion) return;
      const rect = container.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) {
        uniforms.uMouseActive.value = 0;
        return;
      }
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, 1 - ((event.clientY - rect.top) / rect.height) * 2);
      uniforms.uMouse.value.copy(pointer);
      uniforms.uMouseActive.value = 1;
    };
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = Math.max(container.clientWidth, 1);
      const nextHeight = Math.max(container.clientHeight, 1);
      const nextAspect = nextWidth / nextHeight;
      camera.left = -nextAspect;
      camera.right = nextAspect;
      camera.updateProjectionMatrix();
      uniforms.uBounds.value.set(nextAspect, 1);
      uniforms.uResolution.value.set(nextWidth, nextHeight);
      renderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const startTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrame = 0;
    const renderFrame = () => {
      uniforms.uTime.value = ((performance.now() - startTime) / 1000) * speed;
      renderer.render(scene, camera);
      if (!reducedMotion) animationFrame = requestAnimationFrame(renderFrame);
    };
    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [autoCenterRepulsion, density, glowIntensity, hueShift, mouseInteraction, mouseRepulsion, repulsionStrength, rotationSpeed, saturation, speed, starSpeed, twinkleIntensity]);

  return <div ref={containerRef} className={`galaxy-background ${className}`} aria-hidden="true" />;
}

export default Galaxy;
