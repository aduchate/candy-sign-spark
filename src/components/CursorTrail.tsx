import { useEffect, useRef } from "react";

export const CursorTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef<{ x: number; y: number; age: number; vx: number; vy: number }[]>([]);
  const frameRef = useRef(0);
  const hoverRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const getColor = () => {
      const el = document.querySelector("[class*='theme-']");
      if (!el) return "hsl(220, 80%, 55%)";
      return getComputedStyle(el).getPropertyValue("--cursor-color").trim() || "hsl(220, 80%, 55%)";
    };

    let lastSpawn = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      
      const now = Date.now();
      if (now - lastSpawn > 16) {
        lastSpawn = now;
        // Spawn trail particles with random velocity
        for (let i = 0; i < 1; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1 + 0.3;
          trailRef.current.push({
            x: e.clientX,
            y: e.clientY,
            age: 0,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
          });
        }
        // Limit particles
        if (trailRef.current.length > 60) {
          trailRef.current = trailRef.current.slice(-60);
        }
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      hoverRef.current = !!target.closest("button, a, [role='button'], input, select, textarea");
    };

    const onMouseOut = () => {
      hoverRef.current = false;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = getColor();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hovering = hoverRef.current;
      const time = Date.now() * 0.003;

      // Draw trail particles as fading sparkles
      trailRef.current.forEach((p) => {
        p.age += 0.02;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02;

        if (p.age < 1) {
          const alpha = 1 - p.age;
          const size = (1 - p.age) * 3;
          ctx.save();
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 12;
          
          // Star sparkle shape
          ctx.translate(p.x, p.y);
          ctx.rotate(p.age * 3);
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            const a = (s / 4) * Math.PI * 2;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * size * 2.5, Math.sin(a) * size * 2.5);
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Remove dead particles
      trailRef.current = trailRef.current.filter((p) => p.age < 1);

      // Glow halo behind cursor
      ctx.save();
      ctx.translate(mx, my);
      const glowR = hovering ? 50 : 35;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
      gradient.addColorStop(0, color.replace(')', ' / 0.35)').replace('hsl(', 'hsla('));
      gradient.addColorStop(0.5, color.replace(')', ' / 0.1)').replace('hsl(', 'hsla('));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Main cursor — morphing polygon
      const sides = hovering ? 6 : 3;
      const baseRadius = hovering ? 26 : 18;
      const wobble = hovering ? 5 : 7;

      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(time * 0.8);
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        const r = baseRadius + Math.sin(time * 3 + i * 2) * wobble;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Inner pulsing dot
      ctx.save();
      ctx.translate(mx, my);
      const dotR = 4 + Math.sin(time * 5) * 2;
      ctx.globalAlpha = 1;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, dotR, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Orbiting dots
      for (let i = 0; i < 3; i++) {
        const orbitAngle = time * 2 + (i / 3) * Math.PI * 2;
        const orbitR = hovering ? 35 : 24;
        const ox = mx + Math.cos(orbitAngle) * orbitR;
        const oy = my + Math.sin(orbitAngle) * orbitR;
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Hide on touch devices
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  if (isTouchDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: "multiply" }}
    />
  );
};
