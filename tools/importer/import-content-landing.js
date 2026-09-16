/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMinimalLightWithimg1Parser from './parsers/hero-minimal-light-withimg-1.js';
import columnsImageTextParser from './parsers/columns-image-text.js';
import cardsImageGridParser from './parsers/cards-image-grid.js';
import tabsTestimonialParser from './parsers/tabs-testimonial.js';
import cardsArticleParser from './parsers/cards-article.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import bannerDarkOverlayParser from './parsers/banner-dark-overlay.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-minimal-light-withimg-1': heroMinimalLightWithimg1Parser,
  'columns-image-text': columnsImageTextParser,
  'cards-image-grid': cardsImageGridParser,
  'tabs-testimonial': tabsTestimonialParser,
  'cards-article': cardsArticleParser,
  'accordion-faq': accordionFaqParser,
  'banner-dark-overlay': bannerDarkOverlayParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'content-landing',
  description: 'Landing page with a large hero and stacked content sections',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
  ],
  blocks: [
    { name: 'hero-minimal-light-withimg-1', instances: ['#main-content > header.section.secondary-section .grid-layout', '#main-content > header.section.secondary-section > div.container'] },
    { name: 'columns-image-text', instances: ['#main-content > section.section:nth-of-type(1) .grid-layout', '#main-content > section.section:nth-of-type(1) > div.container'] },
    { name: 'cards-image-grid', instances: ['#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.grid-layout'] },
    { name: 'tabs-testimonial', instances: ['#main-content > section.section:nth-of-type(3) div.tabs-wrapper', '#main-content > section.section:nth-of-type(3) .tabs-content'] },
    { name: 'cards-article', instances: ['#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.grid-layout'] },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(5) > div.container > div.grid-layout', '#main-content > section.section:nth-of-type(5) .accordion'] },
    { name: 'banner-dark-overlay', instances: ['#main-content > section.section.inverse-section .grid-layout', '#main-content > section.section.inverse-section .overlay'] },
  ],
  sections: [
    { id: 'rc1', name: 'hero', selector: ['#main-content > header.section.secondary-section'], style: 'light', blocks: ['hero-minimal-light-withimg-1'], defaultContent: [] },
    { id: 'rc2', name: 'feature-row', selector: ['#main-content > section.section:nth-of-type(1)'], style: null, blocks: ['columns-image-text'], defaultContent: [] },
    { id: 'rc3', name: 'snapshot-gallery', selector: ['#main-content > section.section.secondary-section:nth-of-type(2)'], style: 'light', blocks: ['cards-image-grid'], defaultContent: ['#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.utility-text-align-center.utility-margin-bottom-8rem'] },
    { id: 'rc4', name: 'testimonials', selector: ['#main-content > section.section:nth-of-type(3)'], style: null, blocks: ['tabs-testimonial'], defaultContent: [] },
    { id: 'rc5', name: 'latest-articles', selector: ['#main-content > section.section.secondary-section:nth-of-type(4)'], style: 'light', blocks: ['cards-article'], defaultContent: ['#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.utility-text-align-center'] },
    { id: 'rc6', name: 'faq', selector: ['#main-content > section.section:nth-of-type(5)'], style: null, blocks: ['accordion-faq'], defaultContent: ['#main-content > section.section:nth-of-type(5) > div.container > div.utility-text-align-center'] },
    { id: 'rc7', name: 'cta-banner', selector: ['#main-content > section.section.inverse-section'], style: 'dark', blocks: ['banner-dark-overlay'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY (section transformer runs after cleanup, in afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Deduplicates when multiple candidate selectors resolve to the same element.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Discover blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
