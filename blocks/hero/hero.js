import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Hero Block
 * Base hero renders an optional background image behind heading/content.
 * The "minimal-light-withimg" option lays text and image out side by side
 * on a light background instead of overlaying.
 */
const OPTION_CLASSES = ['minimal-light-withimg'];

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  if (active.includes('minimal-light-withimg')) {
    // side-by-side text + image layout
    const cells = [...block.querySelectorAll(':scope > div > div')];
    cells.forEach((cell) => {
      const pics = cell.querySelectorAll('picture');
      const hasText = cell.textContent.trim().length > 0;
      if (pics.length && !hasText) cell.classList.add('hero-media');
      else cell.classList.add('hero-content');
    });
    block.querySelectorAll('picture > img').forEach((img) => img
      .closest('picture')
      .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

    // Article-header layout: group byline paragraphs and mark the category tag.
    // Authored content in the text cell is: h1, then a series of <p> lines
    // (e.g. "By", author, date, "•", read time) followed by a category label.
    const content = block.querySelector('.hero-content');
    if (content) {
      const paras = [...content.querySelectorAll(':scope > p')];
      if (paras.length) {
        // Last paragraph is the category tag pill.
        const tag = paras.pop();
        tag.classList.add('hero-tag');

        if (paras.length) {
          // Remaining paragraphs form the byline. Row 1 = author credit
          // ("By" + name); Row 2 = the rest (date, separators, read time).
          const group = document.createElement('div');
          group.className = 'hero-byline';
          const row1 = document.createElement('div');
          row1.className = 'hero-byline-row';
          const row2 = document.createElement('div');
          row2.className = 'hero-byline-row';

          paras.forEach((p, i) => {
            p.classList.add('hero-meta');
            (i < 2 ? row1 : row2).appendChild(p);
          });

          if (row1.children.length) group.appendChild(row1);
          if (row2.children.length) group.appendChild(row2);
          content.insertBefore(group, tag);
        }
      }
    }
  }
}
