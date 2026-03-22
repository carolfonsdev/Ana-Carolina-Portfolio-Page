// Mobile scroll-top FAB
(function () {
    const fab = document.querySelector('.scroll-top');
    function checkScroll() {
        if (window.innerWidth <= 768) {
            fab.classList.toggle('visible-fab', window.scrollY > 300);
        } else {
            fab.classList.remove('visible-fab');
        }
    }
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
})();

// ── CONSTELLATION ──
(function () {
    const canvas = document.getElementById('constellation');
    const ctx = canvas.getContext('2d');
    let W, H, mouse = { x: -999, y: -999 };

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    window.addEventListener('scroll', () => {
        const homeH = document.getElementById('home').offsetHeight;
        canvas.classList.toggle('hidden', window.scrollY > homeH * 0.5);
    }, { passive: true });

    // Draw a 4-pointed star
    function isLight() { return document.documentElement.classList.contains('light'); }

    function drawStar(cx, cy, size, alpha) {
        const light = isLight();
        const starColor = light ? '80,40,200' : '255,255,255';
        const glowColor = light ? '109,68,248' : '167,139,250';

        // Glow halo
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 5);
        grd.addColorStop(0, `rgba(${starColor},${alpha * (light ? 0.7 : 0.5)})`);
        grd.addColorStop(0.4, `rgba(${glowColor},${alpha * (light ? 0.25 : 0.15)})`);
        grd.addColorStop(1, 'rgba(124,92,252,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, size * 5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // 4-pointed shape
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = `rgba(${starColor},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, -size * 3.5);
        ctx.bezierCurveTo(size * 0.3, -size * 0.4, size * 0.3, -size * 0.4, size * 0.5, 0);
        ctx.bezierCurveTo(size * 0.3, size * 0.4, size * 0.3, size * 0.4, 0, size * 3.5);
        ctx.bezierCurveTo(-size * 0.3, size * 0.4, -size * 0.3, size * 0.4, -size * 0.5, 0);
        ctx.bezierCurveTo(-size * 0.3, -size * 0.4, -size * 0.3, -size * 0.4, 0, -size * 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Bright core
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starColor},${Math.min(alpha + 0.3, 1)})`;
        ctx.fill();
    }

    const COUNT = 70;
    const CONNECT_DIST = 130;
    const MOUSE_DIST = 180;

    const pts = Array.from({ length: COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.2 + 0.4,
        pulse: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    function draw() {
        ctx.clearRect(0, 0, W, H);
        t++;

        pts.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        });

        // Lines between close stars
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].x - pts[j].x;
                const dy = pts[i].y - pts[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECT_DIST) {
                    const alpha = (1 - dist / CONNECT_DIST) * (isLight() ? 0.35 : 0.2);
                    ctx.beginPath();
                    ctx.moveTo(pts[i].x, pts[i].y);
                    ctx.lineTo(pts[j].x, pts[j].y);
                    ctx.strokeStyle = isLight() ? `rgba(100,50,220,${alpha})` : `rgba(167,139,250,${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            // Lines to mouse
            const mdx = pts[i].x - mouse.x;
            const mdy = pts[i].y - mouse.y;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < MOUSE_DIST) {
                const alpha = (1 - mdist / MOUSE_DIST) * (isLight() ? 0.6 : 0.45);
                ctx.beginPath();
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = isLight() ? `rgba(90,40,210,${alpha})` : `rgba(200,180,255,${alpha})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }

        // Draw 4-pointed stars
        pts.forEach(p => {
            const alpha = 0.3 + 0.65 * Math.abs(Math.sin(t * 0.018 + p.pulse));
            drawStar(p.x, p.y, p.size, alpha);
        });

        requestAnimationFrame(draw);
    }
    draw();
})();

// Active nav highlight
(function () {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    function setActive(id) {
        navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
    }

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) setActive(e.target.id);
        });
    }, {
        rootMargin: '-50% 0px -50% 0px', // fires when section crosses middle of screen
        threshold: 0
    });

    sections.forEach(s => obs.observe(s));
})();

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
reveals.forEach(el => observer.observe(el));

