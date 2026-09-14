import { fetchPlaceholders } from '../../scripts/scripts.js';

const INDEX_URL = '/query-index.json';

/**
 * Fetches all rows from the query index.
 * For sites with hundreds of pages, this could paginate; for a small site,
 * a single fetch is fine.
 * @returns {Promise<Array>}
 */
async function fetchIndex() {
  const resp = await fetch(INDEX_URL);
  if (!resp.ok) throw new Error(`Index fetch failed: ${resp.status}`);
  const json = await resp.json();
  return json.data;
}

/**
 * Builds one card element from an index row.
 * @param {{ path: string, title: string, description: string, image: string }} row
 * @returns {HTMLElement}
 */
function buildCard(row) {
  const article = document.createElement('article');
  article.className = 'article-card';

  const link = document.createElement('a');
  link.href = row.path;
  link.className = 'article-card-link';

  // Image (if present)
  if (row.image) {
    const img = document.createElement('img');
    img.src = row.image;
    img.alt = row.title || '';
    img.loading = 'lazy';
    img.className = 'article-card-image';
    link.append(img);
  }

  const body = document.createElement('div');
  body.className = 'article-card-body';

  const heading = document.createElement('h3');
  heading.className = 'article-card-title';
  heading.textContent = row.title || row.path;
  body.append(heading);

  if (row.description) {
    const desc = document.createElement('p');
    desc.className = 'article-card-description';
    desc.textContent = row.description;
    body.append(desc);
  }

  link.append(body);
  article.append(link);
  return article;
}

/**
 * Builds the "no results" empty state.
 * @param {string} message
 * @returns {HTMLElement}
 */
function buildEmptyState(message) {
  const empty = document.createElement('p');
  empty.className = 'article-list-empty';
  empty.textContent = message;
  return empty;
}

export default async function decorate(block) {
  // Read optional filter prefix from the block body (e.g. "/blocks")
  const filterPrefix = block.textContent.trim();

  // Load placeholders for user-facing text
  const p = await fetchPlaceholders();
  const loadingLabel = p.loading || 'Loading…';
  const emptyLabel = p.articleListEmpty || 'No articles found.';
  const errorLabel = p.errorGeneric || 'Something went wrong.';

  // Render skeleton
  block.textContent = '';
  const status = document.createElement('p');
  status.className = 'article-list-status';
  status.textContent = loadingLabel;
  block.append(status);

  try {
    const rows = await fetchIndex();

    // Filter by prefix (if authored) and sort by title
    const filtered = rows
      .filter((row) => (filterPrefix ? row.path.startsWith(filterPrefix) : true))
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    status.remove();

    if (filtered.length === 0) {
      block.append(buildEmptyState(emptyLabel));
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'article-list-grid';
    filtered.forEach((row) => grid.append(buildCard(row)));
    block.append(grid);
  } catch (err) {
    status.textContent = `${errorLabel} (${err.message})`;
    status.classList.add('article-list-error');
  }
}