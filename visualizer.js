/**
 * Canvas-based Dynamic Glowing Voice Orb Visualizer
 * Provides interactive fluid animations for Voice Agent States:
 * 'idle' | 'listening' | 'speaking' | 'processing'
 */
class VoiceOrbVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.state = 'idle'; // 'idle' | 'listening' | 'speaking' | 'processing'
    this.audioLevel = 0.0;
    this.targetAudioLevel = 0.0;
    this.time = 0;
    this.particles = [];
    this.numParticles = 24;

    this.initParticles();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 280;
    this.height = rect.height || 280;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        angle: (i / this.numParticles) * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
        radiusOffset: Math.random() * 20 - 10,
        size: 2 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
  }

  setState(newState) {
    this.state = newState;
    if (newState === 'speaking') {
      this.targetAudioLevel = 0.8;
    } else if (newState === 'listening') {
      this.targetAudioLevel = 0.5;
    } else if (newState === 'processing') {
      this.targetAudioLevel = 0.4;
    } else {
      this.targetAudioLevel = 0.1;
    }
  }

  setAudioLevel(level) {
    this.targetAudioLevel = Math.max(0, Math.min(1, level));
  }

  animate() {
    this.time += 0.035;
    this.audioLevel += (this.targetAudioLevel - this.audioLevel) * 0.12;
    this.render();
    requestAnimationFrame(this.animate);
  }

  render() {
    const { ctx, width, height, time, state } = this;
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.28;

    ctx.clearRect(0, 0, width, height);

    // Dynamic color schemes per state
    let coreColor1, coreColor2, glowColor, ringColor;
    if (state === 'listening') {
      // Emerald / Cyan Active Wave
      coreColor1 = 'rgba(6, 182, 212, 0.9)';
      coreColor2 = 'rgba(16, 185, 129, 0.6)';
      glowColor = 'rgba(6, 182, 212, 0.45)';
      ringColor = 'rgba(52, 211, 153, 0.7)';
    } else if (state === 'speaking') {
      // Violet / Fuchsia Harmonic Wave
      coreColor1 = 'rgba(139, 92, 246, 0.95)';
      coreColor2 = 'rgba(236, 72, 153, 0.75)';
      glowColor = 'rgba(168, 85, 247, 0.45)';
      ringColor = 'rgba(192, 132, 252, 0.8)';
    } else if (state === 'processing') {
      // Amber / Electric Blue Swirl
      coreColor1 = 'rgba(99, 102, 241, 0.9)';
      coreColor2 = 'rgba(245, 158, 11, 0.7)';
      glowColor = 'rgba(99, 102, 241, 0.4)';
      ringColor = 'rgba(251, 191, 36, 0.7)';
    } else {
      // Idle Indigo Glow
      coreColor1 = 'rgba(99, 102, 241, 0.85)';
      coreColor2 = 'rgba(129, 140, 248, 0.4)';
      glowColor = 'rgba(99, 102, 241, 0.25)';
      ringColor = 'rgba(165, 180, 252, 0.35)';
    }

    // 1. Ambient Background Glow
    const bgGrad = ctx.createRadialGradient(
      centerX, centerY, baseRadius * 0.4,
      centerX, centerY, baseRadius * 2.2
    );
    bgGrad.addColorStop(0, glowColor);
    bgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 2. Dynamic Expanding Wave Rings (Active when speaking or listening)
    const waveCount = 3;
    for (let w = 0; w < waveCount; w++) {
      const wavePhase = (time * 0.8 + w * (Math.PI / 1.5)) % (Math.PI * 2);
      const waveSpread = (Math.sin(wavePhase) + 1) / 2;
      const waveRadius = baseRadius + waveSpread * (baseRadius * 0.65 * (this.audioLevel + 0.3));
      const waveAlpha = Math.max(0, (1 - waveSpread) * 0.45 * (this.audioLevel + 0.2));

      ctx.beginPath();
      ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor.replace(/[\d\.]+\)$/, `${waveAlpha})`);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 3. Fluid Pulsing Blob / Deformed Circle (The Core Orb)
    ctx.save();
    ctx.beginPath();
    const points = 36;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      // Perlin-like harmonic distortion
      let noise = 0;
      if (state === 'speaking') {
        noise = Math.sin(angle * 4 + time * 3.5) * 9 * (this.audioLevel + 0.5) +
                Math.cos(angle * 7 - time * 2) * 5 * this.audioLevel;
      } else if (state === 'listening') {
        noise = Math.sin(angle * 6 + time * 4) * 7 * (this.audioLevel + 0.4) +
                Math.sin(angle * 2 - time * 1.5) * 4;
      } else if (state === 'processing') {
        noise = Math.sin(angle * 3 + time * 6) * 6;
      } else {
        noise = Math.sin(angle * 3 + time * 1.2) * 3;
      }

      const r = baseRadius + noise + Math.sin(time * 1.5) * 3;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    // Radial gradient for 3D sphere look
    const orbGrad = ctx.createRadialGradient(
      centerX - baseRadius * 0.35,
      centerY - baseRadius * 0.35,
      baseRadius * 0.1,
      centerX, centerY, baseRadius * 1.15
    );
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.25, coreColor1);
    orbGrad.addColorStop(0.85, coreColor2);
    orbGrad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');

    ctx.fillStyle = orbGrad;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;
    ctx.fill();
    ctx.restore();

    // 4. Orbiting Constellation Particles
    this.particles.forEach((p, idx) => {
      p.angle += p.speed * (state === 'processing' ? 2.5 : 1);
      const orbitR = baseRadius * 1.25 + Math.sin(time * 2 + idx) * 8 + p.radiusOffset;
      const px = centerX + Math.cos(p.angle) * orbitR;
      const py = centerY + Math.sin(p.angle) * orbitR;

      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fillStyle = ringColor.replace(/[\d\.]+\)$/, `${p.alpha})`);
      ctx.shadowBlur = 8;
      ctx.shadowColor = ringColor;
      ctx.fill();
    });

    // 5. Specular Gloss Highlight (Glass Sphere reflection)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      centerX - baseRadius * 0.3,
      centerY - baseRadius * 0.38,
      baseRadius * 0.32,
      baseRadius * 0.14,
      -Math.PI / 5,
      0,
      Math.PI * 2
    );
    const specGrad = ctx.createLinearGradient(
      centerX - baseRadius * 0.4,
      centerY - baseRadius * 0.5,
      centerX,
      centerY
    );
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = specGrad;
    ctx.fill();
    ctx.restore();
  }
}
