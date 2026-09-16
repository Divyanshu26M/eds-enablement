/*
 * Columns (image + text) variant
 * Two-column feature row: a large image beside a text column (breadcrumb /
 * heading / byline). Forked variant of the base columns block.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1) {
        col.classList.add('columns-image-text-img');
      } else {
        col.classList.add('columns-image-text-body');
      }
    });
  });
}
