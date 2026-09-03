/**
 * Banner block — image + title text with an optional background color.
 * Content model (rows, order-independent):
 *   - image      (may arrive as <img> inside <p> per the EDS image gotcha)
 *   - title text (heading)
 *   - background color (optional): a CSS color value, e.g. "#1a4a7a", "navy",
 *     "rgb(20 60 90)". Defaults to blue (see banner.css) when omitted.
 * Variant: "banner (dark)" → .banner.dark preset dark look.
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

  const nonImageRows = rows.filter((row) => !row.querySelector('img'));

  // Detect an optional color row: a cell whose only content is a valid CSS
  // color value and no heading/link/image.
  const isColor = (value) => !!value
    && CSS.supports('background-color', value)
    && value.toLowerCase() !== 'transparent';
  const colorRow = nonImageRows.find((row) => {
    if (row.querySelector('h1, h2, h3, h4, h5, h6, a, img')) return false;
    return isColor(row.textContent.trim());
  });
  if (colorRow) {
    block.style.setProperty('--banner-bg', colorRow.textContent.trim());
  }

  // The remaining non-image, non-color row holds the title.
  const titleRow = nonImageRows.find((row) => row !== colorRow);
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
