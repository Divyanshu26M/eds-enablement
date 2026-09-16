/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-light-withimg-1
 * Base block: hero
 * Source: https://wknd-trendsetters.site/ (content-landing template)
 * Generated: 2026-09-15
 *
 * Library structure (Hero): 1 column, 3 rows.
 *   Row 1: block name
 *   Row 2: background/hero image(s) (optional)
 *   Row 3: title (heading) + subheading + CTA(s)
 *
 * Source variant: two-column hero — text column (h1 + subheading + 2 CTAs)
 * beside an image collage (3 cover images). Images placed in the image row,
 * text/CTAs placed in the content row.
 */
export default function parse(element, { document }) {
  // Resolve the grid whether element is the container or the grid itself
  const grid = element.classList && element.classList.contains('grid-layout')
    ? element
    : element.querySelector('.grid-layout');
  const scope = grid || element;

  // Heading
  const heading = scope.querySelector('h1, h2, .h1-heading, [class*="heading"]');
  // Subheading / description
  const description = scope.querySelector('p.subheading, p, [class*="subheading"]');
  // CTAs
  const ctaLinks = Array.from(scope.querySelectorAll('.button-group a, a.button'));
  // Collage / hero images
  const images = Array.from(scope.querySelectorAll('img'));

  // Empty-block guard
  if (!heading && !description && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image(s)
  if (images.length) {
    cells.push([images]);
  }

  // Row 3: text content + CTAs (single column cell holding all elements)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-light-withimg-1', cells });
  element.replaceWith(block);
}
