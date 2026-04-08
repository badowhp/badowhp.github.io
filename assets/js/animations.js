/* ============================================
   GSAP ANIMATIONS — ScrollTrigger, Glitch Text,
   Terminal Typing, Circuit Draw, Morph Frame,
   Matrix Rain
   ============================================ */
(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    // Show everything immediately
    document.querySelectorAll('.hero-title, .hero-tagline, .skill-card, .about-text, .about-photo-wrapper, .blog-card, .contact-content').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    const typed = document.getElementById('typed-text');
    if (typed) typed.textContent = '> devops_engineer --location vienna';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- GLITCH TEXT SCRAMBLE ---- */
  function scrambleReveal(element, finalText, opts = {}) {
    const chars = '!@#$%^&*01<>/\\|{}[]~`';
    const duration = opts.duration || 2000;
    const stagger = opts.stagger || 40;

    element.style.opacity = '1';
    const letters = finalText.split('');
    element.innerHTML = letters.map(ch =>
      ch === ' ' ? ' ' : `<span class="char" style="color:var(--accent-green)">${chars[Math.floor(Math.random() * chars.length)]}</span>`
    ).join('');

    const spans = element.querySelectorAll('.char');
    const nonSpaceLetters = letters.filter(ch => ch !== ' ');

    spans.forEach((span, i) => {
      const target = nonSpaceLetters[i];
      const startTime = i * stagger;
      const scrambleDuration = 400 + Math.random() * 300;

      // Scramble phase
      let scrambleInterval;
      setTimeout(() => {
        scrambleInterval = setInterval(() => {
          span.textContent = chars[Math.floor(Math.random() * chars.length)];
        }, 50);
      }, startTime);

      // Settle phase
      setTimeout(() => {
        clearInterval(scrambleInterval);
        span.textContent = target;
        span.style.color = 'var(--text-bright)';
        // Brief glow
        span.style.textShadow = '0 0 10px rgba(0,255,136,.8)';
        setTimeout(() => {
          span.style.textShadow = 'none';
        }, 200);
      }, startTime + scrambleDuration);
    });
  }

  /* ---- TERMINAL TYPING ---- */
  function typeText(element, lines, opts = {}) {
    const speed = opts.speed || { min: 40, max: 100 };
    const pauseBetween = opts.pause || 800;
    let lineIdx = 0;
    let charIdx = 0;
    let currentText = '';

    function typeChar() {
      if (lineIdx >= lines.length) return;
      const line = lines[lineIdx];

      if (charIdx < line.length) {
        currentText += line[charIdx];
        element.textContent = currentText;
        charIdx++;
        const delay = Math.random() * (speed.max - speed.min) + speed.min;
        setTimeout(typeChar, delay);
      } else {
        lineIdx++;
        if (lineIdx < lines.length) {
          currentText += '\n';
          charIdx = 0;
          setTimeout(typeChar, pauseBetween);
        }
      }
    }

    typeChar();
  }

  /* ---- HERO ENTRANCE TIMELINE ---- */
  const heroTitle = document.getElementById('hero-title');
  const typedText = document.getElementById('typed-text');
  const heroTagline = document.querySelector('.hero-tagline');
  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (heroTitle) {
    // Initial delay for particle system to establish
    setTimeout(() => {
      scrambleReveal(heroTitle, 'HIPOLIT BADOWSKI', { stagger: 50 });
    }, 500);
  }

  if (typedText) {
    setTimeout(() => {
      typeText(typedText, ['> devops_engineer --location vienna --status available']);
    }, 2500);
  }

  if (heroTagline) {
    gsap.fromTo(heroTagline,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 4.5, ease: 'power2.out' }
    );
  }

  if (scrollIndicator) {
    gsap.fromTo(scrollIndicator,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 5.5, ease: 'power2.out' }
    );
  }

  /* ---- CIRCUIT BOARD DRAW-IN ---- */
  const circuitPaths = document.querySelectorAll('.circuit-path');
  const circuitNodes = document.querySelectorAll('.circuit-node');

  circuitPaths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  if (circuitPaths.length > 0) {
    ScrollTrigger.create({
      trigger: '#skills',
      start: 'top 80%',
      onEnter: () => {
        gsap.to(circuitPaths, {
          strokeDashoffset: 0,
          duration: 2,
          stagger: 0.2,
          ease: 'power2.inOut',
        });
        gsap.to(circuitNodes, {
          opacity: 1,
          duration: 0.3,
          stagger: 0.15,
          delay: 1,
        });
      },
      once: true,
    });
  }

  /* ---- SKILL CARDS ENTRANCE ---- */
  const skillCards = document.querySelectorAll('.skill-card');
  skillCards.forEach(card => {
    gsap.fromTo(card,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true,
        }
      }
    );
  });

  /* ---- SKILL ICON SVG DRAW ---- */
  const drawPaths = document.querySelectorAll('.draw-path');
  drawPaths.forEach(path => {
    const length = path.getTotalLength ? path.getTotalLength() : 0;
    if (length > 0) {
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;

      ScrollTrigger.create({
        trigger: path.closest('.skill-card'),
        start: 'top 85%',
        onEnter: () => {
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: 'power2.inOut',
          });
        },
        once: true,
      });
    }
  });

  /* ---- ABOUT SECTION ---- */
  const aboutPhoto = document.querySelector('.about-photo-wrapper');
  const aboutText = document.querySelector('.about-text');

  if (aboutPhoto) {
    gsap.fromTo(aboutPhoto,
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: '#about', start: 'top 70%', once: true }
      }
    );
  }

  if (aboutText) {
    gsap.fromTo(aboutText,
      { opacity: 0, x: 40 },
      {
        opacity: 1, x: 0, duration: 1, delay: 0.2, ease: 'power2.out',
        scrollTrigger: { trigger: '#about', start: 'top 70%', once: true }
      }
    );
  }

  /* ---- MORPHING PROFILE FRAME ---- */
  const morphPath = document.getElementById('morph-path');
  if (morphPath) {
    const shapes = [
      // Circle
      'M140,10 C210,10 270,70 270,140 C270,210 210,270 140,270 C70,270 10,210 10,140 C10,70 70,10 140,10 Z',
      // Hexagon
      'M140,10 L250,75 L250,205 L140,270 L30,205 L30,75 Z',
      // Rounded square
      'M60,20 L220,20 Q260,20 260,60 L260,220 Q260,260 220,260 L60,260 Q20,260 20,220 L20,60 Q20,20 60,20 Z',
      // Diamond-ish
      'M140,10 Q250,70 260,140 Q250,210 140,270 Q30,210 20,140 Q30,70 140,10 Z',
    ];

    let currentShape = 0;

    function morphNext() {
      currentShape = (currentShape + 1) % shapes.length;
      gsap.to(morphPath, {
        attr: { d: shapes[currentShape] },
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          setTimeout(morphNext, 3000);
        }
      });
    }

    setTimeout(morphNext, 4000);
  }

  /* ---- BLOG CARDS ---- */
  document.querySelectorAll('.blog-card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 0.8, delay: i * 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: '#blog-preview', start: 'top 75%', once: true }
      }
    );
  });

  /* ---- CONTACT SECTION ---- */
  const contactTitle = document.getElementById('contact-title');
  if (contactTitle) {
    gsap.fromTo(contactTitle,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true }
      }
    );
  }

  /* ---- MATRIX RAIN (Footer) ---- */
  const matrixCanvas = document.getElementById('matrix-canvas');
  if (matrixCanvas) {
    const mctx = matrixCanvas.getContext('2d');
    let mw, mh, columns, drops;

    const words = ['kubectl', 'terraform', 'docker', 'yaml', 'git', 'deploy', 'pipeline', 'helm', 'nginx', 'linux', 'bash', 'aws', 'k8s', 'ci/cd', 'pod', 'node', 'svc', 'ing'];

    function resizeMatrix() {
      mw = matrixCanvas.width = matrixCanvas.parentElement.offsetWidth;
      mh = matrixCanvas.height = matrixCanvas.parentElement.offsetHeight;
      const fontSize = 14;
      columns = Math.floor(mw / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -100);
    }

    function drawMatrix() {
      mctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      mctx.fillRect(0, 0, mw, mh);
      mctx.fillStyle = '#00ff88';
      mctx.font = '12px "JetBrains Mono", monospace';

      for (let i = 0; i < drops.length; i++) {
        const word = words[Math.floor(Math.random() * words.length)];
        const char = word[Math.floor(Math.random() * word.length)];
        const x = i * 14;
        const y = drops[i] * 14;

        mctx.fillText(char, x, y);

        if (y > mh && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      requestAnimationFrame(drawMatrix);
    }

    resizeMatrix();
    drawMatrix();
    window.addEventListener('resize', resizeMatrix);
  }
})();
