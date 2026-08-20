/**
 * Asteroid Shill Hub & Admin Swarm Control (Interactive Logic)
 */

let currentTab = 'xPosts'; // 'xPosts', 'kolComments', or 'xPremiumPosts'
let currentCategory = 'all';
let searchQuery = '';

const ADMIN_DEFAULT_PASSCODE = 'asteroid2026';

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  renderCards();
});

function initEventListeners() {
  // Tab Switchers
  document.getElementById('tab-xposts').addEventListener('click', () => switchTab('xPosts'));
  document.getElementById('tab-kol').addEventListener('click', () => switchTab('kolComments'));
  document.getElementById('tab-premium').addEventListener('click', () => switchTab('xPremiumPosts'));

  // Search Input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderCards();
  });

  // Category Filters
  const pillBtns = document.querySelectorAll('.pill-btn');
  pillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      pillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderCards();
    });
  });

  // Copy CA Button
  document.getElementById('btn-copy-ca').addEventListener('click', () => {
    copyToClipboard(ASTEROID_DATA.project.contract, 'Contract Address');
  });

  // Random Raid Button
  document.getElementById('btn-random-raid').addEventListener('click', () => {
    const list = ASTEROID_DATA.kolComments;
    const randomItem = list[Math.floor(Math.random() * list.length)];
    copyToClipboard(randomItem.content, 'Random Raid Comment');
  });

  // Admin Nav Trigger
  document.getElementById('btn-open-admin').addEventListener('click', () => {
    openAdminPanel();
  });
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-xposts').classList.toggle('active', tab === 'xPosts');
  document.getElementById('tab-kol').classList.toggle('active', tab === 'kolComments');
  document.getElementById('tab-premium').classList.toggle('active', tab === 'xPremiumPosts');
  renderCards();
}

