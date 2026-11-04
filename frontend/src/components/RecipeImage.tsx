import { useState, type ImgHTMLAttributes } from 'react';
import { RECIPE_PLACEHOLDER } from '../recipe-media';

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string };
export function RecipeImage({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  loading = 'lazy',
  ...props
}: Props) {
  const [loadedSrc, setLoadedSrc] = useState('');
  const [failedSrc, setFailedSrc] = useState('');
  const actualSrc = failedSrc === src ? RECIPE_PLACEHOLDER : src;
  return (
    <img
      {...props}
      src={actualSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      className={`cookora-image ${className}`.trim()}
      data-loading={loadedSrc !== actualSrc}
      ref={(image) => {
        if (image?.complete && image.naturalWidth > 0 && loadedSrc !== actualSrc) setLoadedSrc(actualSrc);
      }}
      onLoad={(event) => {
        setLoadedSrc(actualSrc);
        onLoad?.(event);
      }}
      onError={(event) => {
        if (actualSrc !== RECIPE_PLACEHOLDER) setFailedSrc(src);
        else setLoadedSrc(actualSrc);
        onError?.(event);
      }}
    />
  );
}
