/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-testimonial
 * Base block: tabs
 * Source: https://wknd-trendsetters.site/ (content-landing template, testimonials)
 * Generated: 2026-09-15
 *
 * Library structure (Tabs): 2 columns, multiple rows. First row = block name.
 * Each subsequent row is a tab: label cell (cell 1) + content cell (cell 2).
 *
 * Source variant: a `.tabs-content` region with N `.tab-pane` panels (photo +
 * name/role + quote) and a `.tab-menu` region with N buttons (avatar + name/
 * role). Pair each menu button (label) with its matching pane (content) by index.
 */
export default function parse(element, { document }) {
  // element may be the .tabs-wrapper or the .tabs-content itself
  const wrapper = element.classList && element.classList.contains('tabs-wrapper')
    ? element
    : (element.closest('.tabs-wrapper') || element);

  const panes = Array.from(wrapper.querySelectorAll('.tabs-content > .tab-pane'));
  const menuButtons = Array.from(wrapper.querySelectorAll('.tab-menu > button, .tab-menu .tab-menu-link'));

  // Empty-block guard
  if (panes.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  panes.forEach((pane, i) => {
    // Label: prefer the corresponding tab-menu button's inner content; fall back
    // to a generated label if menu buttons are unavailable.
    const menuButton = menuButtons[i];
    let labelCell;
    if (menuButton) {
      labelCell = menuButton.querySelector(':scope > div') || menuButton;
    } else {
      labelCell = `Tab ${i + 1}`;
    }
    cells.push([labelCell, pane]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-testimonial', cells });
  element.replaceWith(block);
}
