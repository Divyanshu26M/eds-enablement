import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards (article) variant
 * Article teaser cards: image on top, then a meta row (tag pill + date) and title.
 * Forked variant of the base cards block.
 */

/**
 * Splits a meta line like "Casual Cool May 12" into a tag pill and a trailing date.
 * @param {HTMLParagraphElement} p meta paragraph
 */
function decorateMeta(p) {
  const text = p.textContent.trim();
  // trailing date such as "May 12", "Sept 3", "December 25"
  const match = text.match(/\s([A-Z][a-z]{2,8}\.?\s\d{1,2})$/);
  const meta = document.createElement('div');
  meta.className = 'cards-article-meta';
  if (match) {
    const tagText = text.slice(0, match.index).trim();
    const dateText = match[1];
    if (tagText) {
      const tag = document.createElement('span');
      tag.className = 'cards-article-tag';
      tag.textContent = tagText;
      meta.append(tag);
    }
    const date = document.createElement('span');
    date.className = 'cards-article-date';
    date.textContent = dateText;
    meta.append(date);
  } else {
    const tag = document.createElement('span');
    tag.className = 'cards-article-tag';
    tag.textContent = text;
    meta.append(tag);
  }
  p.replaceWith(meta);
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-article-image';
      } else {
        div.className = 'cards-article-body';
      }
    });
    ul.append(li);
  });

  // meta row (first paragraph of each body) -> tag pill + date
  ul.querySelectorAll('.cards-article-body > p:first-child').forEach(decorateMeta);

  ul.querySelectorAll('picture > img').forEach((img) => img
    .closest('picture')
    .replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
