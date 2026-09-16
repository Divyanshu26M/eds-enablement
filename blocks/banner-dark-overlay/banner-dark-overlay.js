import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Banner (dark overlay) variant
 * Full-bleed background image with an overlaid heading, text and CTA.
 * Forked variant of the base banner block.
 */
export default function decorate(block) {
  // locate the image (prefer <picture>, fall back to a bare <img>)
  let picture = block.querySelector('picture');
  if (!picture) {
    const img = block.querySelector('img');
    if (img) {
      picture = document.createElement('picture');
      picture.append(img);
    }
  }
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      picture = createOptimizedPicture(img.src, img.alt, false, [{ width: '1600' }]);
    }
  }

  // gather the non-image content (heading, text, CTA)
  const contentRows = [...block.children].filter((row) => !row.querySelector('img'));
  const content = document.createElement('div');
  content.className = 'banner-dark-overlay-content';
  contentRows.forEach((row) => {
    const cell = row.querySelector(':scope > div') || row;
    content.append(...cell.childNodes);
  });

  // style standalone CTA links as pill buttons (the source "See more" is a
  // plain link, so the global decorateButtons -- which requires strong/em
  // formatting -- leaves it untouched)
  content.querySelectorAll('p > a[href]').forEach((a) => {
    const p = a.closest('p');
    if (p.textContent.trim() !== a.textContent.trim()) return;
    p.classList.add('button-container');
    a.classList.add('button');
  });

  // rebuild: background image layer + overlay content
  block.textContent = '';
  if (picture) {
    const layer = document.createElement('div');
    layer.className = 'banner-dark-overlay-image';
    layer.append(picture);
    block.append(layer);
  }
  block.append(content);
}
