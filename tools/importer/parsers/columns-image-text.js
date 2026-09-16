/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-image-text
 * Base block: columns
 * Source: https://wknd-trendsetters.site/ (content-landing template, section 1)
 * Generated: 2026-09-15
 *
 * Library structure (Columns): first row = block name; subsequent rows have
 * one cell per column. Column count derived from source: a two-column feature
 * row — an image column and a text column (breadcrumbs + heading + byline).
 */
export default function parse(element, { document }) {
  // Resolve the grid whether element is the container or the grid itself
  const grid = element.classList && element.classList.contains('grid-layout')
    ? element
    : element.querySelector('.grid-layout');
  const scope = grid || element;

  // The grid's direct children are the columns
  const columns = Array.from(scope.querySelectorAll(':scope > div'));

  // Empty-block guard
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One row, each column becomes a cell
  const cells = [columns];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text', cells });
  element.replaceWith(block);
}
