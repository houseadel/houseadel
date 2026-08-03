import type { ArchivalAsset } from "../../data/archivalAssets";
import styles from "./ArchivalImage.module.css";

type ArchivalImageProps = {
  asset: ArchivalAsset;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
  sizes?: string;
};

export function ArchivalImage({
  asset,
  alt = asset.alt,
  className,
  loading = "lazy",
  sizes = "(max-width: 48rem) 100vw, 50vw",
}: ArchivalImageProps) {
  return (
    <picture className={`${styles.picture} ${className ?? ""}`}>
      <source srcSet={asset.avif} type="image/avif" />
      <img
        src={asset.webp}
        alt={alt}
        loading={loading}
        decoding="async"
        sizes={sizes}
      />
    </picture>
  );
}

