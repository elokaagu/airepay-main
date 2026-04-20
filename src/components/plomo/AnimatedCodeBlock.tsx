import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  code: string;
  /** Total typing duration in seconds, regardless of length. Defaults to 2.4s. */
  duration?: number;
  /** Re-trigger every time the block re-enters the viewport. */
  replay?: boolean;
  className?: string;
};

/**
 * AnimatedCodeBlock — types out a snippet character-by-character when it
 * scrolls into view, with a blinking caret. Honors prefers-reduced-motion.
 */
export function AnimatedCodeBlock({
  code,
  duration = 2.4,
  replay = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLPreElement>(null);
  const inView = useInView(ref, { once: !replay, amount: 0.3 });
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(code.length);
      setDone(true);
      return;
    }
    setShown(0);
    setDone(false);
    const total = code.length;
    const interval = Math.max(8, (duration * 1000) / Math.max(total, 1));
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= total) {
        window.clearInterval(id);
        setDone(true);
      }
    }, interval);
    return () => window.clearInterval(id);
  }, [inView, code, duration]);

  return (
    <pre
      ref={ref}
      className={`overflow-x-auto whitespace-pre font-mono ${className}`}
      aria-label="Animated code sample"
    >
      <code>{code.slice(0, shown)}</code>
      <motion.span
        aria-hidden
        className="ml-0.5 inline-block w-[0.5ch] -translate-y-[1px] bg-orange align-middle"
        style={{ height: "1em" }}
        animate={{ opacity: done ? [1, 0, 1] : 1 }}
        transition={
          done
            ? { duration: 1, repeat: Infinity, ease: "linear" }
            : { duration: 0 }
        }
      />
    </pre>
  );
}
