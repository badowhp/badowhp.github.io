/* ============================================
   PARTICLE CONSTELLATION BACKGROUND
   Canvas-based particle system with mouse parallax
   ============================================ */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const hero = canvas.closest('#hero');
  if (!hero) return;

  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  let width, height, particles, mouse, animId;
  const PARTICLE_COUNT_DESKTOP = 80;
  const PARTICLE_COUNT_MOBILE = 35;
  const CONNECTION_DIST = 150;
  const MOUSE_RADIUS = 200;

  const SHAPES = ['circle', 'triangle', 'hexagon', 'diamond'];

  mouse = { x: -9999, y: -9999 };

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width;
    canvas.height = height;
  }

  function createParticle() {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 3 + 1.5,
      opacity: Math.random() * 0.4 + 0.1,
      shape: shape,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    };
  }

  function init() {
    resize();
    const count = width < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    particles = Array.from({ length: count }, createParticle);
  }

  function drawShape(p) {
    const s = p.size;
    ctx.beginPath();
    switch (p.shape) {
      case 'circle':
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        break;
      case 'triangle':
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x - s * 0.866, p.y + s * 0.5);
        ctx.lineTo(p.x + s * 0.866, p.y + s * 0.5);
        ctx.closePath();
        break;
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          const method = i === 0 ? 'moveTo' : 'lineTo';
          ctx[method](p.x + s * Math.cos(angle), p.y + s * Math.sin(angle));
        }
        ctx.closePath();
        break;
      case 'diamond':
        ctx.moveTo(p.x, p.y - s);
        ctx.lineTo(p.x + s * 0.7, p.y);
        ctx.lineTo(p.x, p.y + s);
        ctx.lineTo(p.x - s * 0.7, p.y);
        ctx.closePath();
        break;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Pulse opacity
      p.pulse += p.pulseSpeed;
      const dynamicOpacity = p.opacity + Math.sin(p.pulse) * 0.1;

      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS && dist > 0) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.8;
        p.vx += (dx / dist) * force * 0.3;
        p.vy += (dy / dist) * force * 0.3;
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      // Draw particle
      const green = Math.random() > 0.7 ? '0, 212, 255' : '0, 255, 136';
      ctx.fillStyle = `rgba(${green}, ${Math.max(0, dynamicOpacity)})`;
      drawShape(p);
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        if (cdist < CONNECTION_DIST) {
          const alpha = (1 - cdist / CONNECTION_DIST) * 0.15;
          ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(animate);
  }

  // Event listeners
  window.addEventListener('resize', () => {
    resize();
    // Re-adjust particle count on resize
    const target = width < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    while (particles.length < target) particles.push(createParticle());
    while (particles.length > target) particles.pop();
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Start
  init();
  animate();

  // Cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animate();
    }
  });
})();
