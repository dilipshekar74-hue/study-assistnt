import React, { useEffect, useRef } from 'react';

/**
 * AstraGlitterCanvas
 * High-performance, GPU-accelerated interactive particle stardust
 * featuring 4-point cross-glitter blooms and cursor attraction physics.
 * Adheres strictly to .agents/rules/visual-effects.md and .agents/rules/ved-ui-system.md
 */
export default function AstraGlitterCanvas({
  particleCount = 65,
  interactionRadius = 170,
  attractionStrength = 0.045,
  className = ''
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isHovering: false });
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Accessibility Invariant: abort if reduced motion preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      if (!canvas) return;
      // Device Pixel Ratio capped at 2 to avoid GPU thermal throttling
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Astra Chromatic Palette per .agents/rules/visual-effects.md:
    // 60% Indigo, 20% Electric Cyan, 10% Solar Amber, 10% Starlight White
    const getAstraColor = () => {
      const rand = Math.random();
      if (rand < 0.60) {
        return Math.random() > 0.5 ? { r: 99, g: 102, b: 241 } : { r: 129, g: 140, b: 248 }; // Indigo / Violet
      } else if (rand < 0.80) {
        return { r: 6, g: 182, b: 212 }; // Electric Cyan
      } else if (rand < 0.90) {
        return { r: 245, g: 158, b: 11 }; // Solar Amber
      } else {
        return { r: 255, g: 255, b: 255 }; // Starlight White
      }
    };

    // Particle Factory
    const createParticle = () => {
      const isStar = Math.random() > 0.45; // 55% stars, 45% soft micro-particles
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: isStar ? Math.random() * 2.8 + 1.2 : Math.random() * 1.5 + 0.6,
        color: getAstraColor(),
        isStar,
        alpha: 0.45,
        shimmerSpeed: Math.random() * 0.035 + 0.015,
        shimmerAngle: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
      };
    };

    const particles = Array.from({ length: particleCount }, createParticle);

    // Draw a 4-pointed cross star flare
    const drawStar = (x, y, radius, alpha, color, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.8})`;
      ctx.shadowBlur = radius * 4;

      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.lineTo(radius * 2.4, 0);
        ctx.lineTo(radius * 0.3, radius * 0.3);
      }
      ctx.closePath();
      ctx.fill();

      // Core hot center
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.3)})`;
      ctx.fill();
      ctx.restore();
    };

    // Draw circular soft bokeh micro-particle
    const drawDot = (x, y, radius, alpha, color) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.6})`;
      ctx.shadowBlur = radius * 3;
      ctx.fill();
      ctx.restore();
    };

    // Main Kinetic Loop
    let isActive = true;
    const render = () => {
      if (!isActive) return;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Shimmer sinusoidal breathing alpha cycles between 0.15 and 0.75
        p.shimmerAngle += p.shimmerSpeed;
        p.alpha = 0.45 + Math.sin(p.shimmerAngle) * 0.30;
        p.rotation += p.rotationSpeed;

        // 2. Cursor Gravitational Pull: Inverse-square vector pull within interactionRadius
        if (mouse.isHovering) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < interactionRadius && dist > 1) {
            const nx = dx / dist;
            const ny = dy / dist;
            const normalizedDist = dist / interactionRadius;
            const falloff = 1 - normalizedDist;
            // Inverse-square attraction with softening factor
            const invSquare = (interactionRadius * interactionRadius) / (dist * dist + 400);
            const pull = attractionStrength * invSquare * falloff * 2.5;

            p.vx += nx * pull;
            p.vy += ny * pull;
            // Flare up particle brightness on proximity up to 1.0 max per visual-effects.md
            p.alpha = Math.min(1.0, p.alpha + falloff * 0.55);
          }
        }

        // 3. Movement and Viscous Friction
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;

        // 4. Subtle ambient drift
        p.x += (Math.random() - 0.5) * 0.2;
        p.y += (Math.random() - 0.5) * 0.2;

        // 5. Boundary wrapping
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // 6. Canvas Painting with clamped alpha (ambient max 0.75, hover flare max 1.0)
        const clampedAlpha = Math.max(0.15, Math.min(1.0, p.alpha));
        if (p.isStar) {
          drawStar(p.x, p.y, p.size, clampedAlpha, p.color, p.rotation);
        } else {
          drawDot(p.x, p.y, p.size, clampedAlpha, p.color);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Mouse & Pointer Handlers (passive listeners per visual-effects.md)
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        isHovering: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isActive = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleCount, interactionRadius, attractionStrength]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[1] h-full w-full ${className}`}
    />
  );
}
