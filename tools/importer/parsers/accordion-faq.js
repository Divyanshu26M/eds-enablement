/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq
 * Base block: accordion
 * Source: https://wknd-trendsetters.site/ (content-landing template, FAQ)
 * Generated: 2026-09-15
 *
 * Library structure (Accordion): 2 columns, multiple rows. First row = block name.
 * Each subsequent row is an item: title cell (cell 1) + content cell (cell 2).
 *
 * Source variant: a `.faq-list` of <details class="faq-item"> elements, each
 * with a <summary class="faq-question"> holding the question text (in a <span>)
 * and a <div class="faq-answer"> holding the answer body.
 */
export default function parse(element, { document }) {
  // element may be the grid-layout or the .accordion / faq-list wrapper
  const list = element.querySelector('.faq-list') || element;

  const items = Array.from(list.querySelectorAll(':scope > details.faq-item, details.faq-item'));

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    // Title: the question text inside the summary (span), fall back to summary text
    const summary = item.querySelector('summary.faq-question, summary');
    const titleEl = summary ? (summary.querySelector('span') || summary) : null;
    // Content: the answer body
    const answer = item.querySelector('.faq-answer');
    cells.push([titleEl || '', answer || '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
