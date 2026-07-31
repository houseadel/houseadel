import { forwardRef, type ImgHTMLAttributes } from "react";
import type { World } from "../data/review";

type WorldImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  world: World;
  sizes?: string;
};

export const WorldImage = forwardRef<HTMLImageElement, WorldImageProps>(function WorldImage(
  { world, sizes = "100vw", alt = world.alt, ...props },
  ref,
) {
  return (
    <picture className="world-picture">
      <source srcSet={world.avifSrcSet} sizes={sizes} type="image/avif" />
      <source srcSet={world.webpSrcSet} sizes={sizes} type="image/webp" />
      <img
        {...props}
        ref={ref}
        src={world.image}
        srcSet={world.webpSrcSet}
        sizes={sizes}
        width={1440}
        height={810}
        alt={alt}
      />
    </picture>
  );
});
