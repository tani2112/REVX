import React, { useEffect, useRef, useState } from 'react';

interface GalaxyCanvasProps {
  activePhase?: 'PLAN' | 'EXECUTE' | 'VERIFY' | null;
  onSelectPhase?: (phase: 'PLAN' | 'EXECUTE' | 'VERIFY') => void;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  angle: number;
  dist: number;
  orbitSpeed: number;
  layer: 'core' | 'arm' | 'gold' | 'bg';
}

export const GalaxyCanvas: React.FC<GalaxyCanvasProps> = ({
  activePhase = 'EXECUTE',
  onSelectPhase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredPhase, setHoveredPhase] = useState<'PLAN' | 'EXECUTE' | 'VERIFY' | null>(null);

  // Positions of the 3 callout nodes relative to center of galaxy:
  // We compute these dynamically based on container dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth || 800,
          height: clientHeight || 600,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isReducedMotion = mediaQuery.matches;

    const width = dimensions.width;
    const height = dimensions.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Galaxy center (slightly offset to right like in reference screenshot)
    const centerX = width * 0.52;
    const centerY = height * 0.48;
    const maxRadius = Math.min(width, height) * 0.48;

    // Generate ~1500 particles
    const particles: Particle[] = [];
    const numArms = 2;
    const armWinding = 3.6;

    // 1. Core particles (very bright white/blue)
    for (let i = 0; i < 350; i++) {
      const dist = Math.pow(Math.random(), 2.2) * (maxRadius * 0.22);
      const angle = Math.random() * Math.PI * 2;
      const isPureWhite = Math.random() > 0.4;
      particles.push({
        x: 0,
        y: 0,
        radius: Math.random() * 1.6 + 0.6,
        color: isPureWhite ? '#ffffff' : '#93c5fd',
        alpha: Math.random() * 0.8 + 0.2,
        baseAlpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        angle,
        dist,
        orbitSpeed: (0.0006 + (1 - dist / maxRadius) * 0.0008),
        layer: 'core',
      });
    }

    // 2. Spiral arm particles (blue and white)
    for (let i = 0; i < 900; i++) {
      const arm = i % numArms;
      const baseArmAngle = (arm * Math.PI * 2) / numArms;
      const distProgress = Math.pow(Math.random(), 0.85); // bias slightly outward
      const dist = (maxRadius * 0.12) + distProgress * (maxRadius * 0.88);
      const spiralAngle = baseArmAngle + distProgress * armWinding;

      // Add radial noise / jitter perpendicular to arm
      const jitter = (Math.random() - 0.5) * (0.35 + distProgress * 0.45);
      const angle = spiralAngle + jitter;

      const isWhite = Math.random() > 0.55;
      const isElectricBlue = Math.random() > 0.4;
      const color = isWhite ? '#f8fafc' : isElectricBlue ? '#60a5fa' : '#38bdf8';

      particles.push({
        x: 0,
        y: 0,
        radius: Math.random() * 1.5 + 0.5,
        color,
        alpha: Math.random() * 0.7 + 0.3,
        baseAlpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: 0.015 + Math.random() * 0.03,
        angle,
        dist,
        orbitSpeed: (0.0004 + (1 - dist / maxRadius) * 0.0006),
        layer: 'arm',
      });
    }

    // 3. Warm gold / amber interior particles (as seen in reference screenshot)
    for (let i = 0; i < 220; i++) {
      const arm = i % numArms;
      const baseArmAngle = (arm * Math.PI * 2) / numArms;
      const distProgress = Math.pow(Math.random(), 1.2) * 0.65; // closer to inner-mid
      const dist = (maxRadius * 0.08) + distProgress * (maxRadius * 0.65);
      const spiralAngle = baseArmAngle + distProgress * armWinding + 0.2;
      const jitter = (Math.random() - 0.5) * 0.3;
      const angle = spiralAngle + jitter;

      const goldShades = ['#fde047', '#fbbf24', '#f59e0b', '#d97706'];
      const color = goldShades[Math.floor(Math.random() * goldShades.length)];

      particles.push({
        x: 0,
        y: 0,
        radius: Math.random() * 1.4 + 0.6,
        color,
        alpha: Math.random() * 0.75 + 0.25,
        baseAlpha: Math.random() * 0.75 + 0.25,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        angle,
        dist,
        orbitSpeed: (0.0005 + (1 - dist / maxRadius) * 0.0007),
        layer: 'gold',
      });
    }

    // 4. Background stardust
    for (let i = 0; i < 160; i++) {
      const dist = Math.random() * maxRadius * 1.15;
      const angle = Math.random() * Math.PI * 2;
      particles.push({
        x: 0,
        y: 0,
        radius: Math.random() * 1.1 + 0.3,
        color: Math.random() > 0.5 ? '#94a3b8' : '#e2e8f0',
        alpha: Math.random() * 0.4 + 0.1,
        baseAlpha: Math.random() * 0.4 + 0.1,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        angle,
        dist,
        orbitSpeed: 0.0002,
        layer: 'bg',
      });
    }

    // Render loop
    const render = () => {
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Deep galactic backdrop glow
      const bgRadial = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 1.2
      );
      bgRadial.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      bgRadial.addColorStop(0.35, 'rgba(10, 18, 36, 0.2)');
      bgRadial.addColorStop(0.7, 'rgba(5, 7, 12, 0.05)');
      bgRadial.addColorStop(1, 'rgba(5, 7, 12, 0)');
      ctx.fillStyle = bgRadial;
      ctx.fillRect(0, 0, width, height);

      // Subtle nebular gold & cyan dust patches
      const dustCyan = ctx.createRadialGradient(
        centerX + maxRadius * 0.2, centerY - maxRadius * 0.15, 0,
        centerX + maxRadius * 0.2, centerY - maxRadius * 0.15, maxRadius * 0.5
      );
      dustCyan.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
      dustCyan.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = dustCyan;
      ctx.beginPath();
      ctx.arc(centerX + maxRadius * 0.2, centerY - maxRadius * 0.15, maxRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Render concentric / orbital rings
      const ringRadii = [maxRadius * 0.38, maxRadius * 0.65, maxRadius * 0.88];
      ringRadii.forEach((r, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = idx === 1 ? 'rgba(59, 130, 246, 0.16)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx === 1 ? [3, 8] : [2, 10]);
        // Slight tilt
        ctx.ellipse(centerX, centerY, r * 1.08, r * 0.82, -0.22, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]); // reset dash

      // Galactic Core Glow (Multi-layer bright star core)
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, maxRadius * 0.28
      );
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreGradient.addColorStop(0.12, 'rgba(238, 246, 255, 0.85)');
      coreGradient.addColorStop(0.3, 'rgba(96, 165, 250, 0.45)');
      coreGradient.addColorStop(0.55, 'rgba(37, 99, 235, 0.18)');
      coreGradient.addColorStop(1, 'rgba(5, 7, 12, 0)');

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Central diamond flare
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw particles
      const speedMultiplier = isReducedMotion ? 0.05 : 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.orbitSpeed * speedMultiplier;

        // Twinkle effect
        p.alpha = p.baseAlpha + Math.sin(rotation * p.twinkleSpeed * 50 + i) * 0.18;
        if (p.alpha < 0.05) p.alpha = 0.05;
        if (p.alpha > 1) p.alpha = 1;

        // Elliptical galaxy projection with inclination tilt
        const tilt = -0.22;
        const rawX = Math.cos(p.angle) * p.dist * 1.08;
        const rawY = Math.sin(p.angle) * p.dist * 0.82;

        const rotX = rawX * Math.cos(tilt) - rawY * Math.sin(tilt);
        const rotY = rawX * Math.sin(tilt) + rawY * Math.cos(tilt);

        const x = centerX + rotX;
        const y = centerY + rotY;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(x, y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      ctx.restore();

      rotation += 0.008 * speedMultiplier;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  // Coordinates for the 3 Nodes matching the reference screenshot:
  // Node 1: PLAN (Top Left of galaxy)
  // Node 2: EXECUTE (Right side of galaxy)
  // Node 3: VERIFY (Bottom Left / Center of galaxy)
  const centerX = dimensions.width * 0.52;
  const centerY = dimensions.height * 0.48;
  const radius = Math.min(dimensions.width, dimensions.height) * 0.42;

  const planNodePos = {
    x: centerX - radius * 0.55,
    y: centerY - radius * 0.52,
  };

  const executeNodePos = {
    x: centerX + radius * 0.82,
    y: centerY - radius * 0.12,
  };

  const verifyNodePos = {
    x: centerX + radius * 0.22,
    y: centerY + radius * 0.56,
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] lg:min-h-[620px] select-none overflow-visible flex items-center justify-center"
      style={{ isolation: 'isolate' }}
    >
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* SVG Leader Lines connecting Nodes to Labels */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="lineGradPlan" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lineGradExec" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lineGradVerify" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* PLAN Leader Line (from label at [planNodePos.x - 70, planNodePos.y - 45] to node) */}
        <polyline
          points={`
            ${planNodePos.x - 45},${planNodePos.y - 30}
            ${planNodePos.x - 12},${planNodePos.y - 10}
            ${planNodePos.x},${planNodePos.y}
          `}
          fill="none"
          stroke="url(#lineGradPlan)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* EXECUTE Leader Line */}
        <polyline
          points={`
            ${executeNodePos.x},${executeNodePos.y}
            ${executeNodePos.x + 16},${executeNodePos.y - 12}
            ${executeNodePos.x + 46},${executeNodePos.y - 12}
          `}
          fill="none"
          stroke="url(#lineGradExec)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* VERIFY Leader Line */}
        <polyline
          points={`
            ${verifyNodePos.x},${verifyNodePos.y}
            ${verifyNodePos.x + 14},${verifyNodePos.y + 12}
            ${verifyNodePos.x + 48},${verifyNodePos.y + 12}
          `}
          fill="none"
          stroke="url(#lineGradVerify)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* NODE 1: PLAN */}
      <div
        className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
        style={{
          left: `${planNodePos.x}px`,
          top: `${planNodePos.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 4,
        }}
        onClick={() => onSelectPhase?.('PLAN')}
        onMouseEnter={() => setHoveredPhase('PLAN')}
        onMouseLeave={() => setHoveredPhase(null)}
      >
        {/* Outer Glow Halo */}
        <div className="absolute -inset-3 rounded-full bg-white/20 blur-sm animate-pulse" />
        <div className="relative w-5 h-5 rounded-full border-2 border-white/90 bg-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.8)]">
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
        </div>
      </div>

      {/* PLAN Card Label */}
      <div
        className={`absolute pointer-events-auto cursor-pointer transition-all duration-300 ${
          activePhase === 'PLAN' || hoveredPhase === 'PLAN'
            ? 'opacity-100 translate-y-0 scale-105'
            : 'opacity-90 hover:opacity-100'
        }`}
        style={{
          left: `${planNodePos.x - 130}px`,
          top: `${planNodePos.y - 72}px`,
          zIndex: 3,
        }}
        onClick={() => onSelectPhase?.('PLAN')}
        onMouseEnter={() => setHoveredPhase('PLAN')}
        onMouseLeave={() => setHoveredPhase(null)}
      >
        <div className="text-left font-sans">
          <div className="text-[13px] font-bold tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            PLAN
          </div>
          <div className="mt-0.5 space-y-0.5 text-[11px] text-slate-300/80 font-normal leading-tight">
            <div>Understand</div>
            <div>Break down</div>
            <div>Select tools</div>
          </div>
        </div>
      </div>

      {/* NODE 2: EXECUTE */}
      <div
        className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
        style={{
          left: `${executeNodePos.x}px`,
          top: `${executeNodePos.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 4,
        }}
        onClick={() => onSelectPhase?.('EXECUTE')}
        onMouseEnter={() => setHoveredPhase('EXECUTE')}
        onMouseLeave={() => setHoveredPhase(null)}
      >
        {/* Outer Glow Halo */}
        <div className="absolute -inset-3 rounded-full bg-blue-500/30 blur-sm animate-pulse" />
        <div className="relative w-5 h-5 rounded-full border-2 border-blue-400 bg-blue-600/30 flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.9)]">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
        </div>
      </div>

      {/* EXECUTE Card Label */}
      <div
        className={`absolute pointer-events-auto cursor-pointer transition-all duration-300 ${
          activePhase === 'EXECUTE' || hoveredPhase === 'EXECUTE'
            ? 'opacity-100 translate-y-0 scale-105'
            : 'opacity-90 hover:opacity-100'
        }`}
        style={{
          left: `${executeNodePos.x + 52}px`,
          top: `${executeNodePos.y - 30}px`,
          zIndex: 3,
        }}
        onClick={() => onSelectPhase?.('EXECUTE')}
        onMouseEnter={() => setHoveredPhase('EXECUTE')}
        onMouseLeave={() => setHoveredPhase(null)}
      >
        <div className="text-left font-sans">
          <div className="text-[13px] font-bold tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            EXECUTE
          </div>
          <div className="mt-0.5 space-y-0.5 text-[11px] text-slate-300/80 font-normal leading-tight">
            <div>Run steps</div>
            <div>Handle failures</div>
            <div>Recover safely</div>
          </div>
        </div>
      </div>

      {/* NODE 3: VERIFY */}
      <div
        className="absolute cursor-pointer transition-transform duration-300 hover:scale-110"
        style={{
          left: `${verifyNodePos.x}px`,
          top: `${verifyNodePos.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 4,
        }}
        onClick={() => onSelectPhase?.('VERIFY')}
        onMouseEnter={() => setHoveredPhase('VERIFY')}
        onMouseLeave={() => setHoveredPhase(null)}
      >
        {/* Outer Glow Halo */}
        <div className="absolute -inset-3 rounded-full bg-blue-400/25 blur-sm animate-pulse" />
        <div className="relative w-5 h-5 rounded-full border-2 border-blue-400/90 bg-blue-500/20 flex items-center justify-center shadow-[0_0_16px_rgba(96,165,250,0.8)]">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-300 shadow-[0_0_8px_#93c5fd]" />
        </div>
      </div>

      {/* VERIFY Card Label */}
      <div
        className={`absolute pointer-events-auto cursor-pointer transition-all duration-300 ${
          activePhase === 'VERIFY' || hoveredPhase === 'VERIFY'
            ? 'opacity-100 translate-y-0 scale-105'
            : 'opacity-90 hover:opacity-100'
        }`}
        style={{
          left: `${verifyNodePos.x + 54}px`,
          top: `${verifyNodePos.y - 6}px`,
          zIndex: 3,
        }}
        onClick={() => onSelectPhase?.('VERIFY')}
        onMouseEnter={() => setHoveredPhase('VERIFY')}
        onMouseLeave={() => setHoveredPhase(null)}
      >
        <div className="text-left font-sans">
          <div className="text-[13px] font-bold tracking-wider text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            VERIFY
          </div>
          <div className="mt-0.5 space-y-0.5 text-[11px] text-slate-300/80 font-normal leading-tight">
            <div>Check results</div>
            <div>Read back data</div>
            <div>Confirm outcomes</div>
          </div>
        </div>
      </div>
    </div>
  );
};
