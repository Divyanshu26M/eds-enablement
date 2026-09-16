/*
 * Hero (minimal light) variant
 * Text-only hero: heading + supporting paragraph + CTA(s), left-aligned
 * on a light background. Forked variant of the base hero block.
 */
export default function decorate(block) {
  const content = block.querySelector(':scope > div > div') || block.querySelector(':scope > div');
  if (content) content.classList.add('hero-minimal-light-content');
}
