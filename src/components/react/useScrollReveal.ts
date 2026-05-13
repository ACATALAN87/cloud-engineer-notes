import { useEffect } from 'react';

/**
 * useScrollReveal
 *
 * Initializes a single IntersectionObserver that watches every `.reveal`
 * element on the page and toggles `.is-visible` when it scrolls into view.
 *
 * Designed to be mounted once per page (e.g. by the Header which is always
 * client:load). Safe to call multiple times — it bails if already initialized.
 *
 * Respects prefers-reduced-motion: in that case, all reveals are made
 * visible immediately with no animation.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Avoid duplicate observers across multiple components
    const w = window as unknown as { __cloudfolio_reveal_initialized?: boolean };
    if (w.__cloudfolio_reveal_initialized) return;
    w.__cloudfolio_reveal_initialized = true;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const reveal = (el: Element) => el.classList.add('is-visible');

    if (reduce) {
      document.querySelectorAll<HTMLElement>('.reveal').forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      {
        root:       null,
        rootMargin: '0px 0px -10% 0px',
        threshold:  0.08,
      }
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>('.reveal:not(.is-visible)')
        .forEach((el) => observer.observe(el));
    };

    observeAll();

    // Re-scan on DOM mutations (covers React hydration of additional sections)
    const mo = new MutationObserver(() => observeAll());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      w.__cloudfolio_reveal_initialized = false;
    };
  }, []);
}
