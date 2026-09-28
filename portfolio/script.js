/**
 * ============================================================================
 * ALEX RIVERA | PORTFOLIO JAVASCRIPT ENGINE
 * Features: Interactive Particle Canvas, Sound Synthesizer, Dynamic Modal,
 *           Theme Engine, Terminal Simulator, Testimonial Slider, Form Validator.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. TOAST NOTIFICATION SYSTEM
     -------------------------------------------------------------------------- */
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'info', icon = 'fa-circle-check') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--accent-cyan);"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    playSynthSound('toast');

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /* --------------------------------------------------------------------------
     2. SYNTHESIZED WEB AUDIO EFFECTS (Optional & Zero Dependency)
     -------------------------------------------------------------------------- */
  let audioContext = null;
  let soundEnabled = localStorage.getItem('sound_enabled') === 'true';
  const audioToggleBtn = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');

  function updateAudioUI() {
    if (!audioToggleBtn || !audioIcon) return;
    if (soundEnabled) {
      audioToggleBtn.classList.add('active');
      audioIcon.className = 'fa-solid fa-volume-high';
      audioToggleBtn.setAttribute('title', 'Sound Effects: ON (Click to Mute)');
    } else {
      audioToggleBtn.classList.remove('active');
      audioIcon.className = 'fa-solid fa-volume-xmark';
      audioToggleBtn.setAttribute('title', 'Sound Effects: OFF (Click to Enable)');
    }
  }

  function getAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function playSynthSound(type = 'click') {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'tab') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'toast') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      // Audio error suppressed gracefully
    }
  }

  if (audioToggleBtn) {
    updateAudioUI();
    audioToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('sound_enabled', soundEnabled);
      updateAudioUI();
      if (soundEnabled) {
        getAudioContext();
        playSynthSound('toast');
        showToast('UI Sound Effects Activated 🔊', 'info', 'fa-volume-high');
      } else {
        showToast('Sound Effects Muted 🔇', 'info', 'fa-volume-xmark');
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. THEME ENGINE (Dark / Light Mode)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const htmlEl = document.documentElement;

  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
      themeIcon.className = 'fa-solid fa-sun';
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      playSynthSound('click');
      const currentTheme = htmlEl.getAttribute('data-theme');
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      updateThemeIcon(nextTheme);
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}`);
    });
  }

  /* --------------------------------------------------------------------------
     4. DYNAMIC HTML5 CANVAS PARTICLE BACKDROP
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById('canvas-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, radius: 120 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    });

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.size = Math.random() * 2 + 1;
        this.baseColor = Math.random() > 0.5 ? '0, 242, 254' : '157, 78, 221';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction attraction / repulse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const dirX = (dx / dist) * force * 1.5;
            const dirY = (dy / dist) * force * 1.5;
            this.x -= dirX;
            this.y -= dirY;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.baseColor}, 0.7)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.baseColor}, 0.5)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initParticles() {
      particles = [];
      const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const opacity = (1 - dist / 110) * 0.25;
            ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
  }

  /* --------------------------------------------------------------------------
     5. TYPEWRITER EFFECT IN HERO
     -------------------------------------------------------------------------- */
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const roles = [
      'Full Stack Engineer',
      'AI Interface Architect',
      'Creative Technologist',
      'UI/UX Design Engineer',
      'Cloud Solutions Builder'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeLoop() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        typewriterEl.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        typewriterEl.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 110;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 2000; // Pause at full word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400;
      }

      setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  /* --------------------------------------------------------------------------
     6. NAVBAR SCROLL & ACTIVE LINK HIGHLIGHTING
     -------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navLinksContainer = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    // Scroll Progress bar
    if (scrollProgress) {
      scrollProgress.style.width = `${scrollPct}%`;
    }

    // Navbar glass effect
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Back to top visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Highlight active section nav link
    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Hamburger Toggle
  if (hamburgerBtn && navLinksContainer) {
    hamburgerBtn.addEventListener('click', () => {
      playSynthSound('click');
      const isOpen = hamburgerBtn.classList.toggle('open');
      navLinksContainer.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', isOpen);
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        navLinksContainer.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      playSynthSound('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     7. METRICS NUMBER COUNTER ANIMATION
     -------------------------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  function runCounters() {
    statNumbers.forEach((counter) => {
      const target = +counter.getAttribute('data-target');
      const isPercent = counter.innerText.includes('%') || target === 99;
      const suffix = isPercent ? '%' : '+';
      let count = 0;
      const step = Math.max(1, Math.ceil(target / 40));

      const timer = setInterval(() => {
        count += step;
        if (count >= target) {
          counter.innerText = `${target}${suffix}`;
          clearInterval(timer);
        } else {
          counter.innerText = `${count}${suffix}`;
        }
      }, 35);
    });
  }

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsCounted) {
        statsCounted = true;
        runCounters();
      }
    }, { threshold: 0.3 });
    observer.observe(heroSection);
  }

  /* --------------------------------------------------------------------------
     8. 3D AVATAR & CARD TILT EFFECT
     -------------------------------------------------------------------------- */
  const heroAvatar = document.getElementById('hero-avatar');
  if (heroAvatar) {
    heroAvatar.addEventListener('mousemove', (e) => {
      const rect = heroAvatar.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      heroAvatar.style.transform = `perspective(600px) rotateY(${x * 0.08}deg) rotateX(${-y * 0.08}deg) scale(1.03)`;
    });

    heroAvatar.addEventListener('mouseleave', () => {
      heroAvatar.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
  }

  /* --------------------------------------------------------------------------
     9. INTERACTIVE DEVELOPER TERMINAL
     -------------------------------------------------------------------------- */
  const terminalInput = document.getElementById('terminal-input');
  const terminalBody = document.getElementById('terminal-body');

  const commandResponses = {
    help: 'Available commands: <span style="color:var(--accent-cyan)">skills</span>, <span style="color:var(--accent-cyan)">projects</span>, <span style="color:var(--accent-cyan)">contact</span>, <span style="color:var(--accent-cyan)">about</span>, <span style="color:var(--accent-cyan)">whoami</span>, <span style="color:var(--accent-cyan)">clear</span>',
    skills: 'Core Stack: JavaScript (ES6+), React, Next.js, Node.js, WebGL, TypeScript, Python, Tailwind, PostgreSQL, Docker, AI LLM APIs.',
    projects: 'Featured Projects: Aura Insights (AI Suite), AethelWealth (FinTech), Nexus Creative (WebGL 3D Studio), CryptoVault (Mobile), Aura Synth (Web Audio).',
    contact: 'Email: alex.rivera.dev@gmail.com | Discord: alex_rivera#8842 | Location: San Francisco, CA',
    about: 'Alex Rivera — Full Stack Engineer with 5+ years experience building sleek, ultra-responsive digital systems.',
    whoami: 'alex@workstation (Senior Full Stack Engineer & Technologist)',
    sudo: 'Permission granted: You are now an elite architect.',
    theme: 'Pro-tip: Click the Moon/Sun icon in the navigation bar to toggle light/dark theme!'
  };

  if (terminalInput && terminalBody) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const rawCmd = terminalInput.value.trim();
        const cmd = rawCmd.toLowerCase();
        terminalInput.value = '';
        playSynthSound('click');

        if (!cmd) return;

        if (cmd === 'clear') {
          terminalBody.innerHTML = '';
          return;
        }

        const inputLine = document.createElement('div');
        inputLine.className = 'term-line';
        inputLine.innerHTML = `<span class="term-prompt">alex@macbook:~$</span> <span class="term-cmd">${rawCmd}</span>`;
        terminalBody.appendChild(inputLine);

        const outputLine = document.createElement('div');
        outputLine.className = 'term-output';

        if (commandResponses[cmd]) {
          outputLine.innerHTML = commandResponses[cmd];
        } else {
          outputLine.innerHTML = `command not found: "${rawCmd}". Type <span style="color:var(--accent-cyan)">help</span> to see valid commands.`;
        }

        terminalBody.appendChild(outputLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    });
  }

  /* --------------------------------------------------------------------------
     10. SKILLS TAB FILTERING & PROGRESS BARS ANIMATION
     -------------------------------------------------------------------------- */
  const skillTabs = document.querySelectorAll('.skills-nav .tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');
  const skillBars = document.querySelectorAll('.progress-bar-fill');

  function animateSkillBars() {
    skillBars.forEach((bar) => {
      const targetWidth = bar.getAttribute('data-percent') || '0';
      bar.style.width = `${targetWidth}%`;
    });
  }

  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateSkillBars();
      }
    }, { threshold: 0.2 });
    skillObserver.observe(skillsSection);
  }

  skillTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      playSynthSound('tab');
      skillTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const selectedCategory = tab.getAttribute('data-category');

      skillCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'all' || cardCategory === selectedCategory) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.transition = 'all 0.35s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
     11. PROJECT FILTERING & RICH MODAL LIGHTBOX
     -------------------------------------------------------------------------- */
  const projectFilterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  // Filter Buttons Handler
  projectFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playSynthSound('tab');
      projectFilterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = card.getAttribute('data-category').split(' ');
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Projects Database for Modal
  const projectsData = {
    p1: {
      title: 'Aura Insights — AI Performance & Analytics Dashboard',
      category: 'AI Platform & Data Visualization',
      image: 'assets/images/project1.jpg',
      description: 'A comprehensive, enterprise-scale AI analytics platform designed to monitor production LLM inference telemetry, user retention trends, and multi-model performance curves in real-time.',
      features: [
        'Real-time streaming charts with D3.js and WebSockets',
        'Multi-model latency vs cost optimization engine',
        'Customizable executive KPI widgets with instant CSV/PDF export',
        'Role-based access control and team workspace isolation'
      ],
      tech: ['React 18', 'TypeScript', 'D3.js', 'FastAPI', 'Tailwind CSS', 'Redis'],
      demoLink: '#',
      githubLink: '#'
    },
    p2: {
      title: 'AethelWealth — Next-Gen Asset & Crypto Management Platform',
      category: 'FinTech & Web3 Trading',
      image: 'assets/images/project2.jpg',
      description: 'An institutional-grade portfolio dashboard enabling users to track multi-chain assets ($2.85M TVL), monitor live market sentiment, and execute algorithmic rebalancing strategies.',
      features: [
        'Instant multi-currency exchange rate WebSocket feeds',
        'Automated staking reward compounding calculator',
        'Glassmorphic dark UI optimized for multi-monitor setups',
        'Cryptographically signed audit logs and 2FA protection'
      ],
      tech: ['Next.js 14', 'TypeScript', 'Web3.js', 'PostgreSQL', 'Prisma', 'Chart.js'],
      demoLink: '#',
      githubLink: '#'
    },
    p3: {
      title: 'Nexus Creative — 3D Cyber Core WebGL Studio',
      category: 'Creative Tech & 3D WebGL',
      image: 'assets/images/project3.jpg',
      description: 'An in-browser 3D asset sculpt and holographic animation studio. Features GLSL shader generation, keyframe timeline controllers, and real-time mesh deformation.',
      features: [
        '60 FPS hardware-accelerated 3D rendering pipeline',
        'Dynamic node-based shader graph composer',
        'GLTF and OBJ file import/export capabilities',
        'Interactive lighting & camera angle keyframing'
      ],
      tech: ['Three.js', 'WebGL 2.0', 'GLSL Shaders', 'WebAssembly', 'Vanilla JS'],
      demoLink: '#',
      githubLink: '#'
    },
    p4: {
      title: 'CryptoVault — Mobile Biometric Asset Manager',
      category: 'Mobile Applications',
      image: 'assets/images/project4.jpg',
      description: 'A native mobile cryptocurrency wallet focused on biometric security, seamless peer-to-peer token transfers, and real-time yield analytics.',
      features: [
        'Instant FaceID & Fingerprint cryptographic unlocking',
        'Interactive real-time asset performance sparklines',
        'One-tap cross-chain decentralized token swap',
        'Offline cold-storage backup phrase verification'
      ],
      tech: ['React Native', 'Expo', 'Solana Web3', 'Biometrics API', 'Node.js'],
      demoLink: '#',
      githubLink: '#'
    },
    p5: {
      title: 'Aura Synthesizer — Neural Waveform Engine',
      category: 'Web Audio & Creative DSP',
      image: 'assets/images/project5.jpg',
      description: 'An interactive audio workstation built on the Web Audio API, featuring harmonic neural morphing oscillators, real-time FFT spectrum visualizers, and step-sequencing.',
      features: [
        'Zero-latency dual polyphonic oscillator engine',
        'Real-time Canvas 2D spectrum analyzer and oscilloscope',
        'Generative MIDI sequence pattern generator',
        'Custom reverberation & low-pass filtering DSP nodes'
      ],
      tech: ['Web Audio API', 'Canvas 2D', 'JavaScript ES6+', 'DSP Math'],
      demoLink: '#',
      githubLink: '#'
    }
  };

  const projectModal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDesc = document.getElementById('modal-desc');
  const modalFeatures = document.getElementById('modal-features');
  const modalTech = document.getElementById('modal-tech');
  const modalLiveDemo = document.getElementById('modal-live-demo');
  const modalGithub = document.getElementById('modal-github');

  function openProjectModal(projectId) {
    const data = projectsData[projectId];
    if (!data || !projectModal) return;

    playSynthSound('click');
    modalImg.src = data.image;
    modalImg.alt = data.title;
    modalTitle.textContent = data.title;
    modalCategory.textContent = data.category;
    modalDesc.textContent = data.description;

    // Features
    modalFeatures.innerHTML = '';
    data.features.forEach((feat) => {
      const featEl = document.createElement('div');
      featEl.className = 'modal-feature-item';
      featEl.innerHTML = `<i class="fa-solid fa-check modal-feature-icon"></i> <span>${feat}</span>`;
      modalFeatures.appendChild(featEl);
    });

    // Tech Tags
    modalTech.innerHTML = '';
    data.tech.forEach((t) => {
      const tag = document.createElement('span');
      tag.className = 'tech-tag';
      tag.textContent = t;
      modalTech.appendChild(tag);
    });

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!projectModal) return;
    playSynthSound('click');
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      openProjectModal(id);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal && projectModal.classList.contains('open')) {
      closeProjectModal();
    }
  });

  if (modalLiveDemo) {
    modalLiveDemo.addEventListener('click', () => {
      showToast('Launching interactive demo preview in standalone mode...', 'info', 'fa-arrow-up-right-from-square');
    });
  }

  if (modalGithub) {
    modalGithub.addEventListener('click', () => {
      showToast('Redirecting to project repository...', 'info', 'fa-brands fa-github');
    });
  }

  /* --------------------------------------------------------------------------
     12. TESTIMONIALS SLIDER (Touch, Click & Auto-Play)
     -------------------------------------------------------------------------- */
  const testimonialTrack = document.getElementById('testimonial-track');
  const sliderDots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  let currentSlide = 0;
  const totalSlides = sliderDots.length;
  let autoSlideTimer;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    if (testimonialTrack) {
      testimonialTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    sliderDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6500);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      playSynthSound('click');
      goToSlide(currentSlide - 1);
      startAutoSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playSynthSound('click');
      goToSlide(currentSlide + 1);
      startAutoSlide();
    });
  }

  sliderDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      playSynthSound('click');
      const idx = +dot.getAttribute('data-index');
      goToSlide(idx);
      startAutoSlide();
    });
  });

  if (testimonialTrack) {
    testimonialTrack.addEventListener('mouseenter', stopAutoSlide);
    testimonialTrack.addEventListener('mouseleave', startAutoSlide);
  }

  startAutoSlide();

  /* --------------------------------------------------------------------------
     13. CONTACT CLIBOARD & DOWNLOAD RESUME HANDLERS
     -------------------------------------------------------------------------- */
  const copyEmailBox = document.getElementById('copy-email-box');
  const copyDiscordBox = document.getElementById('copy-discord-box');
  const downloadCvBtn = document.getElementById('download-cv-btn');

  if (copyEmailBox) {
    copyEmailBox.addEventListener('click', () => {
      const email = document.getElementById('email-text').textContent;
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied: ${email}`, 'success', 'fa-envelope');
      });
    });
  }

  if (copyDiscordBox) {
    copyDiscordBox.addEventListener('click', () => {
      const discord = document.getElementById('discord-text').textContent;
      navigator.clipboard.writeText(discord).then(() => {
        showToast(`Discord ID copied: ${discord}`, 'success', 'fa-brands fa-discord');
      });
    });
  }

  if (downloadCvBtn) {
    downloadCvBtn.addEventListener('click', () => {
      playSynthSound('click');
      showToast('Generating & downloading Alex_Rivera_Resume.pdf...', 'info', 'fa-file-pdf');

      // Create a mock download trigger with a generated resume markdown/text
      const dummyResumeContent = `ALEX RIVERA — SENIOR FULL STACK ENGINEER
Email: alex.rivera.dev@gmail.com | Location: San Francisco, CA / Remote

SUMMARY:
Senior Full Stack Developer & Creative Technologist with 5+ years of experience building high-scale web apps, AI dashboards, and modern interfaces.

SKILLS:
- Frontend: HTML5, CSS3, JavaScript (ES6+), React, Next.js, WebGL, TypeScript
- Backend: Node.js, Express, Python, FastAPI, PostgreSQL, MongoDB, Redis
- Cloud & DevOps: Docker, AWS, GCP, CI/CD, Nginx

EXPERIENCE:
- Lead Full Stack Engineer @ Nexus Cloud Solutions (2023 - Present)
- Senior Frontend Developer @ Vanguard Tech Labs (2021 - 2023)
- Frontend Web Developer @ Hyperion Interactive (2019 - 2021)
`;
      const blob = new Blob([dummyResumeContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Alex_Rivera_Resume.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  /* --------------------------------------------------------------------------
     14. CONTACT FORM SUBMISSION WITH VALIDATION
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) {
        showToast('Please enter your full name.', 'error', 'fa-circle-exclamation');
        return;
      }
      if (!email || !emailRegex.test(email)) {
        showToast('Please enter a valid email address.', 'error', 'fa-circle-exclamation');
        return;
      }
      if (!subject) {
        showToast('Please provide a subject / project topic.', 'error', 'fa-circle-exclamation');
        return;
      }
      if (!message || message.length < 10) {
        showToast('Please include a detailed message (min 10 characters).', 'error', 'fa-circle-exclamation');
        return;
      }

      // Simulate sending state
      if (submitBtn && btnText) {
        submitBtn.disabled = true;
        btnText.textContent = 'Transmitting Message...';
        playSynthSound('click');

        setTimeout(() => {
          submitBtn.disabled = false;
          btnText.textContent = 'Send Message';
          contactForm.reset();
          showToast(`Thank you ${name}! Your message has been transmitted successfully. I will get back to you shortly.`, 'success', 'fa-paper-plane');
        }, 1200);
      }
    });
  }

  /* --------------------------------------------------------------------------
     15. FOOTER DYNAMIC YEAR
     -------------------------------------------------------------------------- */
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }
});
