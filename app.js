/* ===================================================
   เว็บง้อแฟน - JavaScript Interactive Script
   แอนิเมชัน Sprite Sheet น้องแมวงอน & น้องแมวดีใจ
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const catFrameImg = document.getElementById('catFrameImg');
  const catAnimBox = document.getElementById('catAnimBox');
  const floatingHeartsStream = document.getElementById('floatingHeartsStream');
  const btnAccept = document.getElementById('btnAccept');
  const btnReject = document.getElementById('btnReject');
  const speechBubble = document.getElementById('speechBubble');
  const speechText = document.getElementById('speechText');
  const successModal = document.getElementById('successModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnHug = document.getElementById('btnHug');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  
  // Customization elements
  const editModalBtn = document.getElementById('editModalBtn');
  const editModal = document.getElementById('editModal');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const btnSaveCustom = document.getElementById('btnSaveCustom');
  const btnResetCustom = document.getElementById('btnResetCustom');

  // Display fields
  const displaySubtitle = document.getElementById('displaySubtitle');
  const displayTitle1 = document.querySelector('#displayTitle1 .title-text');
  const displayTitle2 = document.querySelector('#displayTitle2 .reconcile-text');
  const displayFooterText = document.querySelector('#displayFooterText .plead-content');

  // Form inputs
  const inputSubtitle = document.getElementById('inputSubtitle');
  const inputTitle1 = document.getElementById('inputTitle1');
  const inputTitle2 = document.getElementById('inputTitle2');
  const inputFooter = document.getElementById('inputFooter');

  let soundEnabled = true;
  let rejectAttemptCount = 0;
  let acceptScale = 1;
  let heartStreamInterval = null;

  // ===================================================
  // 🐱 Cat Sprite Animation Frames & Manager
  // ===================================================
  const sulkFrames = [
    'cat_sulk_01.png', // Arms crossed with 💢
    'cat_sulk_02.png', // Huffing breath 💨
    'cat_sulk_05.png', // Pouting sideways with flower
    'cat_sulk_03.png', // Turning back / looking away
    'cat_sulk_04.png', // Clutching head in dramatic stress
    'cat_sulk_06.png'  // Curled up crying sulk
  ];

  const happyFrames = [
    'cat_happy_01.png', // Smiling warmly
    'cat_happy_03.png', // Sparkly eyes ✨
    'cat_happy_04.png', // Presenting big glowing heart 💖
    'cat_happy_05.png', // Happy crying with flower 🌸
    'cat_happy_06.png', // Jumping for joy with stars 🎉
    'cat_happy_02.png'  // Giggling / laughing
  ];

  // Preload all 12 frames into memory
  [...sulkFrames, ...happyFrames].forEach(src => {
    const img = new Image();
    img.src = src;
  });

  let currentAnimState = 'sulk'; // 'sulk' or 'happy'
  let currentFrameIdx = 0;
  let animTimer = null;

  function updateCatFrame() {
    const frames = (currentAnimState === 'happy') ? happyFrames : sulkFrames;
    currentFrameIdx = (currentFrameIdx + 1) % frames.length;
    if (catFrameImg) {
      catFrameImg.src = frames[currentFrameIdx];
    }
  }

  function startCatAnimation(state) {
    if (animTimer) clearInterval(animTimer);
    currentAnimState = state;
    currentFrameIdx = 0;

    if (catAnimBox) {
      catAnimBox.classList.remove('sulk-idle', 'happy-active', 'cat-huff');
      if (state === 'happy') {
        catAnimBox.classList.add('happy-active');
      } else {
        catAnimBox.classList.add('sulk-idle');
      }
    }

    if (catFrameImg) {
      const frames = (state === 'happy') ? happyFrames : sulkFrames;
      catFrameImg.src = frames[0];
    }

    // Happy state has faster joyful cadence, sulk has slower moody cadence
    const intervalMs = (state === 'happy') ? 380 : 650;
    animTimer = setInterval(updateCatFrame, intervalMs);
  }

  // Start with Sulking cat
  startCatAnimation('sulk');

  // ===================================================
  // 🔊 Web Audio Synthesizer (Cute sound effects)
  // ===================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'dodge') {
      // Playful cartoon boing/whoosh when button runs away
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'success') {
      // Sparkling victory chime (Animal Crossing style)
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.24, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.48);
      });
    } else if (type === 'hug') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  }

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggleBtn.title = soundEnabled ? 'เปิดเสียงอยู่ (กดเพื่อปิด)' : 'ปิดเสียงอยู่ (กดเพื่อเปิด)';
  });

  // ===================================================
  // 🏃💨 Runaway Button Logic ("ยังโกรธอยู่" กดแล้วปุ่มหนี)
  // ===================================================
  const pleadMessages = [
    "งอนเค้าเหรอ... ดีกันนะค้าบ 🥺",
    "ปุ่มนี้ไม่อนุญาตให้กดแย้ววว 😜",
    "งอนไม่ได้แล้วน้าาา กดดีกันเยย! 💖",
    "เค้าสำนึกผิดแล้วจริงๆ ค้าบบบ 😭",
    "พาไปกินชาบู ชานมไข่มุก ของโปรดเลยยย 🧋🍲",
    "ยอมให้หยิกแก้ม ยอมให้บ่น 1 สัปดาห์เต็มๆ เลยนะๆๆ 🙏",
    "หนีเร็วมั้ยล่ะะ กดดีกันเถอะคนดี! 💕"
  ];

  let lastDodgeTime = 0;

  function runAwayButton(e) {
    if (currentAnimState === 'happy') return; // If already reconciled, don't run

    const now = Date.now();
    if (now - lastDodgeTime < 140) return; // Debounce rapid triggers
    lastDodgeTime = now;

    rejectAttemptCount++;
    playSound('dodge');

    // Cat reacts with immediate huff / angry shake
    if (catAnimBox) {
      catAnimBox.classList.remove('cat-huff');
      void catAnimBox.offsetWidth;
      catAnimBox.classList.add('cat-huff');
      // Show Frame 1 (💢) or Frame 2 (💨) immediately
      if (catFrameImg) {
        catFrameImg.src = (rejectAttemptCount % 2 === 0) ? sulkFrames[0] : sulkFrames[1];
      }
      setTimeout(() => {
        catAnimBox.classList.remove('cat-huff');
      }, 700);
    }

    // Show funny sweet pleading message
    const msgIdx = Math.min(rejectAttemptCount - 1, pleadMessages.length - 1);
    speechText.textContent = pleadMessages[msgIdx];
    speechBubble.classList.add('show');

    // Make "ดีกันเยย!" button grow bigger with each dodge attempt
    acceptScale = Math.min(acceptScale + 0.12, 1.8);
    btnAccept.style.transform = `scale(${acceptScale})`;
    btnAccept.style.zIndex = '15';

    // Spawn crying / teasing emojis
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null) || (btnReject.getBoundingClientRect().left + 40);
    const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : null) || (btnReject.getBoundingClientRect().top);
    spawnClickReaction(clientX, clientY, ['😜', '🏃💨', '🥺', '💔', '💨']);

    // Calculate safe runaway displacement (stays comfortably within card view)
    const angle = Math.random() * Math.PI * 2;
    const moveX = Math.cos(angle) * (80 + Math.random() * 60);
    const moveY = Math.sin(angle) * (40 + Math.random() * 40);

    // Clamp within reasonable boundaries
    const clampedX = Math.max(-130, Math.min(130, moveX));
    const clampedY = Math.max(-75, Math.min(75, moveY));

    btnReject.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

    // After 7 attempts, button gives up humorously
    if (rejectAttemptCount >= 7) {
      btnReject.style.opacity = '0.35';
      btnReject.style.pointerEvents = 'none';
      speechText.textContent = 'ปุ่มงอนหนีจนเหนื่อยแล้วว... กดดีกันน้าา! 🥺💖';
      btnAccept.style.width = '100%';
    }
  }

  // Trigger runaway on hover (desktop), touch (mobile), and click
  btnReject.addEventListener('mouseenter', runAwayButton);
  btnReject.addEventListener('mouseover', runAwayButton);
  btnReject.addEventListener('touchstart', (e) => {
    e.preventDefault();
    runAwayButton(e);
  }, { passive: false });
  btnReject.addEventListener('click', (e) => {
    e.preventDefault();
    runAwayButton(e);
  });

  // ===================================================
  // 💖 Reconcile Action: Click "ดีกันเยย! 💗"
  // ===================================================
  btnAccept.addEventListener('click', () => {
    playSound('success');
    speechBubble.classList.remove('show');

    // 1. Switch from Sulking Cat to Happy Cat!
    startCatAnimation('happy');

    // 2. Continuous Floating Hearts Stream around cat
    startFloatingHeartsStream();

    // 3. Reset Reject button
    btnReject.style.transform = 'none';
    btnReject.style.opacity = '0';
    btnReject.style.pointerEvents = 'none';

    // 4. Confetti Fireworks!
    triggerConfetti();

    // 5. Open Success Modal after sweet moment
    setTimeout(() => {
      successModal.classList.add('active');
    }, 550);
  });

  // Floating Hearts Effect Generator ("เอฟเฟกต์หัวใจลอย")
  function startFloatingHeartsStream() {
    if (heartStreamInterval) return;

    // Immediate initial burst of hearts
    for (let i = 0; i < 8; i++) {
      setTimeout(spawnStreamHeart, i * 120);
    }

    // Ongoing gentle stream of hearts
    heartStreamInterval = setInterval(() => {
      spawnStreamHeart();
    }, 380);
  }

  function spawnStreamHeart() {
    if (!floatingHeartsStream) return;

    const heart = document.createElement('div');
    heart.className = 'stream-heart';
    heart.textContent = ['💖', '💕', '💗', '🌸', '✨', '🥰'][Math.floor(Math.random() * 6)];
    
    // Position randomly along bottom of the cat stage
    const posX = Math.random() * 85 + 5; // 5% to 90%
    const posY = Math.random() * 20 + 75; // near bottom
    const duration = (Math.random() * 0.8 + 1.8).toFixed(2);
    const size = Math.floor(Math.random() * 10 + 18);

    heart.style.left = `${posX}%`;
    heart.style.top = `${posY}%`;
    heart.style.fontSize = `${size}px`;
    heart.style.animationDuration = `${duration}s`;

    floatingHeartsStream.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, parseFloat(duration) * 1000 + 100);
  }

  // Close celebration modal
  btnCloseModal.addEventListener('click', () => {
    successModal.classList.remove('active');
  });

  // Hug button inside modal
  btnHug.addEventListener('click', (e) => {
    playSound('hug');
    triggerHeartExplosion();
    spawnClickReaction(e.clientX, e.clientY, ['🫂', '💖', '🥰', '💕', '✨']);
  });

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
    }
  });

  // Confetti Animation function
  function triggerConfetti() {
    if (typeof confetti !== 'function') return;

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.65 },
      colors: ['#ff4d88', '#ff75a6', '#ffd1dc', '#a388ee', '#ffb6c1', '#ffffff']
    });

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff3377', '#ff85a2', '#ffe4e1']
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ff3377', '#ff85a2', '#ffe4e1']
      });
    }, 280);
  }

  function triggerHeartExplosion() {
    if (typeof confetti !== 'function') return;
    confetti({
      particleCount: 75,
      spread: 110,
      origin: { y: 0.5 },
      shapes: ['circle'],
      colors: ['#ff2a6d', '#ff6289', '#ff94b4', '#ffffff']
    });
  }

  // Floating reaction emojis on click
  function spawnClickReaction(x, y, customEmojis = ['🥺', '💧', '😭', '💔']) {
    for (let i = 0; i < 4; i++) {
      const emojiEl = document.createElement('div');
      emojiEl.className = 'floating-click-emoji';
      emojiEl.textContent = customEmojis[Math.floor(Math.random() * customEmojis.length)];
      
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 30;
      
      emojiEl.style.cssText = `
        position: fixed;
        left: ${x + offsetX}px;
        top: ${y + offsetY}px;
        font-size: 22px;
        pointer-events: none;
        z-index: 9999;
        animation: floatReaction 1s ease-out forwards;
      `;
      document.body.appendChild(emojiEl);
      setTimeout(() => emojiEl.remove(), 1000);
    }
  }

  // Background stars and hearts generator
  function initBackgroundEffects() {
    const starsContainer = document.getElementById('bgStars');
    const heartsContainer = document.getElementById('bgHearts');

    for (let i = 0; i < 24; i++) {
      const star = document.createElement('div');
      star.className = 'floating-star';
      star.textContent = ['✦', '★', '✧', '⋆'][Math.floor(Math.random() * 4)];
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.fontSize = `${Math.random() * 10 + 10}px`;
      star.style.animationDelay = `${Math.random() * 5}s, ${Math.random() * 10}s`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s, ${Math.random() * 8 + 10}s`;
      starsContainer.appendChild(star);
    }

    for (let i = 0; i < 12; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart-bg';
      heart.textContent = ['💖', '💕', '🌸', '✨'][Math.floor(Math.random() * 4)];
      heart.style.left = `${Math.random() * 95}%`;
      heart.style.animationDelay = `${Math.random() * 10}s`;
      heart.style.animationDuration = `${Math.random() * 6 + 8}s`;
      heart.style.fontSize = `${Math.random() * 12 + 12}px`;
      heartsContainer.appendChild(heart);
    }
  }

  initBackgroundEffects();

  // ===================================================
  // Customization Modal Logic (with localStorage)
  // ===================================================
  const STORAGE_KEY = 'apology_page_custom_data_v1';

  function loadSavedCustomData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.subtitle) {
          displaySubtitle.textContent = data.subtitle;
          inputSubtitle.value = data.subtitle;
        }
        if (data.title1) {
          displayTitle1.textContent = data.title1;
          inputTitle1.value = data.title1;
        }
        if (data.title2) {
          displayTitle2.textContent = data.title2;
          inputTitle2.value = data.title2;
        }
        if (data.footer) {
          displayFooterText.textContent = data.footer;
          inputFooter.value = data.footer;
        }
      }
    } catch (e) {
      console.warn('Error reading localStorage', e);
    }
  }

  loadSavedCustomData();

  editModalBtn.addEventListener('click', () => {
    editModal.classList.add('active');
  });

  closeEditModalBtn.addEventListener('click', () => {
    editModal.classList.remove('active');
  });

  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.classList.remove('active');
    }
  });

  btnSaveCustom.addEventListener('click', () => {
    const data = {
      subtitle: inputSubtitle.value.trim() || '— ขอคืนดีของเค้า —',
      title1: inputTitle1.value.trim() || 'เค้าขอโทษน้าาา...',
      title2: inputTitle2.value.trim() || 'ดีกันนะคะ',
      footer: inputFooter.value.trim() || 'ยกโทษให้เค้าเถอะนะคับ... นะๆๆๆ 🙏🥺'
    };

    displaySubtitle.textContent = data.subtitle;
    displayTitle1.textContent = data.title1;
    displayTitle2.textContent = data.title2;
    displayFooterText.textContent = data.footer;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}

    editModal.classList.remove('active');
    playSound('success');
  });

  btnResetCustom.addEventListener('click', () => {
    const defaults = {
      subtitle: '— ขอคืนดีของเค้า —',
      title1: 'เค้าขอโทษน้าาา...',
      title2: 'ดีกันนะคะ',
      footer: 'ยกโทษให้เค้าเถอะนะคับ... นะๆๆๆ 🙏🥺'
    };

    inputSubtitle.value = defaults.subtitle;
    inputTitle1.value = defaults.title1;
    inputTitle2.value = defaults.title2;
    inputFooter.value = defaults.footer;

    displaySubtitle.textContent = defaults.subtitle;
    displayTitle1.textContent = defaults.title1;
    displayTitle2.textContent = defaults.title2;
    displayFooterText.textContent = defaults.footer;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    editModal.classList.remove('active');
  });

});

// Global keyframe for floatReaction
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes floatReaction {
  0% { transform: translateY(0) scale(0.6); opacity: 1; }
  100% { transform: translateY(-50px) scale(1.3); opacity: 0; }
}
`;
document.head.appendChild(styleSheet);
