import React from 'react';
import './ReflectiveCard.css';

function ReflectiveCard({
  children,
  blurStrength = 12,
  color = '#f6f3f7',
  metalness = 0.8,
  roughness = 0.4,
  overlayColor = 'rgba(255, 255, 255, 0.08)',
  displacementStrength = 20,
  noiseScale = 1,
  specularConstant = 1.2,
  grayscale = 1,
  glassDistortion = 0,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`reflective-card ${className}`.trim()}
      style={{
        '--reflective-blur': `${blurStrength}px`,
        '--reflective-color': color,
        '--reflective-metalness': metalness,
        '--reflective-roughness': roughness,
        '--reflective-overlay': overlayColor,
        '--reflective-displacement': `${displacementStrength}px`,
        '--reflective-noise-scale': noiseScale,
        '--reflective-specular': specularConstant,
        '--reflective-saturation': 1 - Math.min(1, Math.max(0, grayscale)),
        '--reflective-distortion': `${glassDistortion}px`,
        ...style,
      }}
    >
      <div className="reflective-card__glass" aria-hidden="true" />
      <div className="reflective-card__noise" aria-hidden="true" />
      <div className="reflective-card__sheen" aria-hidden="true" />
      <div className="reflective-card__content">{children}</div>
    </div>
  );
}

export default ReflectiveCard;
