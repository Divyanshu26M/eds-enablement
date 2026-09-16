/* eslint-disable */
/* global WebImporter */
/**
 * Parser for banner-dark-overlay
 * Base block: banner (custom — not in the standard block library)
 * Source: https://wknd-trendsetters.site/ (content-landing template, CTA banner)
 * Generated: 2026-09-15
 *
 * No library description was available for the "banner" base block, so structure
 * is inferred from the variant metadata and source HTML:
 *   "background image + heading + text + CTA" — a full-bleed banner with a dark
 *   overlay and overlaid content.
 *
 * Modeled as a single-column block (like hero):
 *   Row 1: block name
 *   Row 2: background image
 *   Row 3: heading + subheading/text + CTA(s)
 *
 * Source: a `.grid-layout` wrapping a relative container with a background
 * `img.cover-image.utility-overlay`, an `.overlay` element, and a `.card-body`
 * holding the heading (h2), paragraph, and a `.button-group` with the CTA.
 */
export default function parse(element, { document }) {
  // element may be the grid-layout or the .overlay; resolve a scope that contains
  // both the background image and the card-body content.
  let scope = element;
  if (element.classList && element.classList.contains('overlay')) {
    scope = element.closest('.grid-layout') || element.parentElement || element;
  }

  // Background image (the full-bleed cover image behind the overlay)
  const bgImage = scope.querySelector('img.utility-overlay, img.cover-image, img');
  // Content container
  const body = scope.querySelector('.card-body') || scope;
  const heading = body.querySelector('h1, h2, h3, [class*="heading"]');
  const description = body.querySelector('p, .subheading, [class*="subheading"]');
  const ctaLinks = Array.from(body.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard
  if (!heading && !description && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image
  if (bgImage) cells.push([bgImage]);

  // Row 3: content (single-column cell holding all elements)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner-dark-overlay', cells });
  element.replaceWith(block);
}
