# Accessibility checklist

## Structure and navigation

- Keep all core content, destinations, labels, and controls in semantic HTML.
- Provide a skip link, landmarks, logical headings, and a predictable focus order.
- Make every route and primary action usable before animation completes.
- Preserve native links, browser history, deep links, and Back/Forward behavior.
- Show visible focus and keep interactive targets at least 44 by 44 CSS pixels where practical.

## Responsive interaction

- Give hover interactions equivalent focus behavior and a normal-flow mobile alternative.
- Do not replace the cursor or block native scrolling, zooming, text selection, or browser gestures.
- Verify 1440 × 900, 1024 × 768, 430 × 932, and 390 × 844 with no horizontal overflow.
- Test keyboard-only navigation, touch, orientation or resize, and open navigation states.

## Content and media

- Give informative images specific alternative text; mark truly decorative media explicitly.
- Never place essential text only in canvas, an image, animation, color, hover, or sound.
- Maintain sufficient contrast across image, translucent, and animated states.
- Preserve meaning under forced colors and reduced transparency where practical.

## Motion and forms

- Respect reduced motion without removing information or functionality.
- Associate every field with a visible label, useful description, and meaningful error.
- Move focus intentionally after route, validation, review, and submission state changes.
- Do not require a long narrative; allow uncertainty where the form offers “Not sure yet.”
- Announce loading, errors, and confirmed submissions without deceptive success states.

## Verification

- Test at 200% zoom and with the keyboard before relying on automated checks.
- Run automated accessibility checks, but treat them as evidence rather than proof of accessibility.
