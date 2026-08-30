/**
 * Banner block — image + title text with a default deep-blue look.
 * Content model (two rows):
 *   row 1: image (may arrive as <img> inside <p> per the EDS image gotcha)
 *   row 2: title text (heading)
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Locate the image anywhere in the block: prefer an existing <picture>,
  // fall back to a bare <img> (EDS only wraps <img> in <picture> when it is a
  // direct child of a <div>; imported images inside <p> stay bare).
  let picture = block.querySelector('picture');
  if (!picture) {
    const img = block.querySelector('img');
    if (img) {
      picture = document.createElement('picture');
      picture.append(img);
    }
  }

  // The title cell is the row that has no image.
  const titleRow = rows.find((row) => !row.querySelector('img'));
  const content = document.createElement('div');
  content.className = 'banner-content';
  if (titleRow) {
    const cell = titleRow.querySelector(':scope > div') || titleRow;
    content.append(...cell.childNodes);
  }

  // Rebuild the block: background image layer (if any) + content layer.
  block.textContent = '';
  if (picture) {
    const imageLayer = document.createElement('div');
    imageLayer.className = 'banner-image';
    imageLayer.append(picture);
    block.append(imageLayer);
  }
  block.append(content);
}
