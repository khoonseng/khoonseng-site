'use strict';

/* ─── Language dot colours (GitHub convention) ─── */
const LANG_COLORS = {
  'Python':           '#3776AB',
  'Jupyter Notebook': '#F37626',
  'JavaScript':       '#F7DF1E',
  'TypeScript':       '#3178C6',
  'HTML':             '#E34F26',
  'CSS':              '#1572B6',
  'Java':             '#B07219',
  'Go':               '#00ADD8',
  'Rust':             '#DEA584',
  'Shell':            '#89E051',
  'Ruby':             '#CC342D',
  'C':                '#555555',
  'C++':              '#F34B7D',
  'C#':               '#178600',
  'Kotlin':           '#A97BFF',
  'Swift':            '#FA7343',
  'R':                '#276DC3',
};

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function starIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
}

function buildRepoCard(repo) {
  const desc = repo.description
    ? `<p class="card-desc">${escHtml(repo.description)}</p>`
    : `<p class="card-desc" style="color:var(--border);font-style:italic">No description</p>`;

  const langColor = repo.language ? (LANG_COLORS[repo.language] || '#8B8FA8') : null;

  const langHtml = repo.language
    ? `<span class="card-lang">
         <span class="lang-dot" style="background:${escHtml(langColor)}" aria-hidden="true"></span>
         <span>${escHtml(repo.language)}</span>
       </span>`
    : '';

  const starsHtml = repo.stargazers_count > 0
    ? `<span class="card-stars">${starIcon()} ${repo.stargazers_count}</span>`
    : '';

  const metaHtml = (langHtml || starsHtml)
    ? `<div class="card-meta">${langHtml}${starsHtml}</div>`
    : '';

  return `<article class="card">
    <h3 class="card-title">${escHtml(repo.name)}</h3>
    ${desc}
    ${metaHtml}
    <a href="${escHtml(repo.html_url)}" class="card-link" target="_blank" rel="noopener noreferrer">
      View repository →
    </a>
  </article>`;
}

async function loadRepos() {
  const grid = document.getElementById('repos-grid');
  const loading = document.getElementById('repos-loading');
  if (!grid) return;

  try {
    const res = await fetch(
      'https://api.github.com/users/khoonseng/repos?sort=updated&per_page=12'
    );
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

    const repos = await res.json();

    loading.remove();

    if (!repos.length) {
      grid.insertAdjacentHTML('beforeend',
        '<p class="repos-status">No public repositories yet.</p>'
      );
      return;
    }

    grid.insertAdjacentHTML('beforeend', repos.map(buildRepoCard).join(''));

  } catch (_err) {
    if (loading) {
      loading.className = 'repos-status repos-error';
      loading.innerHTML =
        'Couldn\'t load repositories right now. ' +
        '<a href="https://github.com/khoonseng" target="_blank" rel="noopener noreferrer">View them on GitHub →</a>';
    }
  }
}

/* ─── Nav active-section highlight ─── */
function initNavHighlight() {
  const sections = document.querySelectorAll('main section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-35% 0px -60% 0px' }
  );

  sections.forEach(s => observer.observe(s));
}

document.addEventListener('DOMContentLoaded', () => {
  loadRepos();
  initNavHighlight();
});
