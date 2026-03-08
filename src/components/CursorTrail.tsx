import { useEffect, useRef } from "react";

export const CursorTrail = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const particles = particlesRef.current;
    if (!dot || !ring || !particles) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let particleCount = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      // Spawn particles occasionally
      const dx = mouseX - lastPos.current.x;
      const dy = mouseY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 20) {
        lastPos.current = { x: mouseX, y: mouseY };
        particleCount++;
        if (particleCount % 2 === 0) {
          const p = document.createElement("div");
          p.className = "cursor-particle";
          p.style.left = `${mouseX}px`;
          p.style.top = `${mouseY}px`;
          particles.appendChild(p);
          setTimeout(() => p.remove(), 600);
        }
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      frameRef.current = requestAnimationFrame(animateRing);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, [role='button'], input, select, textarea, [data-clickable]")) {
        dot.classList.add("hovering");
        ring.classList.add("hovering");
      }
    };

    const onMouseOut = () => {
      dot.classList.remove("hovering");
      ring.classList.remove("hovering");
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    frameRef.current = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Hide on touch devices
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;
  if (isTouchDevice) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={particlesRef} />
    </>
  );
};
