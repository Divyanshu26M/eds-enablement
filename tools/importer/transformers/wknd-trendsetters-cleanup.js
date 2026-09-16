/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * Removes non-authorable site chrome and helper markup.
 * Reused across content-landing and listing-index templates.
 * All selectors verified against migration-work/cleaned.html.
 *
 * NOTE: the hero is authored as <header class="section secondary-section">
 * INSIDE <main id="main-content">, so `header` is NOT removed generically —
 * only the specific chrome selectors below are targeted.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-authorable elements that would otherwise interfere with block parsing.
    // .breadcrumbs sits inside the feature-row section (columns-image-text) —
    // remove before parsing so it is not captured into the block.
    // Verified in cleaned.html: <div class="breadcrumbs"> ... </div>
    WebImporter.DOMUtils.remove(element, [
      '.breadcrumbs',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Site chrome — not authorable page content.
    // Verified in cleaned.html:
    //   <a href="#main-content" class="skip-link"> (skip link)
    //   <div class="navbar"> ... </div>          (top navigation + mega menu)
    //   <footer class="footer inverse-footer">    (site footer)
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      '.navbar',
      'nav.nav-menu',
      'footer.footer',
      'footer',
    ]);

    // Safe non-authorable leftovers if present.
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'noscript',
      'link',
      'source',
    ]);
  }
}
