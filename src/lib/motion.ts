/**
 * Whether the environment asks for reduced motion.
 *
 * The CSS side of this preference lives in `App.css` under
 * `@media (prefers-reduced-motion: reduce)`, but CSS cannot reach a scroll that JavaScript
 * requests explicitly: `scrollIntoView({ behavior: 'smooth' })` overrides the stylesheet's
 * `scroll-behavior`, so the animated scroll has to be opted out of in script.
 *
 * Guarded rather than called directly, because `matchMedia` is not universally present —
 * jsdom, the unit-test environment, does not implement it. Absent support means no stated
 * preference, which is the same answer as no preference stated.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
