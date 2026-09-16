import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards (image grid) variant
 * A dense grid of square images (no text). Forked variant of the base cards block.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => { div.className = 'cards-image-grid-cell'; });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }])));
  block.replaceChildren(ul);
}
