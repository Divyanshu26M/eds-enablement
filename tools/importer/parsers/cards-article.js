/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article
 * Base block: cards
 * Source: https://wknd-trendsetters.site/ (content-landing template, latest articles)
 *
 * Library structure (Cards): 2 columns, multiple rows. First row = block name.
 * Each subsequent row is a card: image/icon in cell 1, text content in cell 2.
 *
 * Source variants:
 *  - listing/blog: each card is <a class="article-card"> holding
 *    .article-card-image img and .article-card-body (meta tag/date + h3 title).
 *  - trends grid:  each card is <a class="trend-card"> holding
 *    .trend-card-image img and .trend-card-body (tag + h3 + text).
 *
 * Robustness note: these source cards are anchors that wrap block-level <div>s,
 * which is invalid HTML. A spec-compliant browser (Chromium, unlike jsdom)
 * collapses adjacent such anchors, dropping all but the first card's <a> wrapper
 * while KEEPING the inner .*-image / .*-body divs. So we don't rely on the card
 * anchors: we pair each image block with its following body block, which
 * survives the collapse. The card link is recovered from whichever anchor still
 * wraps the image/body (or the body's own first link).
 */
export default function parse(element, { document }) {
  // Resolve the grid whether element is the container/wrapper or the grid itself
  const grid = element.classList && element.classList.contains('grid-layout')
    ? element
    : element.querySelector('.grid-layout');
  const scope = grid || element;

  const IMAGE_SEL = '.article-card-image, .trend-card-image';
  const BODY_SEL = '.article-card-body, .trend-card-body';

  const cells = [];

  // Primary strategy: pair image blocks with body blocks. This works whether or
  // not the card anchors survived, because the inner divs always do.
  const imageBlocks = Array.from(scope.querySelectorAll(IMAGE_SEL));
  const bodyBlocks = Array.from(scope.querySelectorAll(BODY_SEL));

  const buildTextCell = (body, href) => {
    const textCell = [];
    if (!body) return textCell;
    // Meta row (tag + date)
    const meta = body.querySelector('.article-card-meta, .tag');
    if (meta) textCell.push(meta);
    // Title — wrap in a link to preserve the card's destination
    const title = body.querySelector('h1, h2, h3, h4, [class*="heading"]');
    if (title) {
      const cardHref = href
        || (title.querySelector('a') && title.querySelector('a').getAttribute('href'))
        || (body.querySelector('a') && body.querySelector('a').getAttribute('href'));
      if (cardHref) {
        const link = document.createElement('a');
        link.href = cardHref;
        link.append(...title.childNodes);
        const wrappedTitle = title.cloneNode(false);
        wrappedTitle.append(link);
        textCell.push(wrappedTitle);
      } else {
        textCell.push(title);
      }
    }
    // Description paragraph(s) — any body paragraph that isn't the meta/tag row.
    body.querySelectorAll('p').forEach((p) => {
      if (p === meta) return;
      if (p.classList.contains('tag') || p.querySelector('.tag')) return;
      if (p.textContent.trim()) textCell.push(p);
    });
    return textCell;
  };

  if (imageBlocks.length && imageBlocks.length === bodyBlocks.length) {
    imageBlocks.forEach((imageBlock, i) => {
      const body = bodyBlocks[i];
      const img = imageBlock.querySelector('img');
      // Recover the destination from the nearest surviving anchor.
      const anchor = imageBlock.closest('a') || (body && body.closest('a'));
      const href = anchor ? anchor.getAttribute('href') : null;
      cells.push([img || '', buildTextCell(body, href)]);
    });
  } else {
    // Fallback: treat each card wrapper as one card (clean, non-collapsed DOM).
    let cardEls = Array.from(scope.querySelectorAll(
      'a.article-card, .article-card, a.trend-card, .trend-card',
    ));
    if (cardEls.length === 0) {
      cardEls = Array.from(scope.querySelectorAll(':scope > a, :scope > div'));
    }
    cardEls.forEach((cardEl) => {
      const img = cardEl.querySelector(`${IMAGE_SEL.split(',').map((s) => `${s} img`).join(', ')}, img`);
      const body = cardEl.querySelector(BODY_SEL) || cardEl;
      const href = cardEl.getAttribute('href');
      cells.push([img || '', buildTextCell(body, href)]);
    });
  }

  // Empty-block guard
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