function renderCards() {
  const container = document.getElementById('cards-container');
  const items = ASTEROID_DATA[currentTab] || [];

  const filtered = items.filter(item => {
    // Category filter
    if (currentCategory !== 'all') {
      const catMatch = item.category === currentCategory || item.style === currentCategory;
      if (!catMatch) return false;
    }

    // Search filter
    if (searchQuery) {
      const text = (item.title + ' ' + item.content + ' ' + (item.category || item.style)).toLowerCase();
      if (!text.includes(searchQuery)) return false;
    }

    return true;
  });

  // Update counts
  document.getElementById('count-xposts').innerText = ASTEROID_DATA.xPosts.length;
  document.getElementById('count-kol').innerText = ASTEROID_DATA.kolComments.length;
  document.getElementById('count-premium').innerText = (ASTEROID_DATA.xPremiumPosts || []).length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>🔍 No matching templates found</h3>
        <p>Try searching with another keyword or reset the category filter to view all templates.</p>
      </div>
    `;
    return;
  }

  const isPremium = currentTab === 'xPremiumPosts';
  const isPost = currentTab === 'xPosts' || isPremium;

  container.innerHTML = filtered.map(item => {
    const charCount = item.content.length;
    const tagClass = 'tag-' + (item.category || item.style || 'direct');
    const tagLabel = (item.category || item.style || 'raid').toUpperCase();
    const tweetIntentUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(item.content);

    return `
      <div class="content-card ${isPremium ? 'premium-card' : ''}">
        <div>
          <div class="card-header">
            <div class="card-title">${item.title}</div>
            <div class="card-tags">
              <span class="tag ${tagClass}">${tagLabel}</span>
              ${isPremium ? `
                <span class="tag tag-premium">💎 PREMIUM</span>
              ` : `
                <span class="tag" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">&le; 280</span>
              `}
            </div>
          </div>
          <pre class="card-body">${escapeHtml(item.content)}</pre>
        </div>
        <div class="card-footer">
          <div class="char-counter" style="color: ${isPremium ? '#fbbf24' : '#34d399'}; font-weight: 600;">
            ${isPremium ? `💎 ${charCount} chars • X Premium Long-Form` : `📊 ${charCount}/280 chars`}
          </div>
          <div class="card-actions">
            ${isPost ? `
              <a href="${tweetIntentUrl}" target="_blank" rel="noopener noreferrer" class="btn-post-x" title="Post directly to X">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Post to X
              </a>
            ` : ''}
            <button class="btn-copy-card" onclick="copyCardContent('${item.id}', this)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function copyCardContent(id, buttonElement) {
  const allItems = [
    ...(ASTEROID_DATA.xPosts || []),
    ...(ASTEROID_DATA.kolComments || []),
    ...(ASTEROID_DATA.xPremiumPosts || [])
  ];
  const item = allItems.find(i => i.id === id);
  if (!item) return;

  copyToClipboard(item.content, item.title);

  // Visual feedback
  const originalHtml = buttonElement.innerHTML;
  buttonElement.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
    Copied!
  `;
  buttonElement.classList.add('copied');

  setTimeout(() => {
    buttonElement.innerHTML = originalHtml;
    buttonElement.classList.remove('copied');
  }, 1800);
}

function copyToClipboard(text, label) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`✅ Copied to clipboard: ${label || 'Content'}`);
    }).catch(() => fallbackCopy(text, label));
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`✅ Copied to clipboard: ${label || 'Content'}`);
  } catch (err) {
    showToast('❌ Copy failed, please select text manually.');
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, 2200);
}

/* =========================================================================
   ADMIN PANEL & LIVE SWARM SIMULATION LOGIC
   ========================================================================= */

function openAdminPanel() {
  const isAuth = localStorage.getItem('asteroid_admin_auth') === 'true';
  if (isAuth) {
    document.getElementById('modal-admin-dashboard').classList.add('active');
  } else {
    document.getElementById('modal-admin-login').classList.add('active');
    document.getElementById('admin-passcode').focus();
  }
}

function closeAdminModals() {
  document.getElementById('modal-admin-login').classList.remove('active');
  document.getElementById('modal-admin-dashboard').classList.remove('active');
}

function handleAdminLogin(event) {
  event.preventDefault();
  const inputPass = document.getElementById('admin-passcode').value.trim();
  if (inputPass === ADMIN_DEFAULT_PASSCODE || inputPass === 'admin') {
    localStorage.setItem('asteroid_admin_auth', 'true');
    closeAdminModals();
    showToast('🔓 Admin access granted!');
    document.getElementById('modal-admin-dashboard').classList.add('active');
  } else {
    showToast('❌ Incorrect passcode. Try default: asteroid2026');
  }
}

function handleAdminLogout() {
  localStorage.removeItem('asteroid_admin_auth');
  closeAdminModals();
  showToast('🔒 Admin session logged out.');
}

function copyCliCommand(cmd) {
  const fullCmd = `node bot/index.js ${cmd}`;
  copyToClipboard(fullCmd, `CLI Command: ${fullCmd}`);
}

function resetSwarmHistory() {
  showToast('🔄 Swarm history reset command copied!');
  copyToClipboard('node bot/index.js --status', 'Status command');
}

function logToConsole(text) {
  const consoleEl = document.getElementById('admin-console');
  if (consoleEl) {
    consoleEl.innerText += '\n' + text;
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

function runBrowserSwarmSimulation() {
  const consoleEl = document.getElementById('admin-console');
  consoleEl.innerText = `[${new Date().toLocaleTimeString()}] 🚀 Initiating Live Swarm Simulation...`;

  const posts = ASTEROID_DATA.xPremiumPosts || ASTEROID_DATA.xPosts;
  const post = posts[Math.floor(Math.random() * posts.length)];
  const comments = ASTEROID_DATA.kolComments;

  setTimeout(() => {
    logToConsole(`\n👑 [MASTER] @Main_Official_Asteroid publishing ${post.category.toUpperCase()} post...`);
    logToConsole(`   📝 Title: "${post.title}"`);
    logToConsole(`   ✅ Master Tweet Live! (Mock Tweet ID: #${Date.now()})`);
  }, 400);

  setTimeout(() => {
    logToConsole(`\n🔍 Matching 3 Clone Accounts by topic '${post.category}'...`);
  }, 900);

  const clones = [
    { name: 'SpaceShibaArmy_1', delay: '2.8' },
    { name: 'BscGemHunter_2', delay: '7.4' },
    { name: 'PolarisShiba_3', delay: '18.5' }
  ];

  clones.forEach((c, idx) => {
    setTimeout(() => {
      const cmt = comments[idx] || comments[0];
      logToConsole(`   🤖 Clone ${idx + 1} [@${c.name}] triggered after ${c.delay}m delay:`);
      logToConsole(`      💬 "${cmt.content.slice(0, 60)}..."`);
      logToConsole(`      ✅ Reply posted! (Mock ID: #reply_${Date.now() + idx})`);

      if (idx === clones.length - 1) {
        logToConsole(`\n🎉 [SWARM COMPLETE] All 3 clone replies delivered on timeline! Velocity algorithm activated.`);
        showToast('🎉 Live Swarm simulation completed successfully!');
      }
    }, 1500 + idx * 800);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
