/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact
 * Base block: columns
 * Source: https://wknd-trendsetters.site/faq
 * Generated: 2026-09-16
 *
 * Structure: a two-column "Let's connect" section.
 *  - Left column  = intro (H2 heading + paragraph)
 *  - Right column = a contact list (contact-items) of label/value pairs
 *    (Email/Phone/Address; mailto:/tel: links and an address paragraph)
 * Emits a columns-contact block table with the two columns as two cells in one row,
 * preserving the contact list markup and mailto:/tel: hrefs.
 */
export default function parse(element, { document }) {
  // The block selector may resolve to the .grid-layout wrapper directly, or to
  // an ancestor container. Normalize to the grid wrapper that holds the columns.
  const grid = element.matches('.grid-layout')
    ? element
    : element.querySelector('.grid-layout') || element;

  // Direct child columns of the grid. Source has exactly two:
  // [0] intro column, [1] contact column.
  const columns = Array.from(grid.querySelectorAll(':scope > div'));

  // Left / intro column: prefer the column that contains the heading.
  const introCol = columns.find((c) => c.querySelector('h1, h2, h3, h4, h5, h6, p'))
    || columns[0];

  // Right / contact column: the column holding the contact list.
  const contactList = grid.querySelector('.contact-items');
  const contactCol = contactList
    ? (contactList.closest(':scope > div') || contactList)
    : columns.find((c) => c !== introCol);

  // Build the intro cell: keep heading + paragraph(s) as authored.
  const introCell = [];
  if (introCol) {
    const introNodes = Array.from(introCol.querySelectorAll('h1, h2, h3, h4, h5, h6, p'));
    if (introNodes.length) {
      introCell.push(...introNodes);
    } else {
      introCell.push(...introCol.childNodes);
    }
  }

  // Build the contact cell: preserve the contact-items list markup (labels,
  // mailto:/tel: links, address paragraph). Reference the container element so
  // the label/value structure and hrefs are kept intact.
  const contactCell = [];
  if (contactList) {
    contactCell.push(contactList);
  } else if (contactCol) {
    contactCell.push(...contactCol.childNodes);
  }

  // Empty-block guard: bail gracefully if neither column has content.
  if (!introCell.length && !contactCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // One content row, two columns (intro | contacts).
  const cells = [[introCell, contactCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);
}
