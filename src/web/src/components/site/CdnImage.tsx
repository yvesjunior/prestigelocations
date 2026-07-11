import { imageUrl } from "@/lib/images";

/**
 * Image servie par ImageKit (srcset 1x/2x, lazy par défaut) avec repli sur un
 * asset bundlé quand la clé est absente ou que le CDN n'est pas configuré.
 */
export function CdnImage({
  imageKey,
  fallbackSrc,
  alt,
  width,
  height,
  className,
  loading = "lazy",
}: {
  imageKey: string | null | undefined;
  fallbackSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const src = imageUrl(imageKey, { w: width });
  const src2x = imageUrl(imageKey, { w: width * 2 });
  return (
    <img
      src={src ?? fallbackSrc}
      srcSet={src && src2x ? `${src} 1x, ${src2x} 2x` : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      className={className}
    />
  );
}
