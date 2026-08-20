
/**
 * Asteroid Raid & Shill Hub - Interactive Logic (100% English)
 */

let currentTab = 'xPosts'; // 'xPosts' or 'kolComments'
let currentCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  renderCards();
});

function initEventListeners() {
  // Tab Switchers
  document.getElementById('tab-xposts').addEventListener('click', () => switchTab('xPosts'));
  document.getElementById('tab-kol').addEventListener('click', () => switchTab('kolComments'));

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
}

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tab-xposts').classList.toggle('active', tab === 'xPosts');
  document.getElementById('tab-kol').classList.toggle('active', tab === 'kolComments');
  renderCards();
}

function renderCards() {
  const container = document.getElementById('cards-container');
  const items = ASTEROID_DATA[currentTab];

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

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>🔍 No matching templates found</h3>
        <p>Try searching with another keyword or reset the category filter to view all 100 templates.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const charCount = item.content.length;
    const isXPost = currentTab === 'xPosts';
    const tagClass = 'tag-' + (item.category || item.style || 'direct');
    const tagLabel = (item.category || item.style || 'raid').toUpperCase();
    const tweetIntentUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(item.content);

    return `
      <div class="content-card">
        <div>
          <div class="card-header">
            <div class="card-title">${item.title}</div>
            <div class="card-tags">
              <span class="tag ${tagClass}">${tagLabel}</span>
            </div>
          </div>
          <pre class="card-body">${escapeHtml(item.content)}</pre>
        </div>
        <div class="card-footer">
          <div class="char-counter">📊 ${charCount} chars</div>
          <div class="card-actions">
            ${isXPost ? `
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
  const allItems = [...ASTEROID_DATA.xPosts, ...ASTEROID_DATA.kolComments];
  const item = allItems.find(i => i.id === id);
  if (!item) return;

  copyToClipboard(item.content, item.title);

  // Visual feedback on button
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
    }).catch(err => {
      fallbackCopy(text, label);
    });
  } else {
    fallbackCopy(text, label);
  }
}

function fallbackCopy(text, label) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(`✅ Copied to clipboard: ${label || 'Content'}`);
  } catch (err) {
    showToast('❌ Copy failed, please copy manually.');
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

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
