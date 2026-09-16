/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero (option: minimal-light-withimg)
 * Base block: hero
 * Source: https://wknd-trendsetters.site/blog/ace-pro-court-polo
 * Generated: 2026-09-16
 *
 * Article-header hero: a two-column source layout (cover image + content) that
 * maps onto the 1-column hero block table.
 *   Row 1: block name + option -> emitted via createBlock name 'hero (minimal-light-withimg)'
 *   Row 2: cover/background image
 *   Row 3: content (breadcrumbs, H1 title, byline, date/read-time, category tag)
 */
export default function parse(element, { document }) {
  // Cover image (row 2). Prefer the explicit cover image, fall back to first raster img.
  const coverImage = element.querySelector('img.cover-image, img[class*="cover"], img[class*="hero"], img');

  // Content pieces (row 3)
  const breadcrumbs = element.querySelector('.breadcrumbs, nav[class*="breadcrumb"]');
  const heading = element.querySelector('h1, h2, [class*="heading"]');
  const tag = element.querySelector('.tag, [class*="tag"]');
  // Byline + date/read-time meta groups (each rendered as a horizontal flex row).
  const metaGroups = Array.from(element.querySelectorAll(':scope > div > div > .flex-horizontal, .flex-horizontal'));

  // Build the single content cell in document order.
  const contentCell = [];
  if (breadcrumbs) contentCell.push(breadcrumbs);
  if (heading) contentCell.push(heading);
  metaGroups.forEach((el) => {
    if (!contentCell.includes(el)) contentCell.push(el);
  });
  if (tag) contentCell.push(tag);

  // Empty-block guard: bail gracefully if there is nothing meaningful to emit.
  if (!heading && contentCell.length === 0 && !coverImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (coverImage) cells.push([coverImage]); // Row 2: background/cover image
  cells.push([contentCell]);                // Row 3: single cell holding all content elements

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero (minimal-light-withimg)', cells });
  element.replaceWith(block);
}
