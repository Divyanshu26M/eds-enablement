/*
 * Accordion (FAQ) variant
 * Expandable Q&A rows built from authored label/body pairs.
 * Forked variant of the base accordion block.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-label';
    summary.append(...label.childNodes);

    const body = row.children[1];
    body.className = 'accordion-faq-body';

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
