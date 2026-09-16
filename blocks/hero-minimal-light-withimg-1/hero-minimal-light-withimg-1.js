import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero (minimal light, with image collage) variant
 * Two-column hero: text column (heading + paragraph + CTAs) on the left,
 * image collage on the right. Matches the source WKND hero layout.
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];

  const media = document.createElement('div');
  media.className = 'hero-minimal-light-withimg-1-media';
  let content = null;

  cells.forEach((cell) => {
    const pics = cell.querySelectorAll('picture');
    const hasText = cell.textContent.trim().length > 0;
    if (pics.length && !hasText) {
      pics.forEach((pic) => media.append(pic));
    } else if (hasText) {
      content = cell;
      content.classList.add('hero-minimal-light-withimg-1-content');
    }
  });

  // optimize collage images
  media.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // group the CTAs and give them primary/secondary button styling
  if (content) {
    const links = [...content.querySelectorAll('a')];
    if (links.length) {
      const group = document.createElement('div');
      group.className = 'button-group';
      links.forEach((a, i) => {
        a.classList.add('button', i === 0 ? 'primary' : 'secondary');
        const p = a.closest('p');
        group.append(a);
        if (p && !p.textContent.trim()) p.remove();
      });
      content.append(group);
    }
  }

  // rebuild the block as a single row: content column + media column
  block.textContent = '';
  const row = document.createElement('div');
  if (content) row.append(content);
  if (media.children.length) row.append(media);
  block.append(row);
}
