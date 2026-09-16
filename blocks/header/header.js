// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Metadata-independent dual-fetch:
 * /content first (localhost / aem up), then root (DA/EDS production).
 */
async function fetchNav() {
  // Metadata-independent dual-fetch: /content first (localhost), then root (prod).
  let base = '/content/';
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    base = '/';
    resp = await fetch('/nav.plain.html');
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Resolve relative image paths against the nav fragment location, not the
  // current page path (which may be nested, e.g. /content/wknd/home).
  tmp.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', base + src);
    }
  });
  return tmp;
}

/** Close every open dropdown/megamenu in the nav. */
function closeAllDropdowns(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((el) => {
    el.setAttribute('aria-expanded', 'false');
    const t = el.querySelector(':scope > .nav-drop-trigger');
    if (t) t.setAttribute('aria-expanded', 'false');
  });
}

/** Build one megamenu column from a `<li><p>heading</p><ul>…</ul></li>` node. */
function buildMegaColumn(li) {
  const col = document.createElement('div');
  col.className = 'nav-mega-column';
  const heading = li.querySelector(':scope > p');
  if (heading) {
    const h = document.createElement('h3');
    h.textContent = heading.textContent.trim();
    col.append(h);
  }
  const list = li.querySelector(':scope > ul');
  if (list) {
    const ul = document.createElement('ul');
    [...list.children].forEach((itemLi) => {
      const a = itemLi.querySelector('a');
      if (!a) return;
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      const strong = a.querySelector('strong');
      const title = document.createElement('span');
      title.className = 'nav-mega-title';
      title.textContent = strong ? strong.textContent.trim() : a.textContent.trim();
      link.append(title);
      // whitespace node so title/description read as separate words in textContent
      link.append(document.createTextNode(' '));
      if (strong) {
        const descText = [...a.childNodes]
          .filter((n) => n !== strong)
          .map((n) => n.textContent)
          .join('')
          .trim();
        if (descText) {
          const desc = document.createElement('span');
          desc.className = 'nav-mega-desc';
          desc.textContent = descText;
          link.append(desc);
        }
      }
      const item = document.createElement('li');
      item.append(link);
      ul.append(item);
    });
    col.append(ul);
  }
  return col;
}

