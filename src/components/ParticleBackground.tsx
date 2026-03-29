import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

const PARTICLE_COUNT = 60;
const CONNECTION_DISTANCE = 120;
const CURSOR_REPEL_RADIUS = 100;
const CURSOR_REPEL_STRENGTH = 0.5;

export function ParticleBackground() {
  const prefersReducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function handleResize() {
      width = canvas!.offsetWidth;
      height = canvas!.offsetHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const particleColor = isDark ? '165, 180, 252' : '99, 102, 241'; // indigo-300 / indigo-500

      for (const p of particles) {
        // Cursor repulsion
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_REPEL_RADIUS && dist > 0) {
          const force = (CURSOR_REPEL_RADIUS - dist) / CURSOR_REPEL_RADIUS;
          p.vx += (dx / dist) * force * CURSOR_REPEL_STRENGTH;
          p.vy += (dy / dist) * force * CURSOR_REPEL_STRENGTH;
        }

        // Dampen velocity
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Draw particle
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
        ctx!.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.3;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(${particleColor}, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    // Static gradient mesh fallback
    return (
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 60% 80%, rgba(59,130,246,0.1) 0%, transparent 60%)',
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full -z-10"
      aria-hidden="true"
    />
  );
}
