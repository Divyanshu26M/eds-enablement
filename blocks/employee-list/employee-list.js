import { fetchPlaceholders } from '../../scripts/scripts.js';

const PAGE_SIZE = 10;
const DATA_URL = '/data/employees.json';

/**
 * Fetches a page of employees.
 * @param {number} offset The row offset to start from
 * @param {number} limit The max rows to return
 * @returns {Promise<{ data: Array, total: number }>}
 */
async function fetchEmployees(offset, limit) {
  const url = `${DATA_URL}?offset=${offset}&limit=${limit}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to load employees: ${resp.status}`);
  const json = await resp.json();
  return { data: json.data, total: json.total };
}

/**
 * Builds one employee card element from a row.
 * @param {{ name: string, department: string, experience: string, city: string }} employee
 * @returns {HTMLElement}
 */
function buildEmployeeCard(employee) {
  const card = document.createElement('article');
  card.className = 'employee-card';
  card.innerHTML = `
    <h3 class="employee-name">${employee.name}</h3>
    <p class="employee-department">${employee.department}</p>
    <dl class="employee-meta">
      <dt>Experience</dt>
      <dd>${employee.experience} yr${employee.experience === '1' ? '' : 's'}</dd>
      <dt>City</dt>
      <dd>${employee.city}</dd>
    </dl>
  `;
  return card;
}

/**
 * Renders one batch of employees into the grid.
 * @param {HTMLElement} grid The grid container
 * @param {Array} rows The employee rows to render
 */
function appendEmployees(grid, rows) {
  rows.forEach((employee) => grid.append(buildEmployeeCard(employee)));
}

export default async function decorate(block) {
  block.textContent = ''; // clear any authored content

  // Set up the DOM scaffold
  const grid = document.createElement('div');
  grid.className = 'employee-grid';

  const footer = document.createElement('div');
  footer.className = 'employee-list-footer';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button primary employee-load-more';
  footer.append(button);

  block.append(grid, footer);

  // Fetch the placeholder label; fall back if the sheet or key is missing
  const p = await fetchPlaceholders();
  const loadMoreLabel = p.loadMore || 'Load more';
  const noMoreLabel = p.noMore || 'No more results.';
  const loadingLabel = p.loading || 'Loading…';

  button.textContent = loadMoreLabel;

  let offset = 0;
  let total = Infinity; // updated on first fetch

  // Loader — used both on initial render and on button click
  async function loadNextPage() {
    button.disabled = true;
    button.textContent = loadingLabel;

    try {
      const { data, total: totalFromApi } = await fetchEmployees(offset, PAGE_SIZE);
      total = totalFromApi;
      appendEmployees(grid, data);
      offset += data.length;

      if (offset >= total) {
        // Nothing more to load — swap button for end message
        button.remove();
        const done = document.createElement('p');
        done.className = 'employee-list-done';
        done.textContent = noMoreLabel;
        footer.append(done);
      } else {
        button.textContent = loadMoreLabel;
        button.disabled = false;
      }
    } catch (err) {
      button.textContent = `Error: ${err.message}`;
      button.disabled = false;
    }
  }

  button.addEventListener('click', loadNextPage);

  // Initial render — first page
  loadNextPage();
}