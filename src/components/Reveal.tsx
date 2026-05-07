'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number; // ms — staggers items in a list
  /** Distance the element rises from while fading in. Default 24px. */
  offset?: number;
}

/**
 * Wrap any content to fade + rise into view the first time it scrolls into
 * the viewport. Uses IntersectionObserver and pure CSS transitions, so no
 * external animation library is needed. Respects prefers-reduced-motion via
 * `motion-reduce:` Tailwind variants.
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  offset = 24,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? undefined : `translateY(${offset}px)`,
      }}
      className={`transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
