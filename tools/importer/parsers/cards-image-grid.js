/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-image-grid
 * Base block: cards
 * Source: https://wknd-trendsetters.site/ (content-landing template, snapshot gallery)
 * Generated: 2026-09-15
 *
 * Library structure (Cards): 2 columns, multiple rows. First row = block name.
 * Each subsequent row is a card: image/icon in cell 1, text content in cell 2.
 *
 * Source variant: image-only gallery grid — each card is a single cover image
 * (div.utility-aspect-1x1 > img). No text content, so cell 2 is left empty to
 * keep the 2-column structure consistent.
 */
export default function parse(element, { document }) {
  // Resolve the grid whether element is the container/wrapper or the grid itself
  const grid = element.classList && element.classList.contains('grid-layout')
    ? element
    : element.querySelector('.grid-layout');
  const scope = grid || element;

  // Each direct child div is a card holding one image
  const cardEls = Array.from(scope.querySelectorAll(':scope > div'));

  const cells = [];
  cardEls.forEach((cardEl) => {
    const img = cardEl.querySelector('img');
    if (!img) return;
    // 2-column card: image in cell 1, empty text cell 2 to keep columns even
    cells.push([img, '']);
  });

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-image-grid', cells });
  element.replaceWith(block);
}