/** Build the promo card from a `<a><strong>title</strong> desc CTA</a>`. */
function buildPromoCard(a) {
  const card = document.createElement('a');
  card.className = 'nav-mega-promo';
  card.href = a.getAttribute('href');
  const strong = a.querySelector('strong');
  const title = strong ? strong.textContent.trim() : '';
  const rest = [...a.childNodes]
    .filter((n) => n !== strong)
    .map((n) => n.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = rest.split(' ');
  const cta = words.length ? words.pop() : '';
  const desc = words.join(' ').trim();
  if (title) {
    const h = document.createElement('strong');
    h.className = 'nav-mega-promo-title';
    h.textContent = title;
    card.append(h);
    card.append(document.createTextNode(' '));
  }
  if (desc) {
    const p = document.createElement('span');
    p.className = 'nav-mega-promo-desc';
    p.textContent = desc;
    card.append(p);
    card.append(document.createTextNode(' '));
  }
  if (cta) {
    const c = document.createElement('span');
    c.className = 'nav-mega-promo-cta';
    c.textContent = cta;
    card.append(c);
  }
  return card;
}

/**
 * Build a nav item (top-level `<li>`). Plain links pass through; items with a
 * nested `<ul>` become dropdowns — a megamenu if any child has its own sublist,
 * otherwise a simple text dropdown.
 */
function buildNavItem(li) {
  const directLink = li.querySelector(':scope > a');
  const label = li.querySelector(':scope > p');
  const sublist = li.querySelector(':scope > ul');

  const item = document.createElement('li');

  if (directLink && !sublist) {
    const a = document.createElement('a');
    a.href = directLink.getAttribute('href');
    a.textContent = directLink.textContent.trim();
    item.append(a);
    return item;
  }

  if (sublist) {
    item.classList.add('nav-drop');
    item.setAttribute('aria-expanded', 'false');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-drop-trigger';
    trigger.textContent = (label || directLink).textContent.trim();
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    item.append(trigger);

    const columns = [...sublist.children];
    const isMega = columns.some((c) => c.querySelector(':scope > ul'));
    let panel;

    if (isMega) {
      // Flyout wrapper holds the columns panel + promo card as siblings, so the
      // promo (like the source) sits alongside — not inside — the link panel.
      panel = document.createElement('div');
      panel.className = 'nav-flyout';
      const grid = document.createElement('div');
      grid.className = 'nav-megamenu nav-mega-grid';
      const promos = [];
      columns.forEach((c) => {
        const promoLink = c.querySelector(':scope > p > a');
        if (promoLink && !c.querySelector(':scope > ul')) {
          promos.push(buildPromoCard(promoLink));
        } else {
          grid.append(buildMegaColumn(c));
        }
      });
      panel.append(grid);
      promos.forEach((p) => panel.append(p));
    } else {
      panel = document.createElement('div');
      panel.className = 'nav-dropdown';
      const ul = document.createElement('ul');
      columns.forEach((c) => {
        const a = c.querySelector('a');
        if (!a) return;
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        const dli = document.createElement('li');
        dli.append(link);
        ul.append(dli);
      });
      panel.append(ul);
    }
    item.append(panel);

    const openDrop = () => { if (isDesktop.matches) item.setAttribute('aria-expanded', 'true'); };
    const closeDrop = () => { if (isDesktop.matches) item.setAttribute('aria-expanded', 'false'); };
    item.addEventListener('mouseenter', openDrop);
    item.addEventListener('mouseleave', closeDrop);
    trigger.addEventListener('click', () => {
      const expanded = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    });
    return item;
  }

  if (label) item.append(document.createTextNode(label.textContent.trim()));
  return item;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const frag = await fetchNav();
  block.textContent = '';
  if (!frag) return;

  const sections = [...frag.children].filter((c) => c.tagName === 'DIV');
  const [brandSection, navSection, toolsSection] = sections;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // --- Brand ---
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    const a = brandSection.querySelector('a');
    if (a) {
      const link = document.createElement('a');
      link.href = a.getAttribute('href') || '/';
      link.setAttribute('aria-label', 'Home');
      const img = a.querySelector('img');
      if (img) {
        const logo = document.createElement('span');
        logo.className = 'nav-logo';
        const i = document.createElement('img');
        i.src = img.getAttribute('src');
        i.alt = img.getAttribute('alt') || '';
        logo.append(i);
        link.append(logo);
      }
      const text = a.textContent.trim();
      if (text) {
        const labelSpan = document.createElement('span');
        labelSpan.className = 'nav-brand-text';
        labelSpan.textContent = text;
        link.append(labelSpan);
      }
      brand.append(link);
    }
  }

  // --- Hamburger (mobile) ---
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  // --- Main nav items ---
  const navItems = document.createElement('ul');
  navItems.className = 'nav-items';
  if (navSection) {
    const topUl = navSection.querySelector(':scope > ul');
    if (topUl) {
      [...topUl.children].forEach((li) => navItems.append(buildNavItem(li)));
    }
  }
  const navMain = document.createElement('div');
  navMain.className = 'nav-main';
  navMain.append(navItems);

  // --- Tools (Subscribe etc.) ---
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  if (toolsSection) {
    toolsSection.querySelectorAll('a').forEach((a) => {
      const btn = document.createElement('a');
      btn.href = a.getAttribute('href') || '#';
      btn.className = 'button primary nav-cta';
      btn.textContent = a.textContent.trim();
      tools.append(btn);
    });
  }

  nav.append(brand, hamburger, navMain, tools);

  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (!open) closeAllDropdowns(nav);
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAllDropdowns(nav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAllDropdowns(nav);
      if (nav.classList.contains('nav-open')) {
        nav.classList.remove('nav-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // viewport resize handling: reset state when crossing the breakpoint
  isDesktop.addEventListener('change', () => {
    closeAllDropdowns(nav);
    nav.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  wrapper.append(nav);
  block.append(wrapper);
}
