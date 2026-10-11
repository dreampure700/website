// TEENSPACE 2026 - MAIN APP INTERACTION LOGIC

function initApp() {
  // Initialize Premium Opening Splash Screen
  initSplashScreen();

  // Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Navbar Scroll Shadow
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.6)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    });
  }

  // Active Section Observer for Nav links (Only active on Home Page)
  const sections = document.querySelectorAll('section[id]');
  const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '';
  if (isHomePage && sections.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;

      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        const sectionId = current.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

        if (navLink) {
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            navLink.classList.add('active');
          }
        }
      });
    });
  }
}

// Safely execute when DOM is ready (handles interactive / complete readyState)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Helper to launch direct WhatsApp message
function openWhatsApp(customText = '') {
  const phone = '919656677700';
  const text = customText || 'Assalamu Alaikum, I would like to inquire about TEENSPACE 2026 organized by Wisdom Students Thrissur District Committee.';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ========================================================
// PROGRESSIVE WEB APP (PWA) SERVICE WORKER & INSTALL LOGIC
// ========================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('Service Worker registered successfully:', reg.scope);
        reg.update();
      })
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom floating installation banner
  showInstallBanner();
});

function showInstallBanner() {
  if (sessionStorage.getItem('teenspace_install_dismissed')) return;
  if (document.getElementById('pwaInstallBanner')) return;

  const bottomNav = document.getElementById('bottomNavBar');
  const isBottomNavVisible = bottomNav && window.getComputedStyle(bottomNav).display !== 'none';

  const banner = document.createElement('div');
  banner.id = 'pwaInstallBanner';
  banner.style.position = 'fixed';
  banner.style.bottom = isBottomNavVisible ? '85px' : '20px';
  banner.style.left = '16px';
  banner.style.right = '16px';
  banner.style.background = 'rgba(15, 23, 42, 0.95)';
  banner.style.backdropFilter = 'blur(10px)';
  banner.style.border = '1px solid rgba(255, 255, 255, 0.15)';
  banner.style.borderRadius = '16px';
  banner.style.padding = '0.9rem 1.15rem';
  banner.style.display = 'flex';
  banner.style.alignItems = 'center';
  banner.style.justifyContent = 'space-between';
  banner.style.zIndex = '100000';
  banner.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
  banner.style.color = '#FFFFFF';
  banner.style.pointerEvents = 'auto';
  
  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.75rem; text-align:left;">
      <img src="assets/images/teenspace_app_icon_192.png" alt="Teenspace App" style="width:38px; height:38px; border-radius:10px; object-fit:contain;">
      <div>
        <div style="font-weight:700; font-size:0.9rem; line-height:1.2;">Install TEENSPACE App</div>
        <div style="font-size:0.75rem; color:#94A3B8; margin-top:2px;">Add to home screen for fast access</div>
      </div>
    </div>
    <div style="display:flex; gap:0.5rem; align-items:center;">
      <button id="pwaInstallBtn" class="btn btn-primary" style="padding:0.45rem 0.85rem; font-size:0.8rem; height:auto; margin:0; width:auto; border-radius:8px; cursor:pointer;">Install</button>
      <button id="pwaCloseBtn" aria-label="Close" style="background:none; border:none; color:#94A3B8; font-size:1.3rem; cursor:pointer; padding:0.4rem; display:flex; align-items:center; justify-content:center; touch-action:manipulation;"><i class="fas fa-times"></i></button>
    </div>
  `;

  document.body.appendChild(banner);

  function dismissBanner(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    banner.style.display = 'none';
    if (banner.parentNode) banner.parentNode.removeChild(banner);
    sessionStorage.setItem('teenspace_install_dismissed', 'true');
  }

  const closeBtn = document.getElementById('pwaCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', dismissBanner);
    closeBtn.addEventListener('touchend', dismissBanner);
  }

  const installBtn = document.getElementById('pwaInstallBtn');
  if (installBtn) {
    installBtn.addEventListener('click', (e) => {
      dismissBanner(e);
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          } else {
            console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
        }).catch(() => {});
      }
    });
  }
}

// Fast Opening & Premium Light Splash Screen Handler with unconditional safety timer
function initSplashScreen() {
  const splash = document.getElementById('appSplashScreen');
  if (!splash) return;

  // Unconditional failsafe timer: remove element from DOM within 1.5 seconds maximum
  const forceRemoveTimer = setTimeout(() => {
    if (splash && splash.parentNode) {
      splash.parentNode.removeChild(splash);
    }
  }, 1500);

  const hasSeenSplash = sessionStorage.getItem('teenspace_splash_shown');
  const delay = hasSeenSplash ? 50 : 600;

  setTimeout(() => {
    if (!splash) return;
    splash.classList.add('hide-splash');
    sessionStorage.setItem('teenspace_splash_shown', 'true');
    setTimeout(() => {
      clearTimeout(forceRemoveTimer);
      if (splash && splash.parentNode) {
        splash.parentNode.removeChild(splash);
      }
    }, 400);
  }, delay);
}

// Brochure Lightbox Modal Handler
let currentBrochurePage = 1;
function openBrochureModal(pageNum) {
  currentBrochurePage = pageNum || 1;
  const modal = document.getElementById('brochureModal');
  if (modal) {
    switchBrochurePage(currentBrochurePage);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeBrochureModal() {
  const modal = document.getElementById('brochureModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function switchBrochurePage(pageNum) {
  currentBrochurePage = pageNum;
  const img = document.getElementById('brochureModalImg');
  const btn1 = document.getElementById('brochurePrevPageBtn');
  const btn2 = document.getElementById('brochureNextPageBtn');

  if (img) {
    img.src = `assets/images/teenspace_brochure_page${pageNum}.png`;
  }
  if (btn1 && btn2) {
    if (pageNum === 1) {
      btn1.style.background = 'var(--magenta)';
      btn1.style.borderColor = 'var(--magenta)';
      btn2.style.background = 'transparent';
      btn2.style.borderColor = 'rgba(255,255,255,0.3)';
    } else {
      btn2.style.background = 'var(--cyan)';
      btn2.style.borderColor = 'var(--cyan)';
      btn1.style.background = 'transparent';
      btn1.style.borderColor = 'rgba(255,255,255,0.3)';
    }
  }
}

// Close Brochure Modal on Outside Overlay Click or Escape Key
document.addEventListener('DOMContentLoaded', () => {
  const bModal = document.getElementById('brochureModal');
  if (bModal) {
    bModal.addEventListener('click', (e) => {
      if (e.target === bModal) {
        closeBrochureModal();
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBrochureModal();
    }
  });
});