// Deck of cards
(function () {
    const deck = document.getElementById('deck');
    const counter = document.getElementById('deckCur');
    if (!deck) return;
    const total = 5;
    let current = 0; // index of card currently on top (pos=0)

    function getCards() {
        return Array.from(deck.querySelectorAll('.deck-card'));
    }

    function updatePositions() {
        getCards().forEach(card => {
            const pos = parseInt(card.dataset.pos);
            // pos 0 = top, 3 = bottom
        });
        counter.textContent = (current % total) + 1;
    }

    document.getElementById('deckNext').onclick = function () {
        const cards = getCards();
        const topCard = cards.find(c => c.dataset.pos === '0');
        if (!topCard) return;

        topCard.classList.add('throwing');

        setTimeout(() => {
            topCard.classList.remove('throwing');
            // top card goes to bottom (pos 3), all others move up (pos - 1)
            cards.forEach(c => {
                let pos = parseInt(c.dataset.pos);
                if (pos === 0) {
                    c.dataset.pos = total - 1; // send to back
                } else {
                    c.dataset.pos = pos - 1;   // move up
                }
            });
            current = (current + 1) % total;
            counter.textContent = current + 1;
        }, 520);
    };
})();

// Contact live preview
(function () {
    const name = document.getElementById('cf-name');
    const email = document.getElementById('cf-email');
    const msg = document.getElementById('cf-msg');
    const epFrom = document.getElementById('ep-from');
    const epName = document.getElementById('ep-name');
    const epMsg = document.getElementById('ep-msg');
    if (!name) return;
    function update() {
        const n = name.value.trim();
        const e = email.value.trim();
        const m = msg.value.trim();
        epFrom.textContent = e || 'your@email.com';
        epFrom.className = 'ep-val' + (e ? ' filled' : '');
        epName.textContent = n || 'Your name';
        epName.className = 'ep-val' + (n ? ' filled' : '');
        epMsg.innerHTML = (m || 'Your message will appear here...');
        epMsg.className = 'ep-message-block' + (m ? ' filled' : '');
    }
    name.addEventListener('input', update);
    email.addEventListener('input', update);
    msg.addEventListener('input', update);
})();

function togglePreview() {
    const preview = document.querySelector('.email-preview');
    const btn = document.getElementById('epToggle');
    const isVisible = preview.classList.toggle('ep-visible');
    btn.textContent = isVisible ? '✕ Hide preview' : '✉ Preview email';
}

// Form
async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.submit-btn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
            btn.textContent = 'Sent! ✓';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.textContent = 'Send →';
                btn.style.background = '';
                btn.disabled = false;
                form.reset();
                document.getElementById('ep-from').textContent = 'your@email.com';
                document.getElementById('ep-from').className = 'ep-val';
                document.getElementById('ep-name').textContent = 'Your name';
                document.getElementById('ep-name').className = 'ep-val';
                document.getElementById('ep-msg').textContent = 'Your message will appear here...';
                document.getElementById('ep-msg').className = 'ep-message-block';
            }, 3000);
        } else {
            throw new Error();
        }
    } catch {
        btn.textContent = 'Error — try again';
        btn.style.background = '#ef4444';
        setTimeout(() => {
            btn.textContent = 'Send →';
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    }
}

// Theme toggle
function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light');
    document.getElementById('themeBtn').textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
// Restore saved theme
if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.add('light');
    document.getElementById('themeBtn').textContent = '🌙';
}

// Language toggle
let currentLang = 'en';
function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.flag-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.flag-btn[data-lang="${lang}"]`).classList.add('active');
    // Translate all data-en / data-pt elements
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = lang === 'pt' ? el.dataset.pt : el.dataset.en;
    });
    // Placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(el => {
        el.placeholder = lang === 'pt' ? el.dataset.ptPlaceholder : el.dataset.enPlaceholder;
    });
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
}
document.querySelectorAll('.flag-btn').forEach(btn => {
    btn.onclick = () => setLang(btn.dataset.lang);
});