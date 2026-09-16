/*
 * Columns (contact) variant
 * Text-only two-column layout: an intro column (heading + text) beside a
 * stacked contact list (Email / Phone / Address). Forked variant of columns.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col, i) => {
      col.classList.add(i === 0 ? 'columns-contact-intro' : 'columns-contact-details');
    });
  });
}
