import { useEffect, useState } from "react";

interface ConfettiCelebrationProps {
  show: boolean;
  type?: "fireworks" | "balloons" | "petals";
}

export const ConfettiCelebration = ({ show, type = "fireworks" }: ConfettiCelebrationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; rotation: number; delay: number }>>([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || particles.length === 0) return null;

  const getEmoji = () => {
    switch (type) {
      case "balloons":
        return ["🎈", "🎉", "🎊"];
      case "petals":
        return ["🌸", "🌺", "🌼", "🌻"];
      case "fireworks":
      default:
        return ["✨", "⭐", "💫", "🌟"];
    }
  };

  const emojis = getEmoji();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-3xl animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        >
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </div>
      ))}
    </div>
  );
};