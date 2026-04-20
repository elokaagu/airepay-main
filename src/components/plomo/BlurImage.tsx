import { useState, type ImgHTMLAttributes } from "react";

interface BlurImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /**
   * Aspect ratio container class — e.g. "aspect-[4/3]" or "aspect-square".
   * Optional: omit if the parent already constrains the dimensions.
   */
  aspect?: string;
  /**
   * Tailwind classes for the wrapper div.
   */
  wrapperClassName?: string;
  /**
   * If true, eagerly load (use for above-the-fold/LCP images). Defaults to false (lazy).
   */
  eager?: boolean;
}

/**
 * Image with lazy-loading, async decoding, and a soft blur-up fade-in.
 *
 * The image starts blurred and slightly scaled, fading to crisp once loaded.
 * A neutral surface placeholder fills the box until the bitmap paints.
 */
export function BlurImage({
  src,
  alt,
  aspect,
  wrapperClassName = "",
  eager = false,
  className = "",
  width,
  height,
  ...rest
}: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={[
        "relative overflow-hidden bg-surface-2",
        aspect ?? "",
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Subtle shimmer placeholder under the image */}
      <div
        aria-hidden
        className={[
          "absolute inset-0 bg-gradient-to-br from-surface-2 via-surface to-surface-2",
          "transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        className={[
          "h-full w-full object-cover",
          "transition-[filter,opacity,transform] duration-[800ms] ease-out",
          loaded
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-xl scale-[1.04]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    </div>
  );
}
