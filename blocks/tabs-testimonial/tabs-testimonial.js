import { toClassName } from '../../scripts/aem.js';

/*
 * Tabs (testimonial) variant
 * Each authored row is one testimonial:
 *   cell 1 = tab label  -> avatar + name + role
 *   cell 2 = panel body -> photo + name + role + quote
 * The first cell becomes a tab button, the row becomes the tab panel.
 */
export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-testimonial-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-label', 'Testimonials');

  const rows = [...block.children];
  rows.forEach((row, i) => {
    const label = row.firstElementChild;
    const id = toClassName(label.textContent);

    // the row itself becomes the tab panel (its remaining cell is the body)
    const tabpanel = row;
    tabpanel.className = 'tabs-testimonial-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build the tab button from the label cell (avatar + name + role)
    const button = document.createElement('button');
    button.className = 'tabs-testimonial-tab';
    button.id = `tab-${id}`;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    const avatar = label.querySelector('picture, img');
    if (avatar) {
      const avatarWrap = document.createElement('span');
      avatarWrap.className = 'tabs-testimonial-avatar';
      avatarWrap.append(avatar.closest('picture') || avatar);
      button.append(avatarWrap);
    }

    const text = document.createElement('span');
    text.className = 'tabs-testimonial-tab-text';
    const paragraphs = [...label.querySelectorAll('p')].filter((p) => p.textContent.trim());
    paragraphs.forEach((p, pi) => {
      const line = document.createElement('span');
      line.className = pi === 0 ? 'tabs-testimonial-name' : 'tabs-testimonial-role';
      line.innerHTML = p.innerHTML;
      text.append(line);
    });
    button.append(text);

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    tablist.append(button);
    label.remove();
  });

  block.append(tablist);
}
